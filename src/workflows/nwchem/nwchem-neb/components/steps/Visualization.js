import React        from 'react';
import candela      from 'candela';
import client       from '../../../../../network';
import LoadingPanel from '../../../../../panels/LoadingPanel';

const auToEv = 27.2116;
const evToKcal = 23.06;
const auToKcal = auToEv * evToKcal;
const x = 'Reaction Coordinate';
const y = 'Energy (kcal/mol)';

// ----------------------------------------------------------------------------

function extractEnergies(energyData) {
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
  energies = energies.map((point) => {
    point[y] = (point[y] + Math.abs(minimumEnergy)) * auToKcal;

    return point;
  });

  return energies;
}

// ----------------------------------------------------------------------------

export default class VisualizationView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { energies: [] };

    // Look up and fetch neb.neb_final_epath
    client.listItems({
      folderId: props.simulation.metadata.outputFolder._id,
      name: 'neb.neb_final_epath',
    })
    .then((resp) => client.listFiles(resp.data[0]._id))
    // Finally download the file
    .then((resp) => client.downloadFile(resp.data[0]._id))
    .then((resp) => {
      this.setState({
        energies: extractEnergies(resp.data),
      });
    })
    .catch((error) => {
      console.error('Unable to neb.neb_final_epath.');
      // throw error;
    });
  }

  componentDidUpdate() {
    if (this.container) {
      // Add indexes to values, to use when a point is clicked on
      const energies = this.state.energies.map((energy, index) => {
        energy.index = index;
        return energy;
      });

      this.chart = new candela.components.LineChart(this.container, {
        data: energies,
        x,
        y: [y],
        width: (this.container.getClientRects()[0].width - 20) || 600,
        height: (this.container.getClientRects()[0].height - 20) || 400,
        showPoints: true,
      });

      this.chart.on('click', (d, item) => {
        // Place holder
      });

      this.chart.render();
    }
  }

  render() {
    if (this.state.energies.length === 0) {
      return <LoadingPanel />;
    }
    return (<div style={{ width: '100%', height: '100%', padding: 10 }} ref={(c) => (this.container = c)} />);
  }
}

VisualizationView.propTypes = {
  simulation: React.PropTypes.object,
};
