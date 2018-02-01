import React, {Component} from 'react';
import {connect} from 'react-redux';
import {switchListType} from "../actions";
import {bindActionCreators} from "redux";
import "react-toggle/style.css";
import Toggle, {Heart} from 'react-toggle';


class ListSelector extends Component {
    constructor(props) {
        super(props);
        this.onCheckbox = this.onCheckbox.bind(this);
    }

    onCheckbox(e) {
        this.props.switchListType(e.target.checked);
    }

    render() {
        //return <input type='checkbox' onChange={this.onCheckbox} checked={this.props.listType}/>;
        return (
            <span>
                <Toggle
                    defaultChecked={this.props.listType}

                    onChange={this.onCheckbox}/>
            </span>
        );
    }
}

function mapStateToProps(state) {
    return {
        listType: state.settings.listType
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({switchListType}, dispatch);
}

export default ListSelector = connect(mapStateToProps, mapDispatchToProps)(ListSelector);