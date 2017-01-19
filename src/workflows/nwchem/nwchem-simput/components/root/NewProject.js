import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

function extractFileName(file) {
  return new Promise((accept, reject) => {
    const geometry = file.name;
    accept({ geometry });
  });
}

export default function newProject(props) {
  return (
    <FileUploadEntry
      name="geometry"
      label="Geometry file"
      postProcess={ extractFileName }
      accept=".pdb,.xyz"
      owner={ props.owner }
    />);
}

newProject.propTypes = {
  owner: React.PropTypes.func,
};
