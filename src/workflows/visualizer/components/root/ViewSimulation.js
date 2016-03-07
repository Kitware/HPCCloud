import ActiveList       from '../../../../panels/ActiveList';
import VizModule        from './../../index.js';
import React            from 'react';
import Toolbar          from '../../../../panels/Toolbar';
import client           from '../../../../network';

import style            from 'HPCCloudStyle/PageWithMenu.mcss';
import breadCrumbStyle  from 'HPCCloudStyle/Theme.mcss';

export default React.createClass({

  displayName: 'Visualizer',

  propTypes: {
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    view: React.PropTypes.string,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  updateActiveStep(idx, item) {
    const stepName = VizModule.steps._order[idx];
    client.activateSimulationStep(this.props.simulation, stepName)
      .then(resp => {
        if (stepName === 'Visualization') {
          const stepView = resp.data.steps[stepName].view ? resp.data.steps[stepName].view : 'default',
            taskflowId = resp.data.steps[stepName].metadata.taskflowId;
          this.context.router.replace({
            pathname: ['/View/Simulation', this.props.simulation._id, stepName].join('/'),
            query: {
              view: stepView,
              taskflowId,
            },
            state: {},
          });
        } else {
          this.context.router.replace(['/View/Simulation', this.props.simulation._id, stepName].join('/'));
        }
      })
      .catch(err => {
        console.log('Update active error for', stepName);
        console.log(err);
      });
  },

  render() {
    const componentClass = VizModule.steps[this.props.step][this.props.view];
    const component = componentClass ? React.createElement(componentClass, this.props) : null;
    const stepIdx = VizModule.steps._order.indexOf(this.props.step);

    const menuList = [];
    VizModule.steps._order.forEach(name => {
      menuList.push({
        name,
        label: VizModule.labels[name].default,
        disabled: (this.props.simulation.disabled.indexOf(name) !== -1),
      });
    });

    return (
      <div className={ style.rootContainer }>
          <Toolbar
            breadcrumb={{
              paths: ['/', `/View/Project/${this.props.project._id}`, `/View/Simulation/${this.props.simulation._id}`],
              icons: [
                breadCrumbStyle.breadCrumbRootIcon,
                breadCrumbStyle.breadCrumbProjectIcon,
                breadCrumbStyle.breadCrumbSimulationIcon,
              ],
            }}
            title={ this.props.simulation.name }
          />
          <div className={ style.container }>
              <ActiveList
                className={ style.menu }
                list={menuList}
                active={stepIdx}
                onActiveChange={this.updateActiveStep}
              />
              <div className={ style.content }>
                  { component }
              </div>
          </div>
      </div>);
  },
});
