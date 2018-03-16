import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import style from 'HPCCloudStyle/JobMonitor.mcss';

import ClusterStatus from './ClusterStatus';
import OutputPanel from '../../../panels/OutputPanel';
import Toolbar from '../../../panels/Toolbar';
import { getDisabledButtons } from '../../../utils/getDisabledButtons';
import { breadcrumb } from '..';

import { dispatch } from '../../../redux';
import * as ClusterActions from '../../../redux/actions/clusters';
import * as VolumeActions from '../../../redux/actions/volumes';
import { fetchServers } from '../../../redux/actions/statuses';

const noSimulation = { name: 'no simulation on this cluster.', step: '' };

function matchIdInArray(_id, arr, key = 'name') {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]._id === _id) {
      return arr[i][key];
    }
  }
  return '';
}

function profileMapper(el, index) {
  return {
    _id: el._id,
    Name: el.name,
    Region: el.regionName,
    Status: el.status,
  };
}

class StatusPage extends React.Component {
  constructor(props) {
    super(props);

    this.logToggle = this.logToggle.bind(this);
    this.volumeLogToggle = this.volumeLogToggle.bind(this);
    this.volumesMapper = this.volumesMapper.bind(this);
    this.ec2Mapper = this.ec2Mapper.bind(this);
    this.tradClusterMapper = this.tradClusterMapper.bind(this);
    this.volumeMapper = this.volumeMapper.bind(this);
  }

  componentDidMount() {
    this.props.fetchClusters();
    this.props.fetchServers();
    this.props.fetchVolumes();
  }

  logToggle(id, offset) {
    return (open) => {
      if (open) {
        this.props.getClusterLog(id, offset);
      }
    };
  }

  volumeLogToggle(id, offset) {
    return (open) => {
      if (open) {
        this.props.getVolumeLog(id, offset);
      }
    };
  }

  volumesMapper(el, index) {
    return {
      _id: el._id,
      Name: el.name,
      Size: el.size,
      Status: el.status,
      Cluster: matchIdInArray(el.clusterId, this.props.ec2Clusters),
      Profile: matchIdInArray(el.profileId, this.props.ec2),
    };
  }

  ec2Mapper(el, index) {
    const offset = el.log ? el.log.length : 0;
    const activeSimulation = el.config.simulation
      ? el.config.simulation
      : noSimulation;
    return (
      <ClusterStatus
        key={el._id}
        title={el.name}
        status={el.status}
        clusterId={el._id}
        log={el.log || []}
        simulation={activeSimulation}
        logToggle={this.logToggle(el._id, offset)}
        terminateCluster={this.props.terminateCluster}
        deleteCluster={this.props.deleteCluster}
        disabledButtons={getDisabledButtons(this.props.network, el.taskflow)}
      />
    );
  }

  tradClusterMapper(el, index) {
    const offset = el.log ? el.log.length : 0;
    const activeSimulation = el.config.simulation
      ? el.config.simulation
      : noSimulation;
    return (
      <ClusterStatus
        key={el._id}
        title={el.name}
        status={el.status}
        clusterId={el._id}
        log={el.log || []}
        simulation={activeSimulation}
        logToggle={this.logToggle(el._id, offset)}
        terminateCluster={this.props.terminateCluster}
        deleteCluster={this.props.deleteCluster}
        noControls
      />
    );
  }

  volumeMapper(el, index) {
    const log = this.props.volumeLogs[el._id] || [];
    const offset = el.log ? el.log.length : 0;
    return (
      <ClusterStatus
        key={el._id}
        title={el.name}
        status={el.status}
        log={log}
        logToggle={this.volumeLogToggle(el._id, offset)}
        noControls
      />
    );
  }

  render() {
    const clusterBreadCrumb = breadcrumb(this.props.user, 'Status');
    return (
      <div className={style.rootContainer}>
        <Toolbar
          breadcrumb={clusterBreadCrumb}
          title="Status"
          onAction={this.addItem}
          hasTabs
        />
        <div className={style.container}>
          {/* AWS Profiles */}
          <OutputPanel
            table
            title="AWS Profiles"
            headers={['Name', 'Region', 'Status']}
            items={this.props.ec2.map(profileMapper)}
          />

          {/* EC2 Clusters */}
          <div className={style.toolbar}>
            <div className={style.title}> EC2 Clusters </div>
            <div className={style.buttons} />
          </div>
          <div className={style.taskflowContent}>
            {this.props.ec2Clusters.map(this.ec2Mapper)}
          </div>

          {/* Volumes */}
          <div className={style.toolbar}>
            <div className={style.title}> EBS Volumes </div>
            <div className={style.buttons} />
          </div>
          <div className={style.taskflowContent}>
            {this.props.volumes.map(this.volumeMapper)}
          </div>

          {/* Trad Clusters */}
          <div className={style.toolbar}>
            <div className={style.title}> Traditional Clusters </div>
            <div className={style.buttons} />
          </div>
          <div className={style.taskflowContent}>
            {this.props.tradClusters.map(this.tradClusterMapper)}
          </div>
        </div>
      </div>
    );
  }
}

StatusPage.propTypes = {
  ec2: PropTypes.array,
  volumes: PropTypes.array.isRequired,
  volumeLogs: PropTypes.object,
  ec2Clusters: PropTypes.array.isRequired,
  tradClusters: PropTypes.array.isRequired,
  network: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,

  getClusterLog: PropTypes.func.isRequired,
  terminateCluster: PropTypes.func.isRequired,
  deleteCluster: PropTypes.func.isRequired,
  fetchClusters: PropTypes.func.isRequired,
  fetchServers: PropTypes.func.isRequired,
  fetchVolumes: PropTypes.func.isRequired,
  getVolumeLog: PropTypes.func.isRequired,
};

StatusPage.defaultProps = {
  ec2: [],
  volumeLogs: {},
};

// Binding
export default connect(
  (state) => {
    const localState = state.preferences;
    const ec2Clusters = [];
    const tradClusters = [];
    Object.keys(localState.clusters.mapById).forEach((key, index) => {
      const cluster = localState.clusters.mapById[key];
      (cluster.type === 'ec2' ? ec2Clusters : tradClusters).push(cluster);
    });
    return {
      simulations: state.simulations.mapById,
      network: state.network,
      ec2: localState.statuses.ec2,
      volumes: localState.volumes.list,
      volumeLogs: localState.volumes.logById,
      ec2Clusters,
      tradClusters,
      user: state.auth.user,
    };
  },
  () => ({
    getClusterLog: (id, offset) =>
      dispatch(ClusterActions.getClusterLog(id, offset)),
    terminateCluster: (id) => dispatch(ClusterActions.terminateCluster(id)),
    deleteCluster: (id) => dispatch(ClusterActions.deleteCluster(id)),
    fetchClusters: () => dispatch(ClusterActions.fetchClusters()),
    fetchServers: () => dispatch(fetchServers()),
    fetchVolumes: () => dispatch(VolumeActions.fetchVolumes()),
    getVolumeLog: (id, offset) =>
      dispatch(VolumeActions.getVolumeLog(id, offset)),
  })
)(StatusPage);
