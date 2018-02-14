import React, {Component} from 'react';
import {connect} from "react-redux";
import {removeDownload} from "../actions";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {downloadSelector} from "../selectors/downloadSelector";
import * as TaskStates from "../../shared/taskStates";
const loader = require('../loader-sm.gif');


class Download extends Component {
    render() {
        const {downloads} = this.props;
        if (!downloads.length) return null;
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
                        {downloads.map(download => this.makeRow(download))}
                    </ReactCSSTransitionGroup>
                </table>
            </div>
        );
    }

    makeRow(download) {
        return (<tr key={download.path}>
            <td>{download.path}</td>
            <td>{this.getModelDownloadStateView(download)}</td>
        </tr>);
    }

    getModelDownloadStateView({path, state, link, name}) {
        switch (state) {
            case TaskStates.TASK_NEW:
                return <span>ожидание</span>;
            case TaskStates.TASK_IN_PROGRESS:
                return <img src={loader}/>;
            case TaskStates.TASK_COMPLETE:
                return <a target='_blank' href={link} download={name} className='btn btn-sm btn-primary' onClick={() => this.props.removeDownload(path)}>скачать</a>;
            case TaskStates.TASK_FAILED:
                return <span className='error'>ошибка</span>;
            default:
                return <span className='error'>неожиданная ошибка</span>;
        }
    }
}

function mapStateToProps(state) {
    return {downloads: downloadSelector(state)};
}

export default Download = connect(mapStateToProps, {removeDownload})(Download);