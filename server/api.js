require("babel-core/register");
require("babel-polyfill");

const {TASK_DOWNLOADED} = require("../shared/taskStates");

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const {Model, History, ExportRvtTask, ConvertNwcTask} = require('./mongo');
const Mongoose = require('mongoose');
const fs = require("fs");
const util = require('util');

const TaskManager = require('./taskmanager');
const taskManager = new TaskManager();

const PORT = 9121;
const SOCKET_PORT = PORT + 1;

const app = new Koa();
const router = new Router();
const api = new Router();

router.get('/models', async ctx => {
    const cursor = await Mongoose.connection.db.collection('models').aggregate([
        {$project: {count: {$size: "$history"}, fullName: 1, name: 1, weekSync: 1}},
        {$sort: {weekSync: -1}}
    ]);
    ctx.body = await cursor.toArray();
}).get('/models/:id', async ctx => {
    ctx.body = await Model.findOne({_id: ctx.params.id}).populate('history').exec();
}).get('/history', async ctx => {
    const cursor = await Mongoose.connection.db.collection('histories').aggregate([
        {$group: {_id: "$user", count: {$sum: 1}}},
        {$sort: {count: -1}}
    ]);
    ctx.body = await cursor.toArray();
}).get('/downloads', async (ctx, next) => {
    const filter = {owner: ctx.state.user.id, status: {$ne: TASK_DOWNLOADED}};
    const rvtTasks = await ExportRvtTask.find(filter);
    const nwcTasks = await ConvertNwcTask.find(filter);
    ctx.body = rvtTasks.concat(nwcTasks);
}).get('/download/:type/:id', async ctx => {
    const taskId = ctx.params.id;
    const task = await (ctx.params.type === 'rvt' ? ExportRvtTask.findOne({id: taskId}) : ConvertNwcTask.findOne({id: taskId}));
    if (!task) ctx.throw(404, 'task not found');
    const exists = await util.promisify(fs.exists)(task.resultPath);
    if(!exists) ctx.throw(404, 'file not found');
    let stream = fs.createReadStream(task.resultPath);
    task.status = TASK_DOWNLOADED;
    await task.save();
    ctx.set('Content-type', 'application-octet/stream');
    ctx.body = stream;
}).post('/exportRvt', async ctx => {
    const owner = ctx.state.user.id;
    const {server, serverModelPath} = ctx.request.body;
    ctx.body = await taskManager.exportRvt(server, owner, serverModelPath, true);
}).post('/convertNwc', async ctx => {
    const owner = ctx.state.user.id;
    const {server, serverModelPath} = ctx.request.body;
    ctx.body = await taskManager.exportRvt(server, owner, serverModelPath, false);
});
api.use('/api', router.routes());

app.use(async (ctx, next) => {
    const authHeader = ctx.headers['authorization'];
    if (authHeader) {
        ctx.state.user = {id: getToken(authHeader)};
    }
    await next();
});
app.use(cors());
//app.use(logger());
app.use(bodyparser());
app.use(api.routes());

console.log(`[KOA] Listening on ${PORT}`);
app.listen(PORT);

const engine = require('engine.io');
const server = engine.listen(SOCKET_PORT, {
    handlePreflightRequest: function (req, res) {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': 'http://localhost:8091',
            'Access-Control-Allow-Credentials': true
        };
        res.writeHead(200, headers);
        res.end();
    }
});
console.log(`[ENGINE.IO] Listening on ${SOCKET_PORT}`);

server.on('connection', function (socket) {
    const userId = getToken(socket.request.headers.authorization);
    taskManager.addClient(userId, socket);
    const ping = JSON.stringify({type: 'PING'});
    socket.send(ping);
    const interval = setInterval(() => socket.send(ping), 60000);
    socket.on('close', () => clearInterval(interval));
});

function getToken(authHeader) {
    return authHeader.replace('Bearer ', '');
}