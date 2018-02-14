import {
    DOWNLOAD_NWC_FAIL,
    DOWNLOAD_NWC_START, DOWNLOAD_RVT_FAIL, DOWNLOAD_RVT_START,
    DOWNLOAD_SUCCESS
} from "../sagas";
import * as _ from 'lodash';
import {DOWNLOAD_IN_PROGRESS, FETCH_DOWNLOADS_SUCCESS, REMOVE_DOWNLOAD} from "../actions";
import {TASK_COMPLETE, TASK_NEW, TASK_IN_PROGRESS} from "../../shared/taskStates";
import {makeDownloadLink} from '../../shared/makeDownloadLink';

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
        case DOWNLOAD_IN_PROGRESS:
            return {...state, [payload.serverModelPath]: {state: TASK_IN_PROGRESS}};
        case FETCH_DOWNLOADS_SUCCESS:
            const downloads = _.keyBy(payload, 'serverModelPath');
            return _.mapValues(downloads, x => ({
                state: x.status,
                name: x.name,
                id: x.id,
                link: x.status === TASK_COMPLETE ? makeLink(x) : ''
            }));
        default:
            return state;
    }
}

function makeLink(download) {
    return makeDownloadLink(download.name.includes('.rvt') ? 'rvt' : 'nwc', download.id);
}