import {TASK_COMPLETE, TASK_FAILED, TASK_IN_PROGRESS, TASK_NEW} from "../shared/taskStates";
import {EXPORT_COMPLETE} from "../shared/messageTypes";
import {
    COMPLETE_NWC_EXCHANGE,
    COMPLETE_NWC_QUEUE,
    COMPLETE_RVT_EXCHANGE,
    COMPLETE_RVT_QUEUE,
    ERROR_NWC_QUEUE,
    ERROR_RVT_QUEUE, INPROGRESS_NWC_QUEUE, INPROGRESS_RVT_QUEUE,
    NWC_TASK_EXCHANGE,
    RVT_TASK_EXCHANGE
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
        await this.setExchange(this.exportRvtChannel, RVT_TASK_EXCHANGE);

        this.convertNwcChannel = await conn.createChannel();
        await this.setExchange(this.convertNwcChannel, NWC_TASK_EXCHANGE);
    }

    async handleComplete(conn) {
        this.completeNwcChannel = await conn.createChannel();
        await this.setExchange(this.completeNwcChannel, COMPLETE_NWC_EXCHANGE, COMPLETE_NWC_QUEUE, async (msg) => {
            await this.onNwcTaskComplete(msg);
            this.completeNwcChannel.ack(msg);
            const task = await this.getNwcTask(msg);
            this.sendCompleteTask({task, type: 'nwc', errorMessage: null});
        });

        this.completeRvtChannel = await conn.createChannel();
        await this.setExchange(this.completeRvtChannel, COMPLETE_RVT_EXCHANGE, COMPLETE_RVT_QUEUE, async (msg) => {
            await this.onRvtTaskComplete(msg);
            this.completeRvtChannel.ack(msg);
            const task = await this.getRvtTask(msg);
            if (task.forUser) this.sendCompleteTask({task, type: 'rvt', errorMessage: null});
        });
    }

    async handleErrors(conn) {
        this.errorRvtChannel = await conn.createChannel();
        await this.setExchange(this.errorRvtChannel, COMPLETE_RVT_EXCHANGE, ERROR_RVT_QUEUE, async (msg) => {
            const obj = await this.getRvtErrorTask(msg);
            obj.task.status = TASK_FAILED;
            await obj.task.save();
            this.sendCompleteTask(obj);
        });

        this.errorNwcChannel = await conn.createChannel();
        await this.setExchange(this.errorNwcChannel, COMPLETE_NWC_EXCHANGE, ERROR_NWC_QUEUE, async (msg) => {
            const obj = await this.getNwcErrorTask(msg);
            obj.task.status = TASK_FAILED;
            await obj.task.save();
            this.sendCompleteTask(obj);
        });
    }

    async handleInProgress() {
        const inProgressRvtQueue = await this.exportRvtChannel.assertQueue(INPROGRESS_RVT_QUEUE, {});
        this.exportRvtChannel.bindQueue(inProgressRvtQueue.queue, RVT_TASK_EXCHANGE, INPROGRESS_RVT_QUEUE);
        this.exportRvtChannel.consume(inProgressRvtQueue.queue, async (msg) => {
            const str = decoder.write(msg.content);
            const {id} = JSON.parse(str);
            let task = await ExportRvtTask.findOne({id});
            task.status = TASK_IN_PROGRESS;
            await task.save();
        });

        const inProgressNwcQueue = await this.convertNwcChannel.assertQueue(INPROGRESS_NWC_QUEUE, {});
        this.convertNwcChannel.bindQueue(inProgressNwcQueue.queue, NWC_TASK_EXCHANGE, INPROGRESS_NWC_QUEUE);
        this.convertNwcChannel.consume(inProgressNwcQueue.queue, async (msg) => {
            const str = decoder.write(msg.content);
            const {id} = JSON.parse(str);
            let task = await ConvertNwcTask.findOne({id});
            task.status = TASK_IN_PROGRESS;
            await task.save();
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

        this.exportRvtChannel.publish(RVT_TASK_EXCHANGE, server, new Buffer(JSON.stringify({
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

        this.convertNwcChannel.publish(NWC_TASK_EXCHANGE, 'CPU', new Buffer(JSON.stringify({
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

    sendCompleteTask(payload) {
        this.sendMessage(payload.task.owner, {type: EXPORT_COMPLETE, payload});
    }

    sendMessage(to, obj) {
        const socket = this.clients[to];
        if (socket) {
            socket.send(JSON.stringify(obj));
        }
    }
}

module.exports = TaskManager;