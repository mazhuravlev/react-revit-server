import {DOWNLOAD_RVT_FAIL, DOWNLOAD_RVT_START, DOWNLOAD_RVT_SUCCESS} from "../sagas";
import {REMOVE_DOWNLOAD} from "../actions";

export default function reducerDownload(state = {}, {type, payload}) {
    switch(type) {
        case DOWNLOAD_RVT_START:
            return {...state, [payload.path]: {state: 'start'}};
        case DOWNLOAD_RVT_SUCCESS:
            return {...state, [payload.path]: {state: 'success', link: payload.link}};
        case DOWNLOAD_RVT_FAIL:
            return {...state, [payload.path]: {state: 'fail'}};
        case REMOVE_DOWNLOAD:
            const {[payload.path]: foo, ...noDeleted} = state;
            return noDeleted;
        default:
            return  state;

    }
}