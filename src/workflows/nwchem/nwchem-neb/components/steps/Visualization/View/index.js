import React                   from 'react';
import candela from 'candela';

const VisualizationView = React.createClass({

  displayName: 'nwchem_neb/steps/Visualization',

  getInitialState() {
    var data = [];
    for (var d = 0; d < 10; d += 1) {
      data.push({
        a: d,
        b: d
      });
    }
    return { data };
  },

  componentDidMount() {
    this.chart = new candela.components.LineChart(this.refs.container, {
      data: this.state.data,
      x: 'a',
      y: ['b'],
      width: 700,
      height: 400
    });

    this.chart.render();
  },

  componentWillUpdate(nextProps, nextState) {
    this.chart.render();
  },

  render() {
    return (<div ref="container"></div>);
  }
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */
export default VisualizationView;
