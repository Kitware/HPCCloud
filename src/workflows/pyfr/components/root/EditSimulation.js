import React                from 'react';
import client               from '../../../../network';
import style                from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({

  displayName: 'Simulation/Edit/PyFR',

  propTypes: {
    owner: React.PropTypes.func,
    parentProps: React.PropTypes.object,
  },

  getInitialState() {
    return { files: [] };
  },

  componentDidMount() {
    var simFiles = this.props.parentProps.simulation.metadata.inputFolder.files;
    Object.keys(simFiles).forEach((el) => {
      client.getFile(simFiles[el])
        .then(resp => {
          const fi = { name: el, fileName: resp.data.name };
          const files = [fi].concat(this.state.files);
          this.setState({ files });
        })
        .catch(err => {
          console.log(err);
        });
    });
  },

  render() {
    return (<div>
      { this.state.files.map((fi, index) => (
          <div className={ style.group } key={`${fi.name}_${index}`}>
              <div className={ style.label }>{ fi.name }</div>
              <input className={ style.input }
                type="text"
                value={ fi.fileName }
                disabled
              />
          </div>)
      ) }
    </div>);
  },
});
