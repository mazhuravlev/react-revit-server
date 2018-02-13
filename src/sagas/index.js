import {call, put, takeEvery} from 'redux-saga/effects';
import axios from 'axios';

export const DOWNLOAD_RVT_START = 'DOWNLOAD_RVT_START';
export const DOWNLOAD_RVT_FAIL = 'DOWNLOAD_RVT_FAIL';

export const DOWNLOAD_NWC_START = 'DOWNLOAD_NWC_START';
export const DOWNLOAD_SUCCESS = 'DOWNLOAD_SUCCESS';
export const DOWNLOAD_NWC_FAIL = 'DOWNLOAD_NWC_FAIL';

const BASE_URL = '/api';
const DOWNLOAD_PATH = type => `${BASE_URL}/download/${type}`;
const EXPORT_RVT_PATH = `${BASE_URL}/exportRvt`;
const CONVERT_NWC_PATH = `${BASE_URL}//convertNwc`;

function* download({payload}) {
    try {
        const response = yield call(axios.post, EXPORT_RVT_PATH, {
            server: 'vpp-revit01',
            serverModelPath: payload.serverModelPath
        });
        // yield put({
        //     type: DOWNLOAD_RVT_SUCCESS,
        //     payload: {
        //         ...response.data,
        //         serverModelPath: payload.serverModelPath,
        //         link: `${DOWNLOAD_PATH('rvt')}/${response.data.id}`
        //     }
        // });
    } catch (e) {
        yield put({type: DOWNLOAD_RVT_FAIL, payload: {serverModelPath: payload.serverModelPath, message: e.message}});
    }
}

function* downloadNwc({payload}) {
    try {
        const response = yield call(axios.post, CONVERT_NWC_PATH, {
            server: 'vpp-revit01',
            serverModelPath: payload.serverModelPath
        });
        // yield put({
        //     type: DOWNLOAD_NWC_SUCCESS,
        //     payload: {...response.data, link: `${DOWNLOAD_PATH('nwc')}/${response.data.id}`}
        // });
    } catch (e) {
        yield put({
            type: DOWNLOAD_NWC_FAIL,
            serverModelPath: payload.serverModelPath,
            payload: {serverModelPath: payload.serverModelPath, message: e.message}
        });
    }
}


export default function* mySaga() {
    yield [
        takeEvery(DOWNLOAD_NWC_START, downloadNwc),
        takeEvery(DOWNLOAD_RVT_START, download),
    ];
}
