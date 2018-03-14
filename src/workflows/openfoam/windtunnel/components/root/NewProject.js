import React from 'react';
import { FileUploadEntry } from '../../../../../panels/ItemEditor';

function extractFileName(name) {
  return (file) =>
    new Promise((accept, reject) => {
      accept({ [name]: file.name });
    });
}

export default function newProject(props) {
  return (
    <div>
      <FileUploadEntry
        name="mesh"
        label="Mesh"
        accept=".obj"
        owner={props.owner}
        postProcess={extractFileName('mesh')}
      />
    </div>
  );
}

newProject.propTypes = {
  owner: React.PropTypes.func,
};
