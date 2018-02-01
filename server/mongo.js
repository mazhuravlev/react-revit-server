const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
Mongoose.Promise = global.Promise;

const mongo = Mongoose.connect('mongodb://user:user@localhost/models');

const HistorySchema = Schema({
    _id: ObjectId,
    user: String,
    modelSize: Number,
    date: Date,
    model: { type: ObjectId, ref: 'model' }
});
const History = Mongoose.model('history', HistorySchema);

const ModelSchema = Schema({
    _id: ObjectId,
    name: String,
    fullName: String,
    weekSync: Number,
    lastSync: Date,
    history: [{ type: ObjectId, ref: 'history' }]
});
const Model = Mongoose.model('model', ModelSchema);

module.exports = {Model, History, ObjectId};
