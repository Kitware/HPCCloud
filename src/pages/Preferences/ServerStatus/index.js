// import client           from '../../../network';
import OutputPanel    from '../../../panels/OutputPanel';
import ExecutionUnit  from '../../../panels/JobMonitor/ExecutionUnit';
import Toolbar        from '../../../panels/Toolbar';
import React          from 'react';
import { breadcrumb } from '..';

import style from 'HPCCloudStyle/JobMonitor.mcss';


// import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import { dispatch }   from '../../../redux';
import * as ClusterActions from '../../../redux/actions/clusters';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 3 });

// EventSource readyStates
// const CONNECTING = 0;
// const OPEN = 1;
const CLOSED = 2;

const StatusPage = React.createClass({
  displayName: 'Preferences/Status',

  propTypes: {
    ec2: React.PropTypes.array,
    ec2Clusters: React.PropTypes.array,
    tradClusters: React.PropTypes.array,

    subscribeClusterLog: React.PropTypes.func,
    unsubscribeClusterLog: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      ec2: [],
      clusters: [],
    };
  },

  componentWillUnmount() {
    const unscriber = (cluster) => {
      if (cluster.logStream && cluster.logStream.readyState !== CLOSED) {
        this.props.unsubscribeClusterLog(cluster._id);
      }
    };
    this.props.ec2Clusters.forEach(unscriber);
    this.props.tradClusters.forEach(unscriber);
  },

  logToggle(id, offset) {
    return (open) => {
      if (open) {
        this.props.subscribeClusterLog(id, offset);
      } else {
        this.props.unsubscribeClusterLog(id);
      }
    };
  },

  profileMapper(el, index) {
    return { name: el.name, value: el.status };
  },

  serverMapper(el, index) {
    const offset = el.log ? el.log.length : 0;
    return (<ExecutionUnit key={el._id} alwaysShowLogToggle
      unit={{ name: el.name, log: (el.log || []), status: el.status }}
      onToggle={this.logToggle(el._id, offset)}
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
            { this.props.ec2Clusters.map(this.serverMapper) }
          </div>

          <div className={ style.toolbar }>
            <div className={ style.title }> Traditional Clusters </div>
            <div className={ style.buttons }></div>
          </div>
          <div className={ style.taskflowContent }>
            { this.props.tradClusters.map(this.serverMapper) }
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
      ec2: localState.statuses.ec2,
      ec2Clusters,
      tradClusters,
    };
  },
  () => ({
    subscribeClusterLog: (id, offset) => dispatch(ClusterActions.subscribeClusterLogStream(id, offset)),
    unsubscribeClusterLog: (id) => dispatch(ClusterActions.unsubscribeClusterLogStream(id)),
  })
)(StatusPage);
