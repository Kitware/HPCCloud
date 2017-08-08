import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

const newSim = (props) => <FileUploadEntry name="input" label="Input file" accept="*" owner={props.owner} />;

newSim.propTypes = {
  owner: React.PropTypes.func,
};

export default newSim;
