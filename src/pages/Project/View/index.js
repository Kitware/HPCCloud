import React                from 'react';
import { SimulationHelper } from '../../../utils/AccessHelper';
import TableListing         from '../../../panels/TableListing';

import client               from '../../../network';

import breadCrumbStyle      from 'HPCCloudStyle/Theme.mcss';

export default React.createClass({

  displayName: 'Project/View',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getInitialState() {
    return {
      project: { name: '' },
      simulations: [],
    };
  },

  componentWillMount() {
    this.updateState();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this.updateState(nextProps.params.id);
    }
  },

  onAction(action, selectedItems) {
    if (selectedItems) {
      this[action](selectedItems);
    } else {
      this[action]();
    }
  },

  updateState(id = this.props.params.id) {
    client.getProject(id)
      .then(resp => this.setState({ project: resp.data }))
      .catch(err => {
        this.setState({ _error: err.data.message });
        console.log('Error Project/View-getProject', err);
      });

    client.getProjectSimulations(id)
      .then(resp => this.setState({ simulations: resp.data }))
      .catch(err => {
        this.setState({ _error: err.data.message });
        console.log('Error Project/View-getProjectSimulations', err);
      });
  },

  addItem() {
    this.context.router.replace(`/New/Simulation/${this.props.params.id}`);
  },

  deleteItems(items) {
    /* eslint-disable no-alert */
    if (!confirm(`Are you sure you want to delete ${items.length === 1 ? 'this' : 'these'} ${items.length} simulation${items.length === 1 ? '' : 's'}?`)) {
      return;
    }
    Promise.all(items.map((sim) => client.deleteSimulation(sim._id)))
      .then((resp) => {
        this.updateState();
      })
      .catch((error) => {
        console.log('problem deleting simulations', error);
      });
  },

  render() {
    return (
      <TableListing
        breadcrumb={{
          paths: ['/', `/View/Project/${this.props.params.id}`],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
            breadCrumbStyle.breadCrumbProjectIcon,
          ] }}
        location={ this.props.location }
        accessHelper={ SimulationHelper }
        items={ this.state.simulations }
        onAction={ this.onAction }
        title="Simulations"
      />);
  },
});
