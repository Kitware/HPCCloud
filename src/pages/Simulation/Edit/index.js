import ItemEditor from '../../../panels/ItemEditor';
import React      from 'react';
import Workflows  from '../../../workflows';
import merge      from 'mout/src/object/merge';
import client     from '../../../network';

import breadCrumbStyle  from 'HPCCloudStyle/Theme.mcss';

/* eslint-disable no-alert */
export default React.createClass({

  displayName: 'Simulation/Edit',

  propTypes: {
    params: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getInitialState() {
    return {
      _error: '',
      project: null,
      simulation: null,
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

  updateState(id = this.props.params.id) {
    client.getSimulation(id)
      .then(resp => {
        this.setState({ simulation: resp.data });
        client.getProject(resp.data.projectId)
          .then(pr => this.setState({ project: pr.data }))
          .catch(respErr => {
            this.setState({ _error: respErr.data.message });
            console.log('(EDIT) Error fetching project', respErr);
          });
      })
      .catch(respErr => {
        this.setState({ _error: respErr.data.message });
        console.log('(EDIT) Error fetching sim', respErr);
      });
  },

  onAction(action, data, attachement) {
    this[action](data, attachement);
  },

  saveSimulation(data) {
    const simulation = merge(this.state.simulation, data);

    client.saveSimulation(simulation)
      .then(resp => this.context.router.replace(`/View/Project/${this.state.simulation.projectId}`))
      .catch(err => {
        this.setState({ _error: err.data.message });
        console.log('(Edit) error saving', err);
      });
  },

  cancel() {
    this.context.router.replace(`/View/Project/${this.state.simulation.projectId}`);
  },

  delete() {
    if (!confirm('Are you sure you want to delete this simulation?')) {
      return;
    }
    client.deleteSimulation(this.state.simulation._id)
      .then(resp => this.context.router.replace(`/View/Project/${this.state.simulation.projectId}`))
      .catch(err => {
        this.setState({ _error: err.data.message });
        console.log('(EDIT) Error delete sim', err);
      });
  },

  render() {
    if (!this.state.simulation || !this.state.project) {
      return null;
    }

    const projectId = this.state.simulation.projectId;
    const childComponent = this.state.project.type ? Workflows[this.state.project.type].components.EditSimulation : null;
    const workflowAddOn = childComponent ? React.createElement(childComponent, { owner: () => this.refs.container }) : null;

    return (
      <ItemEditor
        breadcrumb={{
          paths: ['/', `/View/Project/${projectId}`, `/View/Simulation/${this.state.simulation._id}`],
          icons: [
            breadCrumbStyle.breadCrumbRootIcon,
            breadCrumbStyle.breadCrumbProjectIcon,
            breadCrumbStyle.breadCrumbSimulationIcon,
          ],
        }}
        name={this.state.simulation.name}
        description={this.state.simulation.description}
        error={this.state._error}
        ref="container"
        title="Edit Simulation"
        actions={[
          { name: 'delete', label: 'Delete simulation' },
          { name: 'cancel', label: 'Cancel' },
          { name: 'saveSimulation', label: 'Save simulation' }]}
        onAction={ this.onAction }
      >
      { workflowAddOn }
      </ItemEditor>);
  },
});
