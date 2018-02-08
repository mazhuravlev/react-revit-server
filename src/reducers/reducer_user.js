import {SET_USER_ID} from "../actions";

export default function reducerUser(state = {}, action) {
    switch(action.type) {
        case SET_USER_ID:
            return {userId: action.payload};
        default:
            return state;
    }
}