import {SWITCH_LIST_TYPE} from "../actions";

export default function reducerSettings(state = {listType: true}, action) {
    if(action.type === SWITCH_LIST_TYPE) {
        return {...state, listType: action.payload};
    }
    return state;
}