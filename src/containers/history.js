import React, {Component} from 'react';
import {connect} from 'react-redux';

class _History extends Component {
    render() {
        const data = this.props.history.map(x => (
            <tr key={x._id}>
                <td>{x._id}</td>
                <td>{x.count}</td>
            </tr>
        ));
        return (
            <table className='table table-condensed'>
                <thead>
                <tr>
                    <th>Пользователь</th>
                    <th>Синхронизаций</th>
                </tr>
                </thead>
                <tbody>
                {data}
                </tbody>
            </table>
        );
    }
}

function mapStateToProps(state) {
    return {history: state.history};
}

const History = connect(mapStateToProps)(_History);
export default History;