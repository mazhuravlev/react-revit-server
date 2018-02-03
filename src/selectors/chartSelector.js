import {createSelector} from 'reselect';
import moment from "moment";

const EMPTY = [];

const getProcessedHistory = (state) => state.details ? state.details.processedHistory : EMPTY;

export const chartSelector = createSelector(
    [getProcessedHistory],
    (processedHistory) => {
        return processedHistory.map(x => ({
            name: 'a',
            sync: x.count,
            year: x.year,
            week: x.week,
            users: x.users,
            size: Math.round(x.modelSize / 1024 / 1024),
            date: moment().year(x.year).week(x.week),
            syncs: x.syncs
        }));
    }
);