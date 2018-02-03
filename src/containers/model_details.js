import React, {Component} from 'react';
import {connect} from "react-redux";
import Chart2 from "../components/chart2";
import {downloadModel, downloadNwc, fetchModelDetails} from "../actions";
import {bindActionCreators} from "redux";
import Viewer from "../components/viewer/Viewer";
import axios from 'axios';

function copyToClipboard(text) {
    window.prompt("Копировать: Ctrl+C, Enter", 'RSN://vpp-revit01.main.picompany.ru/' + text.replace(/\\/, '/'));
}

class ModelDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        if (this.props.match) this.props.fetchModelDetails(this.props.match.params.id);
        axios.get('http://bimacadforge.azurewebsites.net/BimacadForgeHelper/GetAccessToken').then(response => {
            this.setState({token: response.data.access_token});
        });
    }

    shouldComponentUpdate() {
        return true;
    }

    componentWillReceiveProps(props) {
        if (this.modelId === props.match.params.id && props.details) {
            return;
        }
        this.props.fetchModelDetails(props.match.params.id);
        this.modelId = props.match.params.id;
    }

    render() {
        const details = this.props.details;
        if (!details) return (<div className='loader'/>);

        const chartData = details.processedHistory;
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
        return (
            <div className="details">
                <h3>{details.name.replace('.rvt', '')}
                </h3>
                <div className="btn-group">
                <button className='btn btn-hover btn-sm' onClick={() => this.props.downloadModel(details.fullName)}
                        disabled={details.fullName in this.props.download}>
                    Подготовить RVT
                </button>
                <button className='btn btn-hover btn-sm' onClick={() => this.props.downloadNwc(details.fullName)}
                        disabled={details.fullName in this.props.download}>
                    Подготовить NWC
                </button>
                    <button className='btn btn-hover btn-sm'
                          onClick={() => copyToClipboard(details.fullName)}>Копировать путь</button>
                </div>

                <div>Всего синхронизаций: {details.history.length}</div>
                <Chart2 data={chartData} color='orange'/>
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
}

function mapStateToProps(state) {
    return {
        details: state.details,
        download: state.download
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchModelDetails, downloadModel, downloadNwc}, dispatch)
}


export default ModelDetails = connect(mapStateToProps, mapDispatchToProps)(ModelDetails);