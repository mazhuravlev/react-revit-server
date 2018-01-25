import React, {Component} from 'react';
import ModelList from "../containers/model_list";
import {fetchHistory, fetchModels} from "../actions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ModelDetails from "../containers/model_details";
import History from "../containers/history";
import {BrowserRouter, Link, Route} from "react-router-dom";
import ListSelector from "../containers/list-selector";
import ModelListWeek from "../containers/model_list_week";

class _App extends Component {
    componentDidMount() {
        this.props.fetchModels();
        this.props.fetchHistory();
    }

    render() {
        const list = this.props.listType ? <ModelList/> : <ModelListWeek/>;
        return (
            <BrowserRouter>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4 hi nopad left-scroll">
                            <div className='my-menu'>
                                <Link className="btn" to="/">Статистика</Link>
                                <ListSelector style='margin-left: 16px;'/>
                            </div>
                            {list}
                        </div>
                        <div className="col-md-8 hi">
                            <Route exact path='/' component={History}/>
                            <Route path='/model/:id' component={ModelDetails}/>
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
        listType: state.settings.listType
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchModels, fetchHistory}, dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(_App);
export default App;