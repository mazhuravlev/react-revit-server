import {fetchHistory, fetchModels, setUserId} from "./actions";

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

const socket = eio('ws://localhost:9122');
socket.on('open', function () {
    socket.on('message', function (data) {
        console.log(data);
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