import {createSelector} from "reselect";

const history = state => {
    return state.details ? state.details.history : null;
};

export const detailsHistorySelector = createSelector(
    history,
    history => {
        if (!history) return [];
        return _.sortBy(Object.values(_.groupBy(history, 'user')), x => -x.length).map(x => ({
            name: x[0].user,
            count: x.length
        }));
    }
);