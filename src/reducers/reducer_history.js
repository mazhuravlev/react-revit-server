import {FETCH_HISTORY} from "../actions";

export default function reducerHistory(state = [], action) {
    if(action.type === FETCH_HISTORY) {
        return action.payload.data;
    }
    return state;
}