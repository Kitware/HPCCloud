import React from 'react';
import PropTypes from 'prop-types';

import { FileUploadEntry } from '../../../../panels/ItemEditor';

const newSim = (props) => (
  <FileUploadEntry name="dataset" label="Result file" owner={props.owner} />
);

newSim.propTypes = {
  owner: PropTypes.func,
};

newSim.defaultProps = {
  owner: undefined,
};

export default newSim;
