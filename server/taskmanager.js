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

        this.RVT_TASK_EXCHANGE = 'extractRvt';
        this.NWC_TASK_EXCHANGE = 'convertNwc';
        this.COMPLETE_RVTS_EXCANGE = 'rvt';
        this.COMPLETE_NWCS_EXCANGE = 'nwc';
        this.clients = {};

        this.init();
    }

    async init() {
        const conn = await amqp.connect(`amqp://${this.queueServer}`);

        await this.handleExport(conn);
        await this.handleComplete(conn);
        await this.handleErrors(conn);
    }

    async handleExport(conn) {
        this.exportRvtChannel = await conn.createChannel();
        this.exportRvtChannel.assertExchange(this.RVT_TASK_EXCHANGE, 'direct', {durable: true});

        this.convertNwcChannel = await conn.createChannel();
        this.convertNwcChannel.assertExchange(this.NWC_TASK_EXCHANGE, 'direct', {durable: true});
    }

    async handleComplete(conn) {
        this.completeNwcChannel = await conn.createChannel();
        this.completeNwcChannel.assertExchange(this.COMPLETE_NWCS_EXCANGE, 'direct', {durable: true});
        const completeNwcQueue = await this.completeNwcChannel.assertQueue('completeNwc', {});
        this.completeNwcChannel.bindQueue(completeNwcQueue.queue, this.COMPLETE_NWCS_EXCANGE, 'completeNwc');
        this.completeNwcChannel.consume(completeNwcQueue.queue, async (msg) => {
            await this.onNwcTaskComplete(msg);
            this.completeNwcChannel.ack(msg);
            const task = await this.getNwcTask(msg);
            this.sendCompleteTask(task);
        });

        this.completeRvtChannel = await conn.createChannel();
        this.completeRvtChannel.assertExchange(this.COMPLETE_RVTS_EXCANGE, 'direct', {durable: true});
        const completeRvtQueue = await this.completeRvtChannel.assertQueue('completeRvt', {});
        this.completeRvtChannel.bindQueue(completeRvtQueue.queue, this.COMPLETE_RVTS_EXCANGE, 'completeRvt');
        this.completeRvtChannel.consume(completeRvtQueue.queue, async (msg) => {
            await this.onRvtTaskComplete(msg);
            this.completeRvtChannel.ack(msg);
            const task = await this.getRvtTask(msg);
            this.sendCompleteTask(task);
        });
    }

    async handleErrors(conn) {
        this.errorRvtChannel = await conn.createChannel();
        this.errorRvtChannel.assertExchange(this.COMPLETE_RVTS_EXCANGE, 'direct', {durable: true});
        const errorRvtQueue = await this.errorRvtChannel.assertQueue('errorRvt', {});
        this.errorRvtChannel.bindQueue(errorRvtQueue.queue, this.COMPLETE_RVTS_EXCANGE, 'errorRvt');
        this.errorRvtChannel.consume(errorRvtQueue.queu, async (msg) => {
            const obj = await this.getRvtErrorTask(msg);
            obj.task.status = 'error';
            await obj.task.save();
            this.sendCompleteTask(obj);
        });

        this.errorNwcChannel = await conn.createChannel();
        this.errorNwcChannel.assertExchange(this.COMPLETE_NWCS_EXCANGE, 'direct', {durable: true});
        const errorNwcQueue = await this.errorNwcChannel.assertQueue('errorNwc', {});
        this.errorNwcChannel.bindQueue(errorNwcQueue.queue, this.COMPLETE_NWCS_EXCANGE, 'errorNwc');
        this.errorNwcChannel.consume(errorNwcQueue.queu, async (msg) => {
            const obj = await this.getNwcErrorTask(msg);
            obj.task.status = 'error';
            await obj.task.save();
            this.sendCompleteTask(obj);
        });
    }

    async exportRvt(server, owner, serverModelPath, forUser) {
        const serverModelName = serverModelPath.slice(serverModelPath.lastIndexOf('\\') + 1, serverModelPath.length);
        const id = uuid();
        const task = {
            id: id,
            date: Date.now(),
            name: serverModelName,
            serverModelPath: serverModelPath,
            resultPath: `${rvtResutlPath}\\${id}.rvt`,
            server: server,
            owner: owner,
            forUser: forUser,
            status: 'new'
        };

        await ExportRvtTask.create(task);

        this.exportRvtChannel.publish(this.RVT_TASK_EXCHANGE, server, new Buffer(JSON.stringify({
            id: task.id,
            serverModelPath: task.serverModelPath
        })));

        return task;
    }

    async convertNwc(owner, rvtModelPath, name) {
        const rvtModelName = rvtModelPath.slice(rvtModelPath.lastIndexOf('\\'), rvtModelPath.length);
        const task = {
            id: uuid(),
            date: Date.now(),
            name: name,
            rvtModelPath: rvtModelPath,
            resultPath: `${nwcResultath}${rvtModelName.replace('.rvt', '.nwc')}`,
            owner: owner,
            status: 'new'
        };

        await ConvertNwcTask.create(task);

        this.convertNwcChannel.publish(this.NWC_TASK_EXCHANGE, 'CPU', new Buffer(JSON.stringify({
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
        task.status = 'complete';
        const updatedTask = await task.save();
        if (!updatedTask.forUser) await this.convertNwc(updatedTask.owner, updatedTask.resultPath, task.name.replace('.rvt', '.nwc'));
    }

    async onNwcTaskComplete(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);

        const query = ConvertNwcTask.findOne({id: id});
        let task = await query.exec();
        task.status = 'complete';
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

    sendCompleteTask(task) {
        const socket = this.clients[task.owner];
        if (socket) {
            socket.send(JSON.stringify(task));
        }
    }
}

module.exports = TaskManager;