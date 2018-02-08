import axios from 'axios';
import {DOWNLOAD_NWC_START, DOWNLOAD_RVT_START} from "../sagas";

const ROOT_URL = `/api`;

export const FETCH_MODELS = 'FETCH_MODELS';
export const FETCH_MODEL_DETAILS = 'FETCH_MODEL_DETAILS';
export const BEGIN_FETCH_MODEL_DETAILS = 'BEGIN_FETCH_MODEL_DETAILS';
export const FETCH_HISTORY = 'FETCH_HISTORY';
export const SWITCH_LIST_TYPE = 'SWITCH_LIST_TYPE';
export const SET_TOKEN = 'SET_TOKEN';
export const RESET_TOKEN = 'RESET_TOKEN';
export const BEGIN_FETCH_A360_INFO = 'BEGIN_FETCH_A360_INFO';
export const FETCH_A360_INFO = 'FETCH_A360_INFO';
export const LOGOUT = 'LOGOUT';
export const REMOVE_DOWNLOAD = 'REMOVE_DOWNLOAD';

export function fetchModels() {
    const url = `${ROOT_URL}/models`;

    const request = axios.get(url);
    return {
        type: FETCH_MODELS,
        payload: request
    };
}

export function fetchModelDetails(id) {
    const url = `${ROOT_URL}/models/${id}`;
    const request = axios.get(url);
    return (dispatch, getState) => {
        dispatch({
            type: BEGIN_FETCH_MODEL_DETAILS
        });
        request.then(data => {
            dispatch({
                type: FETCH_MODEL_DETAILS,
                payload: data
            });
        }).catch(e => console.error(e));
    };
}

export function fetchHistory() {
    const url = `${ROOT_URL}/history`;

    const request = axios.get(url);
    return {
        type: FETCH_HISTORY,
        payload: request
    };
}

export function switchListType(type) {
    return {
        type: SWITCH_LIST_TYPE,
        payload: type
    };
}

export function setToken(tokenData) {
    return {
        type: SET_TOKEN,
        payload: tokenData
    }
}



export function resetToken(token) {
    return {
        type: RESET_TOKEN,
    }
}

export function getA360Info() {
    return (dispatch, getState) => {
        const url = `https://developer.api.autodesk.com/userprofile/v1/users/@me`;
        const token = getState().a360.token.access_token;
        const request = axios.get(url, {headers: {'Authorization': 'Bearer ' + token}});
        dispatch({
            type: BEGIN_FETCH_A360_INFO
        });
        request.then(data => {
            dispatch({
                type: FETCH_A360_INFO,
                payload: data.data
            });
        }).catch(e => console.error(e));
    };
}

export function logout() {
    return {
        type: LOGOUT
    };
}

export function downloadModel(path) {
    return {
        type: DOWNLOAD_RVT_START,
        payload: {path}
    }
}

export function removeDownload(path) {
    return {
        type: REMOVE_DOWNLOAD,
        payload: {path}
    }
}

export function downloadNwc(path) {
    return {
        type: DOWNLOAD_NWC_START,
        payload: {path}
    }
}


export const SET_USER_ID = 'SET_USER_ID';
export function setUserId(id) {
    return {
        type: SET_USER_ID,
        payload: id
    };
}