import {call, put, takeEvery} from 'redux-saga/effects';
import axios from 'axios';

export const DOWNLOAD_RVT_START = 'DOWNLOAD_RVT_START';
export const DOWNLOAD_RVT_SUCCESS = 'DOWNLOAD_RVT_SUCCESS';
export const DOWNLOAD_RVT_FAIL = 'DOWNLOAD_RVT_FAIL';

export const DOWNLOAD_NWC_START = 'DOWNLOAD_NWC_START';
export const DOWNLOAD_NWC_SUCCESS = 'DOWNLOAD_NWC_SUCCESS';
export const DOWNLOAD_NWC_FAIL = 'DOWNLOAD_NWC_FAIL';

const BASE_URL = '/api';
const RVT_PATH = BASE_URL;
const NWC_PATH = BASE_URL;

const DOWNLOAD_PATH = RVT_PATH + '/exportRvt';
const DOWNLOAD_NWC_PATH = NWC_PATH + '/convertNwc';

function* download(action) {
    try {
        const response = yield call(axios.post, DOWNLOAD_PATH, {server: 'vpp-revit01', serverModelPath: action.payload.path});
        yield put({
            type: DOWNLOAD_RVT_SUCCESS,
            payload: {...response.data, link: `${DOWNLOAD_PATH}/${response.data.guid}`}
        });
    } catch (e) {
        yield put({type: DOWNLOAD_RVT_FAIL, payload: {path: action.payload.path, message: e.message}});
    }
}

function* downloadNwc(action) {
    try {
        const response = yield call(axios.post, DOWNLOAD_NWC_PATH, {server: 'vpp-revit01', serverModelPath: action.payload.path});
        yield put({
            type: DOWNLOAD_NWC_SUCCESS,
            payload: {...response.data, link: `${DOWNLOAD_NWC_PATH}/${response.data.guid}`}
        });
    } catch (e) {
        yield put({type: DOWNLOAD_NWC_FAIL, payload: {path: action.payload.path, message: e.message}});
    }
}


export default function* mySaga() {
    yield [
        takeEvery(DOWNLOAD_NWC_START, downloadNwc),
        takeEvery(DOWNLOAD_RVT_START, download),
    ];
}
