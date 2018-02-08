import {createSelector} from "reselect";

export const tokenSelector = createSelector(state => state.a360.token, token => token);