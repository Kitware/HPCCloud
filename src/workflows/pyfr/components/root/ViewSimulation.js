import React        from 'react';
import ActiveList   from '../../../../panels/ActiveList';
import { activateSimulationStep } from '../../../../network/helpers/simulations';

import style            from 'HPCCloudStyle/PageWithMenu.mcss';

export default React.createClass({

  displayName: 'PyFrSimulation',

  propTypes: {
    module: React.PropTypes.object,
    project: React.PropTypes.object,
    simulation: React.PropTypes.object,
    step: React.PropTypes.string,
    view: React.PropTypes.string,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  updateActiveStep(idx, item) {
    const stepName = this.props.module.steps._order[idx];
    activateSimulationStep(this.props.simulation, stepName)
      .then(resp => this.context.router.replace(['/View/Simulation', this.props.simulation._id, stepName].join('/')))
      .catch(err => {
        console.log('Update active error for', stepName);
        console.log(err);
      });
  },

  render() {
    const module = this.props.module;
    const componentClass = module.steps[this.props.step][this.props.view];
    const component = componentClass ? React.createElement(componentClass, this.props) : null;
    const stepIdx = module.steps._order.indexOf(this.props.step);

    const menuList = [];
    module.steps._order.forEach(name => {
      menuList.push({
        name,
        label: module.labels[name].default,
        disabled: this.props.simulation.disabled && (this.props.simulation.disabled.indexOf(name) !== -1),
      });
    });

    return (
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
      </div>);
  },
});
