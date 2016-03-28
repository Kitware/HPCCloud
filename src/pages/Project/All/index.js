import merge             from 'mout/src/object/merge';
import React             from 'react';
import TableListing      from '../../../panels/TableListing';
import { ProjectHelper } from '../../../utils/AccessHelper';

import breadCrumbStyle from 'HPCCloudStyle/Theme.mcss';

import { connect }  from 'react-redux';
import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';
import * as Router  from '../../../redux/actions/router';

const ProjectAll = React.createClass({

  displayName: 'Project/All',

  propTypes: {
    location: React.PropTypes.object,
    projects: React.PropTypes.array,
    onActivate: React.PropTypes.func,
    onDeleteItem: React.PropTypes.func,
    onLocationChange: React.PropTypes.func,
  },

  onAction(action, arg) {
    this[action](arg);
  },

  addItem() {
    const location = {
      pathname: '/New/Project',
      query: merge(this.props.location.query, { filter: '' }),
      state: this.props.location.state,
    };
    this.props.onLocationChange(location);
  },

  deleteItems(items) {
    /* eslint-disable no-alert */
    if (!confirm(`Are you sure you want to delete ${items.length === 1 ? 'this' : 'these'} ${items.length} project${items.length === 1 ? '' : 's'}?`)) {
      return;
    }
    items.forEach(project => this.props.onDeleteItem(project));
  },

  edit(id) {
    this.props.onLocationChange(`/Edit/Project/${id}`);
  },

  click({ id, location }) {
    this.props.onActivate(id, location);
  },

  render() {
    return (
      <TableListing
        breadcrumb={{
          paths: ['/'],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
          ] }}
        location={ this.props.location }
        accessHelper={ ProjectHelper }
        items={ this.props.projects }
        onAction={ this.onAction }
        title="Projects"
      />);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    return {
      projects: state.projects.list.map(id => state.projects.mapById[id]),
    };
  },
  () => {
    return {
      onActivate: (id, location) => dispatch(Actions.setActiveProject(id, location)),
      onDeleteItem: (project) => dispatch(Actions.deleteProject(project)),
      onLocationChange: location => dispatch(Router.replace(location)),
    };
  }
)(ProjectAll);

