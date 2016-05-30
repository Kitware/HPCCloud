// import client           from '../../../network';
import OutputPanel    from '../../../panels/OutputPanel';
import ClusterStatus  from './ClusterStatus';
import Toolbar        from '../../../panels/Toolbar';
import React          from 'react';
import { breadcrumb } from '..';

import style from 'HPCCloudStyle/JobMonitor.mcss';


// import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import { dispatch }   from '../../../redux';
import * as ClusterActions from '../../../redux/actions/clusters';
import { fetchServers } from '../../../redux/actions/statuses';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 3 });
const noSimulation = { name: 'no simulation on this cluster.', step: '' };

const StatusPage = React.createClass({
  displayName: 'Preferences/Status',

  propTypes: {
    simulations: React.PropTypes.object,
    ec2: React.PropTypes.array,
    ec2Clusters: React.PropTypes.array,
    tradClusters: React.PropTypes.array,

    getClusterLog: React.PropTypes.func,
    terminateCluster: React.PropTypes.func,
    deleteCluster: React.PropTypes.func,
    fetchClusters: React.PropTypes.func,
    fetchServers: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      ec2: [],
      clusters: [],
    };
  },

  componentDidMount() {
    this.props.fetchClusters();
    this.props.fetchServers();
  },

  logToggle(id, offset) {
    return (open) => {
      if (open) {
        this.props.getClusterLog(id, offset);
      }
    };
  },

  profileMapper(el, index) {
    return { name: el.name, value: el.status };
  },

  ec2Mapper(el, index) {
    const offset = el.log ? el.log.length : 0;
    const activeSimulation = el.config.simulation ? el.config.simulation : noSimulation;
    return (<ClusterStatus key={el._id} title={el.name} status={el.status}
      clusterId={el._id} log={el.log || []}
      simulation={activeSimulation}
      logToggle={this.logToggle(el._id, offset)}
      terminateCluster={this.props.terminateCluster}
      deleteCluster={this.props.deleteCluster}
    />);
  },

  tradClusterMapper(el, index) {
    const offset = el.log ? el.log.length : 0;
    const activeSimulation = el.config.simulation ? el.config.simulation : noSimulation;
    return (<ClusterStatus key={el._id} title={el.name} status={el.status}
      clusterId={el._id} log={el.log || []}
      simulation={activeSimulation}
      logToggle={this.logToggle(el._id, offset)}
      terminateCluster={this.props.terminateCluster}
      deleteCluster={this.props.deleteCluster}
      noControls
    />);
  },

  render() {
    return (
      <div className={ style.rootContainer }>
        <Toolbar breadcrumb={ clusterBreadCrumb } title="Status"
          onAction={this.addItem} hasTabs
        />
        <div className={ style.container }>
          <OutputPanel items={ this.props.ec2.map(this.profileMapper) } title="EC2 Profiles" />

          <div className={ style.toolbar }>
            <div className={ style.title }> EC2 Clusters </div>
            <div className={ style.buttons }></div>
          </div>
          <div className={ style.taskflowContent }>
            { this.props.ec2Clusters.map(this.ec2Mapper) }
          </div>

          <div className={ style.toolbar }>
            <div className={ style.title }> Traditional Clusters </div>
            <div className={ style.buttons }></div>
          </div>
          <div className={ style.taskflowContent }>
            { this.props.tradClusters.map(this.tradClusterMapper) }
          </div>
        </div>
      </div>);
  },
});

// Binding
export default connect(
  state => {
    const localState = state.preferences;
    var ec2Clusters = [],
      tradClusters = [];
    Object.keys(localState.clusters.mapById).forEach((key, index) => {
      const cluster = localState.clusters.mapById[key];
      (cluster.type === 'ec2' ? ec2Clusters : tradClusters).push(cluster);
    });
    return {
      simulations: state.simulations.mapById,
      ec2: localState.statuses.ec2,
      ec2Clusters,
      tradClusters,
    };
  },
  () => ({
    getClusterLog: (id, offset) => dispatch(ClusterActions.getClusterLog(id, offset)),
    terminateCluster: (id) => dispatch(ClusterActions.terminateCluster(id)),
    deleteCluster: (id) => dispatch(ClusterActions.deleteCluster(id)),
    fetchClusters: () => dispatch(ClusterActions.fetchClusters()),
    fetchServers: () => dispatch(fetchServers()),
  })
)(StatusPage);
