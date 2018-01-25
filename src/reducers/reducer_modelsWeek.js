import {FETCH_MODELS} from "../actions";
import * as _ from 'lodash';

export default function reducerModelsWeek(state = {}, action) {
    if (action.type === FETCH_MODELS) {
        const data = action.payload.data;
        const c = [data.filter(x => x.weekSync > 0), data.filter(x => x.weekSync === 0)];
        return {
            name: 'Модели',
            toggled: true,
            children: [
                {name: `>0 синх (${c[0].length} шт)`, children:c[0].map(y => ({name: `${y.name} (${y.weekSync})`, model: y}))},
                {name: `0 синх (${c[1].length} шт)`, children:c[1].map(y => ({name: `${y.name} ${y.weekSync}`, model: y}))}
            ]
        };
    }
    return state;
}

function getName(models) {
    const max = _.max(models, 'weekSync').weekSync;
    const min = _.min(models, 'weekSync').weekSync;
    return `${max} - ${min}`;
}