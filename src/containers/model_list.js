import React, {Component} from 'react';
import {connect} from "react-redux";
import * as _ from 'lodash';
import {bindActionCreators} from "redux";
import {fetchModelDetails} from "../actions";
import {decorators, Treebeard} from 'react-treebeard';
import {Link} from "react-router-dom";

class _ModelList extends Component {
    constructor(props) {
        super(props);
        this.decorators = decorators;
        this.state = {};
        this.onToggle = this.onToggle.bind(this);
    }

    renderList(models) {
        return models.map(model => {
            return (
                <tr onClick={() => this.setActiveModel(model)} key={model._id}>
                    <td>{model.name}</td>
                    <td>{model.modelSize}</td>
                </tr>
            );
        });
    }

    onToggle(node, toggled) {
        if (this.state.cursor) {
            this.state.cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState({cursor: node});
    }

    render() {
        const data = this.props.tree;
        if (!data) return null;

        const decorators = {
            Loading: this.decorators.Loading,
            Toggle: this.decorators.Toggle,
            Header: ({node, style}) => {
                const c = node.model ? (
                    <Link className='tree-link' to={'/model/'+node.model._id}><i className="fa fa-file-text" aria-hidden="true"/>{node.name}</Link>
                ) :  node.name;
                return (
                    <div style={style.base}>
                        <div style={style.title}>
                            {c}
                        </div>
                    </div>
                );
            },
            Container: this.decorators.Container
        };

        return (
            <div className='tree'>
                <Treebeard data={data} animations={false} decorators={decorators} onToggle={this.onToggle}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        models: state.models,
        tree: state.tree
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch)
}

const ModelList = connect(mapStateToProps, mapDispatchToProps)(_ModelList);
export default ModelList;