import {createSelector} from "reselect";

const download = (state) => state.download;

export const downloadSelector = createSelector(
    download,
    (download) => Object.keys(download).map(x => ({...download[x], path: x}))
);