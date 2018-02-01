import React, {Component} from 'react';
import {connect} from "react-redux";
import {getA360Info, resetToken, setToken} from "../actions";
import {bindActionCreators} from "redux";
import {Redirect} from "react-router";

const queryString = require('query-string');

class Token extends Component {
    constructor(props) {
        super(props);
        this.state = {data: {}};
    }

    componentWillMount() {
        const {access_token, expires_in, error} = queryString.parse(location.hash.substring(1));
        this.setState({error});
        if (error) {
            this.props.resetToken();
        } else if (access_token) {
            this.props.setToken({access_token, expires_in});
            this.props.getA360Info();
        }
    }

    render() {
        const {access_token, expires_in, error} = this.state.data;
        if (error) {
            return (
                <div className="panel panel-danger">
                    <div className="panel-heading">Ошибка входа в A360</div>
                    <div className="panel-body">{error}</div>
                </div>
            );
        }
        return (
            <div>vasya</div>

        );
        //{/*<Redirect to='/'/>*/}
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({setToken, resetToken, getA360Info}, dispatch);
}

export default Token = connect(mapStateToProps, mapDispatchToProps)(Token);