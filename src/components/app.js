import React, {Component} from 'react';
import {fetchHistory, fetchModels, getA360Info, logout, setToken, setUserId} from "../actions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ModelDetails from "../containers/model_details";
import History from "../containers/history";
import {BrowserRouter, Link, NavLink, Route} from "react-router-dom";
import ListSelector from "../containers/list-selector";
import ModelListWeek from "../containers/model_list_week";
import ModelList from "../containers/model_list";
import Token from '../containers/token';
import UserInfo from "./userInfo";
import {USER_FETCH_REQUESTED} from "../sagas";
import Downloads from '../containers/downloads';
import {v4 as uuid} from 'uuid';
import axios from "axios/index";

const GET_TOKEN = false;

class _App extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchModels();
        this.props.fetchHistory();
        this.onLogout = this.onLogout.bind(this);
        if (this.props.a360.token && !this.props.a360.info) {
            this.props.getA360Info();
        }
        const userId = localStorage.getItem('userId') || uuid();
        localStorage.setItem('userId', userId);
        this.props.setUserId(userId);
        if(GET_TOKEN) {
            axios.get('http://bimacadforge.azurewebsites.net/BimacadForgeHelper/GetAccessToken').then(response => {
                this.props.setToken(response.data.access_token);
            }).catch(e => console.error('Token error', e));
        }
    }

    onLogout() {
        this.props.logout();
    }

    render() {
        const list = this.props.listType ? <ModelList/> : <ModelListWeek/>;
        return (
            <BrowserRouter>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4 hi nopad left-scroll dark">
                            <div className='my-menu'>
                                <ListSelector style='margin-left: 16px;'/>
                                <NavLink exact={true} activeStyle={{display: 'none'}} className="btn btn-primary btn-sm"
                                         to="/">Пользователи</NavLink>
                            </div>
                            {list}
                        </div>
                        <div className="col-md-8 hi nopad">
                            <div className='my-menu'>
                                <UserInfo onLogout={this.onLogout} a360={this.props.a360}/>
                            </div>
                            <Downloads/>
                            <div style={{padding: '8px'}}>
                                <Route exact path='/' component={History}/>
                                <Route path='/token' component={Token}/>
                                <Route key={location} location={location} path='/model/:id' component={ModelDetails}/>
                            </div>
                        </div>
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

function mapStateToProps(state) {
    return {
        showHistory: !state.details,
        listType: state.settings.listType,
        a360: state.a360
    };
}

function mapDispatchToProps(dispatch) {
    const actions = bindActionCreators({fetchModels, fetchHistory, logout, getA360Info, setUserId, setToken}, dispatch);
    return {...actions, dispatch};
}

const App = connect(mapStateToProps, mapDispatchToProps)(_App);
export default App;