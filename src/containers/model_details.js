import React, {Component} from 'react';
import {connect} from "react-redux";
import Chart2 from "../components/chart2";
import {downloadModel, fetchModelDetails} from "../actions";
import {bindActionCreators} from "redux";

function copyToClipboard(text) {
    window.prompt("Копировать: Ctrl+C, Enter", 'RSN://vpp-revit01.main.picompany.ru/' + text.replace(/\\/, '/'));
}

class ModelDetails extends Component {
    componentWillMount() {
        if (this.props.match) this.props.fetchModelDetails(this.props.match.params.id);
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
        return (
            <div className="details">
                <h3>{details.name.replace('.rvt', '')}
                    <span className='btn btn-my btn-sm'
                          onClick={() => copyToClipboard(details.fullName)}>Копировать</span>
                </h3>
                <button className='btn btn-primary' onClick={() => this.props.downloadModel(details.fullName)}
                disabled={details.fullName in this.props.download}>
                    Подготовить скачивание
                </button>
                <div>Всего синхронизаций: {details.history.length}</div>
                <Chart2 data={chartData} color='orange'/>
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
    return bindActionCreators({fetchModelDetails, downloadModel}, dispatch)
}


export default ModelDetails = connect(mapStateToProps, mapDispatchToProps)(ModelDetails);