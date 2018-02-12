import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import TABLE_SETTINGS from '../tableSettings';

const columns = [{
    Header: 'Пользователь',
    accessor: '_id'
}, {
    Header: 'Синхронизаций',
    accessor: 'count'
}];

class _History extends Component {
    render() {
        return (
            <ReactTable data={this.props.history} columns={columns} {...TABLE_SETTINGS} />
        );
    }
}

function mapStateToProps(state) {
    return {history: state.history};
}

export default History = connect(mapStateToProps)(_History);