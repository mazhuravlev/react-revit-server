import PropTypes from 'prop-types';
import React from 'react';
import './Viewer.scss';

class Viewer extends React.Component {

    static propTypes = {
        panels: PropTypes.array
    };

    static defaultProps = {
        panels: [],
        style: {}
    };

    constructor() {
        super();
        this.state = {showLoader: true};
        this.height = 0;
        this.width = 0;
    }

    componentDidMount() {
        const options = {
            env: 'AutodeskProduction',
            accessToken: this.props.token
        };
        const timeout = setTimeout(() =>
        Autodesk.Viewing.Initializer(options, () => Autodesk.Viewing.Document.load(this.props.urn,
            doc => this.onDocumentLoadSuccess(doc),
            viewerErrorCode => this.onDocumentLoadFailure(viewerErrorCode))), 1000);
        this.setState({timeout});
    }

    componentDidUpdate() {
        if (this.viewer && this.viewer.impl) {
            if (this.viewerContainer.offsetHeight !== this.height ||
                this.viewerContainer.offsetWidth !== this.width) {
                this.height = this.viewerContainer.offsetHeight;
                this.width = this.viewerContainer.offsetWidth;
                this.viewer.resize();
            }
        }
        this.props.panels.map((panel) => {
            panel.emit('update');
        })
    }

    componentWillUnmount() {
        if(this.state.timeout) clearTimeout(this.state.timeout);
        if (this.viewer && this.viewer.impl.selector) {
            this.viewer.tearDown();
            this.viewer.finish();
            this.viewer = null
        }
    }

    render() {
        const viewerClass = 'viewer-loader ' + (this.state.showLoader ? 'active' : 'hidden');
        return (
            <div className="viewer-app-container">
                <div className={viewerClass}/>
                <div ref={(div) => this.viewerContainer = div}
                     className="viewer-container"
                />
            </div>
        );
    }

    onDocumentLoadSuccess(doc) {
        const viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
            type: 'geometry'
        }, true);
        if (viewables.length === 0) {
            console.error('Документ не содержит моделей');
            return;
        }
        const initialViewable = viewables[0];
        const svfUrl = doc.getViewablePath(initialViewable);
        const modelOptions = {
            sharedPropertyDbPath: doc.getPropertyDbPath()
        };
        this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer);
        this.viewer.start(svfUrl, modelOptions, data => this.onLoadModelSuccess(data), e => this.onLoadModelError(e));
    }

    onDocumentLoadFailure(viewerErrorCode) {
        console.error(viewerErrorCode);
    }

    onLoadModelSuccess(data) {
        this.setState({showLoader: false});
    }

    onLoadModelError(e) {
        console.error(e);
    }
}

export default Viewer;
