import {BEGIN_FETCH_A360_INFO, FETCH_A360_INFO, LOGOUT, RESET_TOKEN, SET_TOKEN} from "../actions";
import moment from 'moment';
import {USER_FETCH_SUCCEEDED} from "../sagas";

const initialState = {token: null, info: null, fetching: false};
const KEY = 'token_data';

function saveToken({access_token, expires_in}) {
    const date = moment().add(+expires_in, 's');
    const tokenData = {access_token: access_token, expire: date.toISOString()};
    localStorage.setItem(KEY, JSON.stringify(tokenData));
    return tokenData;
}

function tryLoadToken() {
    const d = localStorage.getItem(KEY);
    if (!d) return null;
    const data = JSON.parse(d);
    if (moment(data.expire).isAfter(moment())) {
        return data;
    }
    localStorage.removeItem(KEY);
    return null;
}

export default function a360Reducer(state = null, action) {
    if (state === null) {
        return {...initialState, token: tryLoadToken()};
    }
    switch (action.type) {
        case SET_TOKEN:
            const token = saveToken(action.payload);
            return {...state, token};
        case RESET_TOKEN:
            return {...state, token: null};
        case BEGIN_FETCH_A360_INFO:
            return {...state, fetching: true};
        case FETCH_A360_INFO:
            return {...state, info: action.payload, fetching: false};
        case LOGOUT:
            return initialState;
        case USER_FETCH_SUCCEEDED:
            return {...state, user: action.payload};
        default:
            return state;
    }
}