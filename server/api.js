const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const {Model, History} = require('./mongo');
const Mongoose = require('mongoose');

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
});

api.use('/api', router.routes());

app.use(cors());
app.use(logger());
app.use(bodyparser());
app.use(api.routes());

console.log(`[KOA] Listening on ${PORT}`);
app.listen(PORT);

const engine = require('engine.io');
const server = engine.listen(SOCKET_PORT);
console.log(`[ENGINE.IO] Listening on ${SOCKET_PORT}`);

server.on('connection', function (socket) {
    socket.send('utf 8 string');
    socket.send(new Buffer([0, 1, 2, 3, 4, 5])); // binary data
});