import React, {Component} from 'react';
import {connect} from "react-redux";
import {removeDownload} from "../actions";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
const loader = require('../loader-sm.gif');


class Download extends Component {
    render() {
        const paths = Object.keys(this.props.download);
        if (!paths.length) return null;
        return (
            <div>
                <table className='table table-condensed downloads-table'>
                    <thead>
                    <tr>
                        <th>Модель</th>
                        <th>Скачать</th>
                    </tr>
                    </thead>
                    <ReactCSSTransitionGroup
                        transitionName="example"
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={300}
                        component="tbody">
                    {paths.map(x => this.makeRow(x))}
                    </ReactCSSTransitionGroup>
                </table>
            </div>
        );
    }

    makeRow(x) {
        return (<tr key={x}>
            <td>{x}</td>
            <td>{this.getModelDownloadStateView(x, this.props.download[x])}</td>
        </tr>);
    }

    getModelDownloadStateView(path, data) {
        switch (data.state) {
            case 'start':
                return <img src={loader} />;
            case 'success':
                return <a target='_blank' href={data.link} onClick={() => this.props.removeDownload(path)}>скачать</a>;
            case 'fail':
                return <span>ошибка</span>;
            default:
                return <span>неожиданная ошибка</span>;
        }
    }
}

function mapStateToProps(state) {
    return {download: state.download};
}

export default Download = connect(mapStateToProps, {removeDownload})(Download);