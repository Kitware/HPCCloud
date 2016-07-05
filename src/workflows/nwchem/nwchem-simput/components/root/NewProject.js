import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

function extractPhysicalNames(file) {
  return new Promise((accept, reject) => {
    var reader = new FileReader();
    var boundaries = [];

    reader.onload = function onLoad(e) {
      var keepLooking = true;
      const text = reader.result;
      const lines = text.split(/[\r\n]+/g);
      const nbLines = lines.length;

      for (let i = 0; keepLooking && i < nbLines; i++) {
        keepLooking = (lines[i].indexOf('PhysicalNames') === -1);
        if (!keepLooking) {
          const nbNames = Number(lines[i + 1]);
          for (let nIdx = 0; nIdx < nbNames; nIdx++) {
            boundaries.push(lines[i + 2 + nIdx].split('"')[1]);
          }
        }
      }

      // Return the list of boundaries
      accept({ boundaries });
    };

    reader.readAsText(file);
  });
}

export default React.createClass({

  displayName: 'Project/New/NWChem',

  propTypes: {
    owner: React.PropTypes.func,
  },

  render() {
    return <FileUploadEntry name="molecules" label="Geometry file" postProcess={ extractPhysicalNames } accept=".pdb,.xyz" owner={ this.props.owner } />;
  },
});
