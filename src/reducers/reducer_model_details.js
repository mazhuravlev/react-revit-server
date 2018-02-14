import {BEGIN_FETCH_MODEL_DETAILS, FETCH_MODEL_DETAILS} from "../actions";
import * as _ from 'lodash';
import {mean} from "../math";

const moment = require('moment');

function processHistory(_history) {
    const history = _history.map(x => {
        const m = moment(x.date);
        return {...x, moment: m};
    });
    const g = _.groupBy(history, x => {
        return Number(`${x.moment.year()}${padWeek(x.moment.week())}`);
    });
    return _.sortBy(Object.values(g).map(x => ({
        modelSize: mean(_.map(x, 'modelSize')),
        count: x.length,
        //users: _.uniq(_.pluck(x, 'user')),
        users: _.sortBy(Object.values(_.groupBy(x, 'user')), ug => -ug.length).map(ug => `${ug[0].user}: ${ug.length}`),
        year: x[0].moment.year(),
        week: x[0].moment.week(),
        syncs: x
    })), x => Number(`${x.year}${padWeek(x.week)}`));
}

export default function reducerModelDetails(state = null, action) {
    switch(action.type) {
        case BEGIN_FETCH_MODEL_DETAILS:
            return state;
        case FETCH_MODEL_DETAILS:
            return {...action.payload.data, processedHistory: processHistory(action.payload.data.history)};
        default:
            return state;
    }
}

function padWeek(w) {
    return w > 9 ? w : '0' + w;
}