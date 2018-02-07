import React, {Component} from 'react';
import {connect} from "react-redux";
import Chart2 from "../components/chart2";
import {downloadModel, downloadNwc, fetchModelDetails} from "../actions";
import {bindActionCreators} from "redux";
import Viewer from "../components/viewer/Viewer";
import axios from 'axios';
import {chartSelector} from "../selectors/chartSelector";
import {STATE_FAIL} from "../reducers/reducer_download";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


function copyToClipboard(text) {
    window.prompt("Копировать: Ctrl+C, Enter", 'RSN://vpp-revit01.main.picompany.ru/' + text.replace(/\\/, '/'));
}

class ModelDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.props.fetchModelDetails(this.props.match.params.id);
        axios.get('http://bimacadforge.azurewebsites.net/BimacadForgeHelper/GetAccessToken').then(response => {
            this.setState({token: response.data.access_token});
        }).catch(e => console.error('Token error', e));
    }

    componentWillReceiveProps({details, match}) {
        console.log('receive props');
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
        const detailsView = isLoading ? null : this.getDetailsView(details, chartData);
        const loaderView = (
            <div key="loader" className='loader'>
            </div>
        );
        return (
            <div>
                {isLoading ? loaderView : detailsView}
            </div>
        );
    }

    getDetailsView(details, chartData) {
        const users = _.sortBy(Object.values(_.groupBy(details.history, 'user')), x => -x.length).map(x => (
            <tr key={x[0].user}>
                <td>{x[0].user}</td>
                <td>{x.length}</td>
            </tr>
        ));
        const viewer = this.state.token ? (<div style={{height: '500px'}}>
            <Viewer urn='urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c29ib3Ivc29ib3IucnZ0'
                    token={this.state.token}
            />
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
                <table className='table'>
                    <thead>
                    <tr>
                        <th>Пользователь</th>
                        <th>Синхронизаций</th>
                    </tr>
                    </thead>
                    <tbody>{users}</tbody>
                </table>
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
        details: state.details,
        download: state.download,
        chartData: chartSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchModelDetails, downloadModel, downloadNwc}, dispatch)
}


export default ModelDetails = connect(mapStateToProps, mapDispatchToProps)(ModelDetails);