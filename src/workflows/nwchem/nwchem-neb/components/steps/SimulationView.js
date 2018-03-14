import React from 'react';
import * as SimulationViewHelper from '../../../common/steps/Simulation/View';

const SimulationView = SimulationViewHelper.default;

export default (props) => (
  <SimulationView {...props} actionFunctions={SimulationViewHelper} />
);
