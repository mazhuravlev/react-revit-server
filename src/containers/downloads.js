import React, {Component} from 'react';
import {connect} from "react-redux";
import {removeDownload} from "../actions";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {downloadSelector} from "../selectors/downloadSelector";
import {STATE_FAIL, STATE_START, STATE_SUCCESS} from "../reducers/reducer_download";

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

    getModelDownloadStateView({path, state, link}) {
        switch (state) {
            case STATE_START:
                return <img src={loader}/>;
            case STATE_SUCCESS:
                return <a target='_blank' href={link} className='btn btn-sm btn-primary' onClick={() => this.props.removeDownload(path)}>скачать</a>;
            case STATE_FAIL:
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