import {call, put, takeEvery} from 'redux-saga/effects';
import axios from 'axios';

export const DOWNLOAD_RVT_START = 'DOWNLOAD_RVT_START';
export const DOWNLOAD_RVT_SUCCESS = 'DOWNLOAD_RVT_SUCCESS';
export const DOWNLOAD_RVT_FAIL = 'DOWNLOAD_RVT_FAIL';

export const DOWNLOAD_NWC_START = 'DOWNLOAD_NWC_START';
export const DOWNLOAD_NWC_SUCCESS = 'DOWNLOAD_NWC_SUCCESS';
export const DOWNLOAD_NWC_FAIL = 'DOWNLOAD_NWC_FAIL';

const DOWNLOAD_PATH = 'http://vpp-revit01.main.picompany.ru:3000/download';
const DOWNLOAD_NWC_PATH = 'http://vpp-revit01.main.picompany.ru:3000/convertNwc';

function* download(action) {
    try {
        const response = yield call(axios.post, DOWNLOAD_PATH, {path: action.payload.path});
        yield put({
            type: DOWNLOAD_RVT_SUCCESS,
            payload: {...response.data, link: `${DOWNLOAD_PATH}/${response.data.guid}`}
        });
    } catch (e) {
        yield put({type: DOWNLOAD_RVT_FAIL, message: e.message});
    }
}

function* downloadNwc(action) {
    try {
        const response = yield call(axios.post, DOWNLOAD_NWC_PATH, {path: action.payload.path});
        yield put({
            type: DOWNLOAD_NWC_SUCCESS,
            payload: {...response.data, link: `${DOWNLOAD_NWC_PATH}/${response.data.guid}`}
        });
    } catch (e) {
        yield put({type: DOWNLOAD_NWC_FAIL, message: e.message});
    }
}


export default function* mySaga() {
    yield [
        takeEvery(DOWNLOAD_RVT_START, download),
        takeEvery(DOWNLOAD_NWC_START, downloadNwc)
    ];
}