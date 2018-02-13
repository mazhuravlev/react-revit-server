const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
Mongoose.Promise = global.Promise;

const mongo = Mongoose.connect('mongodb://user:user@localhost/bimon');

const HistorySchema = Schema({
    _id: ObjectId,
    user: String,
    modelSize: Number,
    date: Date,
    model: {type: ObjectId, ref: 'model'}
});
const History = Mongoose.model('history', HistorySchema);

const ModelSchema = Schema({
    _id: ObjectId,
    guid: String,
    name: String,
    fullName: String,
    weekSync: Number,
    lastSync: Date,
    history: [{type: ObjectId, ref: 'history'}]
});
const Model = Mongoose.model('model', ModelSchema);

const ExportRvtTaskSchema = Schema({
    id: String,
    date: Date,
    name: String,
    serverModelPath: String,
    resultPath: String,
    server: String,
    owner: String,
    forUser: Boolean,
    status: String
});
const ExportRvtTask = Mongoose.model('RvtTasks', ExportRvtTaskSchema);

const ConvertNwcTaskSchema = Schema({
    id: String,
    date: Date,
    name: String,
    serverModelPath: String,
    rvtModelPath: String,
    resultPath: String,
    owner: String,
    status: String
});
const ConvertNwcTask = Mongoose.model('NwcTasks', ConvertNwcTaskSchema);

module.exports = {Model, History, ExportRvtTask, ConvertNwcTask, ObjectId};
