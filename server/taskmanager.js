const nconf = require('nconf');
const amqp = require('amqplib');
const uuid = require("uuid");
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

const {ExportRvtTask, ConvertNwcTask} = require('./mongo');

nconf.file('config.json');
nconf.required(['rvtResultPath', 'nwcResultPath']);
const rvtResutlPath = nconf.get('rvtResultPath');
const nwcResultath = nconf.get('nwcResultPath')

class TaskManager {

    constructor() {
        this.queueServer = '10.177.100.84';

        this.RVT_TASK_EXCHANGE = 'extractRvt';
        this.NWC_TASK_EXCHANGE = 'convertNwc';
        this.COMPLETE_RVTS_EXCANGE = 'rvt';
        this.COMPLETE_NWCS_EXCANGE = 'nwc';

        this.init();
    }

    async init() {
        const conn = await amqp.connect(`amqp://${this.queueServer}`);

        this.exportRvtChannel = await conn.createChannel();
        this.exportRvtChannel.assertExchange(this.RVT_TASK_EXCHANGE, 'direct', {durable: true});

        this.convertNwcChannel = await conn.createChannel();
        this.convertNwcChannel.assertExchange(this.NWC_TASK_EXCHANGE, 'direct', {durable: true});

        this.completeNwcChannel = await conn.createChannel();
        this.completeNwcChannel.assertExchange(this.COMPLETE_NWCS_EXCANGE, 'direct', {durable: true});
        const q = await this.completeNwcChannel.assertQueue('completeNwc', {});
        this.completeNwcChannel.bindQueue(q.queue, this.COMPLETE_NWCS_EXCANGE, 'completeNwc');
        this.completeNwcChannel.consume(q.queue, msg => {
            this.onNwcTaskComplete(msg);
            this.completeNwcChannel.ack(msg);
        });

        this.completeRvtChannel = await conn.createChannel();
        this.completeRvtChannel.assertExchange(this.COMPLETE_RVTS_EXCANGE, 'direct', {durable: true});
        const q1 = await this.completeRvtChannel.assertQueue('completeRvt', {});
        this.completeRvtChannel.bindQueue(q1.queue, this.COMPLETE_RVTS_EXCANGE, 'completeRvt');
        this.completeRvtChannel.consume(q1.queue, msg => {
            this.onRvtTaskComplete(msg);
            this.completeRvtChannel.ack(msg);
        });
    }

    exportRvt(server, owner, serverModelPath, forUser) {
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

        ExportRvtTask.create(task, (err, t) => {
            if (err) throw new Error(err.message);
        });

        this.exportRvtChannel.publish(this.RVT_TASK_EXCHANGE, server, new Buffer(JSON.stringify({
            id: task.id,
            serverModelPath: task.serverModelPath
        })));

        return task;
    }

    convertNwc(owner, rvtModelPath, name) {
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

        ConvertNwcTask.create(task, (err, t) => {
            if (err) throw new Error(err.message);
        });

        this.convertNwcChannel.publish(this.NWC_TASK_EXCHANGE, 'CPU', new Buffer(JSON.stringify({
            id: task.id,
            rvtModelPath: task.rvtModelPath
        })));

        return task;
    }

    onRvtTaskComplete(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);

        const query = ExportRvtTask.findOne({id: id});
        query.exec((err, task) => {
            if (err) throw new Error(err.message);
            task.status = 'complete';
            task.save((err, updatedTask) => {
                if (err) throw new Error(err.message);
                if (!updatedTask.forUser) this.convertNwc(updatedTask.owner, updatedTask.resultPath, task.name.replace('.rvt', '.nwc'));
            });
        });
    }

    onNwcTaskComplete(msg) {
        const str = decoder.write(msg.content);
        const {id} = JSON.parse(str);

        const query = ConvertNwcTask.findOne({id: id});
        query.exec((err, task) => {
            if (err) throw new Error(err.message);
            task.status = 'complete';
            task.save((err, updatedTask) => {
                if (err) throw new Error(err.message);
            });
        });
    }
}

module.exports = TaskManager;