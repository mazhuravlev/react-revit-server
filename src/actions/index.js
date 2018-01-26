import axios from 'axios';

const ROOT_URL = `/api`;

export const FETCH_MODELS = 'FETCH_MODELS';
export const FETCH_MODEL_DETAILS = 'FETCH_MODEL_DETAILS';
export const BEGIN_FETCH_MODEL_DETAILS = 'BEGIN_FETCH_MODEL_DETAILS';
export const FETCH_HISTORY = 'FETCH_HISTORY';
export const SWITCH_LIST_TYPE = 'SWITCH_LIST_TYPE';

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
