import {TASK_COMPLETE, TASK_FAILED, TASK_IN_PROGRESS, TASK_NEW} from "../shared/taskStates";
import {
    EXCHANGE_COMPLETE_NWC,
    QUEUE_COMPLETE_NWC,
    EXCHANGE_COMPLETE_RVT,
    QUEUE_COMPLETE_RVT,
    QUEUE_ERROR_NWC,
    QUEUE_ERROR_RVT, QUEUE_IN_PROGRESS_NWC, QUEUE_IN_PROGRESS_RVT,
    EXCHANGE_NWC_TASK,
    EXCHANGE_RVT_TASK
} from "../shared/queueNames";

const nconf = require('nconf');
const amqp = require('amqplib');
const uuid = require("uuid");
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

const {ExportRvtTask, ConvertNwcTask} = require('./mongo');

nconf.file('config.json');
nconf.required(['rvtResultPath', 'nwcResultPath']);
const rvtResutlPath = nconf.get('rvtResultPath');
const nwcResultath = nconf.get('nwcResultPath');

class TaskManager {

    constructor() {
        this.queueServer = '10.177.100.84';
        this.clients = {};
        this.init();
    }

    async init() {
        const conn = await amqp.connect(`amqp://${this.queueServer}`);

        await this.handleExport(conn);
        await this.handleComplete(conn);
        await this.handleErrors(conn);
        await this.handleInProgress(conn);
    }

    async handleExport(conn) {
        this.exportRvtChannel = await conn.createChannel();
        await this.setExchange(this.exportRvtChannel, EXCHANGE_RVT_TASK);

        this.convertNwcChannel = await conn.createChannel();
        await this.setExchange(this.convertNwcChannel, EXCHANGE_NWC_TASK);
    }

    async handleComplete(conn) {
        this.completeNwcChannel = await conn.createChannel();
        await this.setExchange(this.completeNwcChannel, EXCHANGE_COMPLETE_NWC, QUEUE_COMPLETE_NWC, async (msg) => {
            await this.onNwcTaskComplete(msg);
            this.completeNwcChannel.ack(msg);
            const task = await this.getNwcTask(msg);
            this.sendTaskMessage({task, type: 'nwc', errorMessage: null}, TASK_COMPLETE);
        });

        this.completeRvtChannel = await conn.createChannel();
        await this.setExchange(this.completeRvtChannel, EXCHANGE_COMPLETE_RVT, QUEUE_COMPLETE_RVT, async (msg) => {
            await this.onRvtTaskComplete(msg);
            this.completeRvtChannel.ack(msg);
            const task = await this.getRvtTask(msg);
            if (task.forUser) this.sendTaskMessage({task, type: 'rvt', errorMessage: null}, TASK_COMPLETE);
        });
    }

    async handleErrors(conn) {
        this.errorRvtChannel = await conn.createChannel();
        await this.setExchange(this.errorRvtChannel, EXCHANGE_COMPLETE_RVT, QUEUE_ERROR_RVT, async (msg) => {
            const obj = await this.getRvtErrorTask(msg);
            obj.task.status = TASK_FAILED;
            await obj.task.save();
            this.sendTaskMessage(obj, TASK_FAILED);
        });

        this.errorNwcChannel = await conn.createChannel();
        await this.setExchange(this.errorNwcChannel, EXCHANGE_COMPLETE_NWC, QUEUE_ERROR_NWC, async (msg) => {
            const obj = await this.getNwcErrorTask(msg);
            obj.task.status = TASK_FAILED;
            await obj.task.save();
            this.sendTaskMessage(obj, TASK_FAILED);
        });
    }

    async handleInProgress() {
        const inProgressRvtQueue = await this.exportRvtChannel.assertQueue(QUEUE_IN_PROGRESS_RVT, {});
        this.exportRvtChannel.bindQueue(inProgressRvtQueue.queue, EXCHANGE_RVT_TASK, QUEUE_IN_PROGRESS_RVT);
        this.exportRvtChannel.consume(inProgressRvtQueue.queue, async (msg) => {
            const str = decoder.write(msg.content);
            const {id} = JSON.parse(str);
            let task = await ExportRvtTask.findOne({id});
            if (task) {
                task.status = TASK_IN_PROGRESS;
                await task.save();
                this.exportRvtChannel.ack(msg);
                this.sendTaskMessage({task}, TASK_IN_PROGRESS);
            }
        });

        const inProgressNwcQueue = await this.convertNwcChannel.assertQueue(QUEUE_IN_PROGRESS_NWC, {});
        this.convertNwcChannel.bindQueue(inProgressNwcQueue.queue, EXCHANGE_NWC_TASK, QUEUE_IN_PROGRESS_NWC);
        this.convertNwcChannel.consume(inProgressNwcQueue.queue, async (msg) => {
            const str = decoder.write(msg.content);
            const {id} = JSON.parse(str);
            let task = await ConvertNwcTask.findOne({id});
            if (task) {
                task.status = TASK_IN_PROGRESS;
                await task.save();
                this.convertNwcChannel.ack(msg);
                this.sendTaskMessage({task}, TASK_IN_PROGRESS);
            }
        });
    }

    async setExchange(channel, exchangeName, queueName, consumeCallback) {
        channel.assertExchange(exchangeName, 'direct', {durable: true});
        if (queueName && consumeCallback) {
            const queue = await channel.assertQueue(queueName, {});
            channel.bindQueue(queue.queue, exchangeName, queueName);
            channel.consume(queue.queue, async (msg) => consumeCallback(msg));
        }
    }

    async exportRvt(server, owner, serverModelPath, forUser) {
        const serverModelName = serverModelPath.slice(serverModelPath.lastIndexOf('\\') + 1, serverModelPath.length);
        const id = uuid();
        const task = {
            id,
            date: Date.now(),
            name: serverModelName,
            serverModelPath,
            resultPath: `${rvtResutlPath}/${id}.rvt`,
            server,
            owner,
            forUser,
            status: TASK_NEW
        };

        await ExportRvtTask.create(task);

        this.exportRvtChannel.publish(EXCHANGE_RVT_TASK, server, new Buffer(JSON.stringify({
            id: task.id,
            serverModelPath: task.serverModelPath
        })));

        return task;
    }

    async convertNwc(owner, serverModelPath, rvtModelPath, name) {
        const rvtModelName = rvtModelPath.slice(rvtModelPath.lastIndexOf('/'), rvtModelPath.length);
        const task = {
            id: uuid(),
            date: Date.now(),
            name,
            serverModelPath,
            rvtModelPath,
            resultPath: `${nwcResultath}${rvtModelName.replace('.rvt', '.nwc')}`,
            owner,
            status: TASK_NEW
        };

        await ConvertNwcTask.create(task);

        this.convertNwcChannel.publish(EXCHANGE_NWC_TASK, 'CPU', new Buffer(JSON.stringify({
            id: task.id,
            rvtModelPath: task.rvtModelPath
        })));

        return task;
    }

    async onRvtTaskComplete(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);

        const query = ExportRvtTask.findOne({id: id});
        let task = await query.exec();
        task.status = TASK_COMPLETE;
        const updatedTask = await task.save();
        if (!updatedTask.forUser) await this.convertNwc(updatedTask.owner, updatedTask.serverModelPath, updatedTask.resultPath, task.name.replace('.rvt', '.nwc'));
    }

    async onNwcTaskComplete(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);

        const query = ConvertNwcTask.findOne({id: id});
        let task = await query.exec();
        task.status = TASK_COMPLETE;
        await task.save();
    }

    addClient(id, socket) {
        this.clients[id] = socket;
    }

    async getRvtTask(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);
        const query = ExportRvtTask.findOne({id: id});
        return await query.exec();
    }

    async getNwcTask(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);
        const query = ConvertNwcTask.findOne({id: id});
        return await query.exec();
    }

    async getRvtErrorTask(msg) {
        const str = decoder.write(msg.content);
        const {id, errorMessage} = JSON.parse(str);
        const query = ExportRvtTask.findOne({id: id});
        const task = await query.exec();
        return {task, errorMessage};
    }

    async getNwcErrorTask(msg) {
        const str = decoder.write(msg.content);
        const {id, errorMessage} = JSON.parse(str);
        const query = ConvertNwcTask.findOne({id: id});
        const task = await query.exec();
        return {task, errorMessage};
    }

    sendTaskMessage(payload, type) {
        this.sendMessage(payload.task.owner, {type, payload});
    }

    sendMessage(to, obj) {
        const socket = this.clients[to];
        if (socket) {
            socket.send(JSON.stringify(obj));
        }
    }
}

module.exports = TaskManager;