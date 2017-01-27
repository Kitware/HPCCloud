import React                from 'react';
import { FileUploadEntry }  from '../../../../../panels/ItemEditor';

function extractFileName(name) {
  return file => new Promise((accept, reject) => {
    accept({ [name]: file.name });
  });
}

export default function newProject(props) {
  return (
    <div>
        <FileUploadEntry
          name="startGeometry"
          label="Starting Geometry file"
          accept=".xyz"
          owner={ props.owner }
          postProcess={ extractFileName('startGeometry') }
        />
        <FileUploadEntry
          name="endGeometry"
          label="Final Geometry file"
          accept=".xyz"
          owner={ props.owner }
          postProcess={ extractFileName('endGeometry') }
        />
    </div>);
}

newProject.propTypes = {
  owner: React.PropTypes.func,
};
