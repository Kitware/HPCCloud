import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

import theme from 'HPCCloudStyle/Theme.mcss';

import TableListing from '../../../panels/TableListing';
import EmptyPlaceholder from '../../../panels/EmptyPlaceholder';
import { ProjectHelper } from '../../../utils/AccessHelper';
import { primaryBreadCrumbs } from '../../../utils/Constants';

import { dispatch } from '../../../redux';
import * as Actions from '../../../redux/actions/projects';

class ProjectAll extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
  }

  onAction(action, arg) {
    this[action](arg);
  }

  addItem() {
    this.props.history.push({
      pathname: '/New/Project',
      search: `?${queryString.stringify(
        Object.assign({}, queryString.parse(this.props.location.search), {
          filter: '',
        })
      )}`,
      state: this.props.location.state,
    });
  }

  deleteItems(items) {
    /* eslint-disable no-alert */
    /* eslint-disable no-restricted-globals */
    if (
      !confirm(
        `Are you sure you want to delete ${
          items.length === 1 ? 'this' : 'these'
        } ${items.length} project${items.length === 1 ? '' : 's'}?`
      )
    ) {
      return;
    }
    items.forEach((project) => this.props.onDeleteItem(project));
  }

  edit(id) {
    this.props.history.push(`/Edit/Project/${id}`);
  }

  click({ id, location }) {
    console.log('click', id, location);
    this.props.onActivate(id, location);
  }

  render() {
    return (
      <TableListing
        breadcrumb={primaryBreadCrumbs()}
        location={this.props.location}
        accessHelper={ProjectHelper}
        items={this.props.projects}
        onAction={this.onAction}
        title="Projects"
        hasAccess
        placeholder={
          <EmptyPlaceholder
            phrase={
              <div>
                <h3>Welcome to HPCCloud</h3>
                <span>
                  You haven&apos;t created any projects yet<br />
                  Add one with the <i className={theme.addIcon} /> above.
                </span>
              </div>
            }
          />
        }
      />
    );
  }
}

ProjectAll.propTypes = {
  projects: PropTypes.array,
  onActivate: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,

  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

ProjectAll.defaultProps = {
  projects: [],
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default withRouter(
  connect(
    (state) => {
      return {
        projects: state.projects.list.map((id) => state.projects.mapById[id]),
      };
    },
    () => {
      return {
        onActivate: (id, location) =>
          dispatch(Actions.setActiveProject(id, location)),
        onDeleteItem: (project) => dispatch(Actions.deleteProject(project)),
      };
    }
  )(ProjectAll)
);
