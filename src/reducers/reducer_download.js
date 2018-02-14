import {
    DOWNLOAD_NWC_FAIL,
    DOWNLOAD_NWC_START, DOWNLOAD_RVT_FAIL, DOWNLOAD_RVT_START,
    DOWNLOAD_SUCCESS
} from "../sagas";
import * as _ from 'lodash';
import {FETCH_DOWNLOADS_SUCCESS, REMOVE_DOWNLOAD} from "../actions";
import {TASK_COMPLETE, TASK_NEW} from "../../shared/taskStates";

export default function reducerDownload(state = {}, {type, payload}) {
    switch (type) {
        case DOWNLOAD_RVT_START:
            return {...state, [payload.serverModelPath]: {state: TASK_NEW}};
        case DOWNLOAD_SUCCESS:
            return {
                ...state,
                [payload.serverModelPath]: {state: TASK_COMPLETE, link: payload.link, name: payload.name}
            };
        case DOWNLOAD_RVT_FAIL:
            return {...state, [payload.serverModelPath]: {state: TASK_FAILED}};
        case REMOVE_DOWNLOAD:
            const {[payload.serverModelPath]: foo, ...noDeleted} = state;
            return noDeleted;
        case DOWNLOAD_NWC_START:
            return {...state, [payload.serverModelPath]: {state: TASK_NEW}};
        case DOWNLOAD_NWC_FAIL:
            return {...state, [payload.serverModelPath]: {state: TASK_FAILED}};
        case FETCH_DOWNLOADS_SUCCESS:
            const downloads = _.keyBy(payload, 'serverModelPath');
            return _.mapValues(downloads, x => ({state: x.status, name: x.name, id: x.id}));
        default:
            return state;
    }
}