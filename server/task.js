const {Model, History} = require("./mongo");
const {getFolderTree} = require('./data');
const _ = require('lodash');
const fs = require('fs');
const mongoose = require('mongoose');
const moment = require('moment');
const cron = require('node-cron');

Promise.resolve().then(async () => await run())
    .then(cron.schedule('10 * * * *', function () {
        Promise.resolve().then(() => run());
    }));

async function run() {
    const startTime = new moment();
    const week = moment().startOf('week');
    log('start');
    const data = await getFolderTree('|');
    if (!data) return;
    const models = flattenTree(data);
    //fs.writeFileSync('flat.json', JSON.stringify(models));
    //const models = JSON.parse(fs.readFileSync('server/flat.json'));
    for (let i = 0; i < models.length; i++) {
        const modelData = models[i];
        if (!modelData.history) continue;
        let model = await Model.findOne({fullName: modelData.history.Path});
        if (!model) {
            model = new Model();
            model._id = new mongoose.Types.ObjectId;
            model.fullName = modelData.history.Path;
            model.name = modelData.model.Name;
            const res = await model.save();
        }
	model.weekSync = 0;
        model.modelSize = modelData.model.ModelSize;
        model.history = [];
        const res = await History.find({model: model._id}).remove();
        for (let j = 0; j < modelData.history.Items.length; j++) {
            const historyItem = modelData.history.Items[j];
            const history = new History();
            history._id = new mongoose.Types.ObjectId;
            history.user = historyItem.User;
            history.modelSize = historyItem.ModelSize;
            history.date = eval('new ' + historyItem.Date.substr(1).slice(0, -1));
            if (moment(history.date).isAfter(week)) model.weekSync += 1;
            history.model = model._id;
            try {
                let res = await history.save();
                if (res) model.history.push(history._id);
            } catch (e) {
                console.log('failed ' + res);
            }
        }
        try {
            const resm = await model.save();
        } catch (e) {
            console.log('failed ' + e);
        }
    }
    log(moment.duration(new moment().diff(startTime)).humanize() + ' elapsed');
    console.log('Done!');
}

function flattenTree(tree) {
    let models = [];
    let queue = [tree];
    while (true) {
        const _models = queue.map(x => x.models).filter(x => x.length > 0);
        models = models.concat(_.flatten(_models));
        queue = _.flatten(queue.map(x => x.folders));
        if (queue.length === 0) break;
    }
    return models;
}

function log(o) {
    return console.log(`[${new moment().format('HH:mm:ss')}] ${o}`);
}