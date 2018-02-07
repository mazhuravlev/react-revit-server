import {
    DOWNLOAD_NWC_FAIL,
    DOWNLOAD_NWC_START, DOWNLOAD_NWC_SUCCESS, DOWNLOAD_RVT_FAIL, DOWNLOAD_RVT_START,
    DOWNLOAD_RVT_SUCCESS
} from "../sagas";
import {REMOVE_DOWNLOAD} from "../actions";

export const STATE_START = 'start';
export const STATE_SUCCESS = 'success';
export const STATE_FAIL = 'fail';


export default function reducerDownload(state = {}, {type, payload}) {
    switch(type) {
        case DOWNLOAD_RVT_START:
            return {...state, [payload.path]: {state: STATE_START}};
        case DOWNLOAD_RVT_SUCCESS:
            return {...state, [payload.path]: {state: STATE_SUCCESS, link: payload.link}};
        case DOWNLOAD_RVT_FAIL:
            return {...state, [payload.path]: {state: STATE_FAIL}};
        case REMOVE_DOWNLOAD:
            const {[payload.path]: foo, ...noDeleted} = state;
            return noDeleted;
        case DOWNLOAD_NWC_START:
            return {...state, [payload.path]: {state: STATE_START}};
        case DOWNLOAD_NWC_SUCCESS:
            return {...state, [payload.path]: {state: STATE_SUCCESS, link: payload.link}};
        case DOWNLOAD_NWC_FAIL:
            return {...state, [payload.path]: {state: STATE_FAIL}};
        default:
            return  state;

    }
}