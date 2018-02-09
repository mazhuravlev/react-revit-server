import React, {Component} from 'react';
import {connect} from "react-redux";
import Chart2 from "../components/chart2";
import {downloadModel, downloadNwc, fetchModelDetails} from "../actions";
import {bindActionCreators} from "redux";
import Viewer from "../components/viewer/Viewer";
import {chartSelector} from "../selectors/chartSelector";
import {STATE_FAIL} from "../reducers/reducer_download";
import {tokenSelector} from "../selectors/tokenSelector";
import ReactTable from "react-table";
import 'react-table/react-table.css';
import TABLE_SETTINGS from '../tableSettings';
import {detailsHistorySelector} from "../selectors/detailsHistorySelector";


function copyToClipboard(text) {
    window.prompt("Копировать: Ctrl+C, Enter", 'RSN://vpp-revit01.main.picompany.ru/' + text.replace(/\\/, '/'));
}

const userColumns = [{
    Header: 'Пользователь',
    accessor: 'name'
}, {
    Header: 'Синхронизаций',
    accessor: 'count'
}];


class ModelDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadDetails(this.props);
    }

    componentWillMount() {
    }

    componentWillReceiveProps(newProps) {
        this.loadDetails(newProps);
    }

    loadDetails({details, match}) {
        if (!details || details._id !== match.params.id) {
            if (!this.state.loading) {
                this.setState({loading: match.params.id});
                this.props.fetchModelDetails(match.params.id);
            }
        } else if (this.state.loading) {
            this.setState({loading: false});
        }
    }

    render() {
        const {details, chartData} = this.props;
        const isLoading = !details || this.state.loading;
        return isLoading ? <div key="loader" className='loader'/> :
            <div>{this.getDetailsView(details, chartData)}</div>;
    }

    getDetailsView(details, chartData) {
        const viewer = this.props.token ? (<div style={{height: '500px'}}>
            <Viewer urn='urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c29ib3Ivc29ib3IucnZ0' token={this.props.token}/>
        </div>) : null;
        const chart = chartData ? <Chart2 chartData={chartData} color='orange'/> : null;
        return (
            <div className="details" key={`details_${details.fullName}`}>
                <h3>{details.name.replace('.rvt', '')}
                </h3>
                <div className="btn-group">
                    <button className='btn btn-hover btn-sm' onClick={() => this.props.downloadModel(details.fullName)}
                            disabled={this.canDownload(details)}>
                        Подготовить RVT
                    </button>
                    <button className='btn btn-hover btn-sm' onClick={() => this.props.downloadNwc(details.fullName)}
                            disabled={this.canDownload(details)}>
                        Подготовить NWC
                    </button>
                    <button className='btn btn-hover btn-sm'
                            onClick={() => copyToClipboard(details.fullName)}>Копировать путь
                    </button>
                </div>

                <div>Всего синхронизаций: {details.history.length}</div>
                {chart}
                {viewer}
                <ReactTable data={this.props.userData} columns={userColumns} defaultPageSize={5} {...TABLE_SETTINGS}/>
            </div>
        );
    }

    canDownload({fullName}) {
        const {download} = this.props;
        return fullName in download && download[fullName].state !== STATE_FAIL;
    }
}

function mapStateToProps(state) {
    return {
        userData: detailsHistorySelector(state),
        details: state.details,
        download: state.download,
        chartData: chartSelector(state),
        token: tokenSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchModelDetails, downloadModel, downloadNwc}, dispatch)
}


export default ModelDetails = connect(mapStateToProps, mapDispatchToProps)(ModelDetails);