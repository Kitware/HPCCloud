import React                   from 'react';
import defaultServerParameters from '../../../../../../panels/run/defaults';
import RunClusterFrom          from '../../../../../../panels/run';
import ButtonBar               from '../../../../../../panels/ButtonBar';
import ClusterPayloads         from '../../../../../../utils/ClusterPayload';

import merge                   from 'mout/src/object/merge';

import { connect }  from 'react-redux';
import get          from 'mout/src/object/get';
import { dispatch } from '../../../../../../redux';
import * as Actions from '../../../../../../redux/actions/taskflows';

const VisualizationStart = React.createClass({

  displayName: 'nwchem_neb/steps/Visualization',

  propTypes: {
  },

  getInitialState() {
    return {
    };
  },

  render() {
     return (
        <div>
            DATA
        </div>
    );
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

