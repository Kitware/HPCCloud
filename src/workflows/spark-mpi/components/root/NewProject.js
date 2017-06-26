import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

export default function NewProject(props) {
  return (
    <div>
      <FileUploadEntry name="tif" label="Tif (tif, tiff)" accept=".tif,.tiff" owner={props.owner} />
    </div>);
}

// ----------------------------------------------------------------------------

NewProject.propTypes = {
  owner: React.PropTypes.func,
};
