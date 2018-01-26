const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('koa-cors');
const {Model, History} = require('./mongo');
const Mongoose = require('mongoose');

const PORT = 9121;

const app = new Koa();
const router = new Router();

router.get('/models', async ctx => {
    const cursor = await Mongoose.connection.db.collection('models').aggregate([
        {$project: {count: {$size: "$history"}, fullName: 1, name: 1, weekSync: 1}},
        {$sort: {weekSync: -1}}
    ]);
    ctx.body = await cursor.toArray();
});

router.get('/models/:id', async ctx => {
    ctx.body = await Model.findOne({_id: ctx.params.id}).populate('history').exec();
});

router.get('/history', async ctx => {
    const cursor = await Mongoose.connection.db.collection('histories').aggregate([
        {$group: {_id: "$user", count: {$sum: 1}}},
        {$sort: {count: -1}}
    ]);
    ctx.body = await cursor.toArray();
});

app.use(cors());
app.use(logger());
app.use(bodyparser());
app.use(router.routes());

console.log(`Listening on ${PORT}`);
app.listen(PORT);