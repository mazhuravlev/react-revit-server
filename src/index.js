import {downloadInProgress, downloadSuccess, fetchDownloads, fetchHistory, fetchModels, setUserId} from "./actions";

require("babel-core/register");
require("babel-polyfill");

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import ReduxPromise from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import mySaga from './sagas';
import App from './components/app';
import reducers from './reducers';
import {v4 as uuid} from 'uuid';
import * as TaskStates from "../shared/taskStates";

const eio = require('engine.io-client');

const USER_ID_KEY = 'userId';

const sagaMiddleware = createSagaMiddleware();
const createStoreWithMiddleware = applyMiddleware(sagaMiddleware, ReduxPromise, ReduxThunk)(createStore);

const store = createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
store.dispatch(fetchModels());
store.dispatch(fetchHistory());
const userId = localStorage.getItem(USER_ID_KEY) || uuid();
store.dispatch(setUserId(userId));
localStorage.setItem(USER_ID_KEY, userId);
store.dispatch(fetchDownloads());

const opts = {
    extraHeaders: {
        'Authorization': `Bearer ${userId}`,
    }
};

const socket = eio(`ws://${window.location.host}`, opts);
socket.on('open', function () {
    socket.on('message', function (messageString) {
        const {type, payload} = JSON.parse(messageString);
        switch (type) {
            case TaskStates.TASK_IN_PROGRESS:
                store.dispatch(downloadInProgress(payload.task));
                break;
            case TaskStates.TASK_COMPLETE:
                store.dispatch(downloadSuccess(payload.task.id, payload.type, payload.task.serverModelPath, payload.task.name));
                break;
            default:
                console.log(`[MESSAGE: ${type}]`, payload);
        }
    });
    socket.on('close', function () {
    });
});

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>
    , document.querySelector('#container'));

sagaMiddleware.run(mySaga);