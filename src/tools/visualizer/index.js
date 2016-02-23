import React            from 'react';
import Toolbar          from '../../../../panels/Toolbar';
import * as network     from 'pvw-visualizer/src/network';
import ProxyManager     from 'pvw-visualizer/src/ProxyManager';
import ControlPanel     from 'pvw-visualizer/src/panels/ControlPanel';
import VtkRenderer      from 'paraviewweb/src/React/Renderers/VtkRenderer';

import style            from 'HPCCloudStyle/PageWithMenu.mcss';
import breadCrumbStyle  from 'HPCCloudStyle/Theme.mcss';
import vizStyle         from 'HPCCloudStyle/Visualizer.mcss';

export default React.createClass({

    displayName: 'Visualization',

    propTypes: {
        project: React.PropTypes.object,
        simulation: React.PropTypes.object,
        step: React.PropTypes.string,
        view: React.PropTypes.string,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    getInitialState() {
        return {
            menuVisible: true,
        };
    },

    componentWillMount() {
        network.onReady(() => {
            this.client = network.getClient();
            this.proxyManager = new ProxyManager(this.client);
            this.forceUpdate();
        });

        // Find configuration based on simulation
        const config = { sessionURL: 'ws://localhost:9876/ws' };
        network.connect(config);
    },

    componentWillUnmount() {

    },

    onAction(name) {
        this[name]();
    },

    toggleMenu() {
        this.setState({menuVisible: !this.state.menuVisible});
    },

    resetCamera() {
        if(this.proxyManager) {
            this.proxyManager.resetCamera();
        }
    },

    render() {
        if(!this.proxyManager) {
            console.log('no proxy manager yet');
            return null;
        }

        return (
            <div className={ style.rootContainer }>
                <Toolbar
                    breadcrumb={{
                        paths:['/', `/View/Project/${this.props.project._id}`, `/View/Simulation/${this.props.simulation._id}`],
                        icons:[
                            breadCrumbStyle.breadCrumbRootIcon,
                            breadCrumbStyle.breadCrumbProjectIcon,
                            breadCrumbStyle.breadCrumbSimulationIcon,
                        ],
                    }}
                    actions={[
                        { name: 'toggleMenu',  icon: vizStyle.toggleMenuButton },
                        { name: 'resetCamera', icon: vizStyle.resetCameraButton },
                    ]}
                    onAction={ this.onAction }
                    title={ this.props.simulation.name }/>
                <ControlPanel className={ this.state.menuVisible ? vizStyle.menu : vizStyle.hiddenMenu } proxyManager={ this.proxyManager }/>
                <VtkRenderer { ...this.proxyManager.getNetworkAdapter() } className={ vizStyle.viewport }/>
            </div>);
    },
});
