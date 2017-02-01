import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

const newSim = (props) => <FileUploadEntry name="dataset" label="Result file" owner={props.owner} />;

newSim.propTypes = {
  owner: React.PropTypes.func,
};

export default newSim;
