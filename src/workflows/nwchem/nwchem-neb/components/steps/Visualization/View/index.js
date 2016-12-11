import React from 'react';
import candela from 'candela';
import client from '../../../../../../../network';

const auToEv = 27.2116;
const evToKcal = 23.06;
const auToKcal = auToEv * evToKcal;
const x = 'Reaction Coordinate';
const y = 'Energy (kcal/mol)';

const VisualizationView = React.createClass({

  displayName: 'nwchem_neb/steps/Visualization',

  propTypes: {
    simulation: React.PropTypes.object,
  },

  getInitialState() {
    return { energies: [] };
  },

  componentDidMount() {
    // Look up and fetch neb.neb_final_epath
    client.listItems({
      folderId: this.props.simulation.metadata.outputFolder._id,
      name: 'neb.neb_final_epath',
    })
    .then((resp) => client.listFiles(resp.data[0]._id))
    // Finally download the file
    .then((resp) => client.downloadFile(resp.data[0]._id))
    .then((resp) => {
      this.setState({
        energies: this._extractEnergies(resp.data),
      });
      this._createLineChart();
    }).catch((error) => {
      console.error('Unable to neb.neb_final_epath.');
      throw error;
    });
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.chart) {
      this.chart.render();
    }
  },

  _extractEnergies(energyData) {
    var energies = [];
    energyData.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine.startsWith('#') && trimmedLine.length > 0) {
        const parts = trimmedLine.split(/\s+/);
        const point = {};
        point[x] = Number.parseFloat(parts[0].trim());
        point[y] = Number.parseFloat(parts[1].trim());
        energies.push(point);
      }
    });

    const minimumEnergy = Math.min(...energies.map((point) => Number.parseFloat(point[y])));

    // Convert energies to kcal and make positive
    energies = energies.map(point => {
      point[y] = (point[y] + Math.abs(minimumEnergy)) * auToKcal;

      return point;
    });

    return energies;
  },
  _createLineChart() {
    this.chart = new candela.components.LineChart(this.refs.container, {
      data: this.state.energies,
      x,
      y: [y],
      width: 700,
      height: 400,
    });

    this.chart.render();
  },

  render() {
    return (<div ref="container"></div>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */
export default VisualizationView;
