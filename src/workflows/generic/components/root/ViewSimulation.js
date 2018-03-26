// A Generic View Simulation provide a general UI
// for simulations composed of several steps.
// That view handle Which step should be visible and
// the action of changing the active one.

import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

import ActiveList from '../../../../panels/ActiveList';
import { activateSimulationStep } from '../../../../network/helpers/simulations';

export default class GenericViewSimulation extends React.Component {
  constructor(props) {
    super(props);
    this.updateActiveStep = this.updateActiveStep.bind(this);
  }

  updateActiveStep(idx, item) {
    const stepName = this.props.module.steps._order[idx];
    activateSimulationStep(this.props.user, this.props.simulation, stepName)
      .then((resp) =>
        this.context.router.replace(
          ['/View/Simulation', this.props.simulation._id, stepName].join('/')
        )
      )
      .catch((err) => {
        console.log('Update active error for', stepName);
        console.log(err);
      });
  }

  render() {
    const module = this.props.module;
    const componentClass = module.steps[this.props.step][this.props.view];
    const component = componentClass
      ? React.createElement(componentClass, this.props)
      : null;
    const stepIdx = module.steps._order.indexOf(this.props.step);

    const menuList = [];
    module.steps._order.forEach((name) => {
      menuList.push({
        name,
        label: module.labels[name].default,
        disabled:
          this.props.simulation.disabled &&
          this.props.simulation.disabled.indexOf(name) !== -1,
      });
    });

    return (
      <div className={style.container}>
        <ActiveList
          className={style.menu}
          list={menuList}
          active={stepIdx}
          onActiveChange={this.updateActiveStep}
        />
        <div className={style.content}>{component}</div>
      </div>
    );
  }
}

GenericViewSimulation.propTypes = {
  module: PropTypes.object,
  simulation: PropTypes.object,
  user: PropTypes.object,
  step: PropTypes.string,
  view: PropTypes.string,
};

GenericViewSimulation.defaultProps = {
  module: undefined,
  simulation: undefined,
  user: undefined,
  step: undefined,
  view: undefined,
};
