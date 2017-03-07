// import client           from '../../../network';
import React          from 'react';
import ClusterStatus  from './ClusterStatus';
import OutputPanel    from '../../../panels/OutputPanel';
import Toolbar        from '../../../panels/Toolbar';
import { getDisabledButtons }  from '../../../utils/getDisabledButtons';
import { breadcrumb } from '..';

import style from 'HPCCloudStyle/JobMonitor.mcss';

// import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import { dispatch }   from '../../../redux';
import * as ClusterActions from '../../../redux/actions/clusters';
import * as VolumeActions from '../../../redux/actions/volumes';
import { fetchServers } from '../../../redux/actions/statuses';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 4 });
const noSimulation = { name: 'no simulation on this cluster.', step: '' };

function matchIdInArray(_id, arr, key = 'name') {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]._id === _id) {
      return arr[i][key];
    }
  }
  return '';
}

const StatusPage = React.createClass({
  displayName: 'Preferences/Status',

  propTypes: {
    ec2: React.PropTypes.array,
    volumes: React.PropTypes.array,
    ec2Clusters: React.PropTypes.array,
    tradClusters: React.PropTypes.array,
    network: React.PropTypes.object,

    getClusterLog: React.PropTypes.func,
    terminateCluster: React.PropTypes.func,
    deleteCluster: React.PropTypes.func,
    fetchClusters: React.PropTypes.func,
    fetchServers: React.PropTypes.func,
    fetchVolumes: React.PropTypes.func,
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
    this.props.fetchVolumes();
  },

  logToggle(id, offset) {
    return (open) => {
      if (open) {
        this.props.getClusterLog(id, offset);
      }
    };
  },

  profileMapper(el, index) {
    return { _id: el._id, Name: el.name, Region: el.regionName, Status: el.status };
  },

  volumesMapper(el, index) {
    return {
      _id: el._id,
      Name: el.name,
      Size: el.size,
      Status: el.status,
      Cluster: matchIdInArray(el.clusterId, this.props.ec2Clusters),
      Profile: matchIdInArray(el.profileId, this.props.ec2),
    };
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
      disabledButtons={getDisabledButtons(this.props.network, el.taskflow)}
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
        {/* AWS Profiles */}
          <OutputPanel table title="AWS Profiles"
            headers={['Name', 'Region', 'Status']}
            items={ this.props.ec2.map(this.profileMapper) } />

        {/* EC2 Clusters */}
          <div className={ style.toolbar }>
            <div className={ style.title }> EC2 Clusters </div>
            <div className={ style.buttons } />
          </div>
          <div className={ style.taskflowContent }>
            { this.props.ec2Clusters.map(this.ec2Mapper) }
          </div>

        {/* Volumes */}
          <OutputPanel table title="EBS Volumes"
            headers={['Name', 'Size', 'Status', 'Cluster', 'Profile']}
            items={this.props.volumes.map(this.volumesMapper)} />

        {/* Trad Clusters */}
          <div className={ style.toolbar }>
            <div className={ style.title }> Traditional Clusters </div>
            <div className={ style.buttons } />
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
  (state) => {
    const localState = state.preferences;
    var ec2Clusters = [],
      tradClusters = [];
    Object.keys(localState.clusters.mapById).forEach((key, index) => {
      const cluster = localState.clusters.mapById[key];
      (cluster.type === 'ec2' ? ec2Clusters : tradClusters).push(cluster);
    });
    return {
      simulations: state.simulations.mapById,
      network: state.network,
      ec2: localState.statuses.ec2,
      volumes: localState.volumes.list,
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
    fetchVolumes: () => dispatch(VolumeActions.fetchVolumes()),
  })
)(StatusPage);
