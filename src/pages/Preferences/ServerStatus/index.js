// import client           from '../../../network';
import OutputPanel      from '../../../panels/OutputPanel';
import Toolbar          from '../../../panels/Toolbar';
import React            from 'react';
import { breadcrumb }   from '..';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

// import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 3 });

const StatusPage = React.createClass({
  displayName: 'Preferences/Status',

  propTypes: {
    ec2: React.PropTypes.array,
    clusters: React.PropTypes.array,
  },

  getDefaultProps() {
    return {
      ec2: [],
      clusters: [],
    };
  },

  serverMapper(el, index) {
    return { name: el.name, value: el.status };
  },

  render() {
    return (
      <div className={ style.rootContainer }>
        <Toolbar breadcrumb={ clusterBreadCrumb } title="Status"
          onAction={this.addItem} hasTabs
        />
        <div className={ style.container }>
          <div className={ style.content }>
            <OutputPanel items={ this.props.ec2.map(this.serverMapper) } title="EC2 Profiles" />
            <OutputPanel items={ this.props.clusters.filter((el) => el.type === 'ec2').map(this.serverMapper) } title="EC2 Clusters" />
            <OutputPanel items={ this.props.clusters.filter((el) => el.type === 'trad').map(this.serverMapper) } title="Clusters" />
          </div>
        </div>
      </div>);
  },
});

// Binding
export default connect(
  state => {
    const localState = state.preferences.statuses;
    return {
      ec2: localState.ec2,
      clusters: localState.clusters,
    };
  }
)(StatusPage);
