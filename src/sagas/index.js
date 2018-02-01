import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

export const DOWNLOAD_START = 'DOWNLOAD_START';
export const DOWNLOAD_SUCCESS = 'DOWNLOAD_SUCCESS';
export const DOWNLOAD_FAIL = 'DOWNLOAD_FAIL';

const DOWNLOAD_PATH = 'http://vpp-revit01.main.picompany.ru:3000/download';

function* download(action) {
    try {
        const response = yield call(axios.post, DOWNLOAD_PATH, {path: action.payload.path});
        yield put({type: DOWNLOAD_SUCCESS, payload: {...response.data, link: `${DOWNLOAD_PATH}/${response.data.guid}`}});
    } catch (e) {
        yield put({type: DOWNLOAD_FAIL, message: e.message});
    }
}


function* mySaga() {
    yield takeEvery(DOWNLOAD_START, download);
}

export default mySaga;