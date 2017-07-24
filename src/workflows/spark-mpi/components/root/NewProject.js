import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

export default function NewProject(props) {
  return (
    <div>
      <FileUploadEntry name="startScript" label="Start script" accept=".sh" owner={props.owner} />
      <FileUploadEntry name="sparkScript" label="Spark script" accept=".py" owner={props.owner} />
      <FileUploadEntry name="input" label="Input file" accept="*" owner={props.owner} />
    </div>);
}

// ----------------------------------------------------------------------------

NewProject.propTypes = {
  owner: React.PropTypes.func,
};
