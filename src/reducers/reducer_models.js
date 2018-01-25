import {FETCH_MODELS} from "../actions";

export default function reducerModels(state = [], action) {
    if(action.type === FETCH_MODELS) {
        return action.payload.data;
    }
    return state;
}