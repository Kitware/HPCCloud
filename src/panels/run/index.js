import React from 'react';
import PropTypes from 'prop-types';

import formStyle from 'HPCCloudStyle/ItemEditor.mcss';

import RunCluster from './RunCluster';
import RunEC2 from './RunEC2';

export default function RunClusterForm(props) {
  let serverForm = null;
  switch (props.serverType) {
    case 'EC2':
      serverForm = (
        <RunEC2
          contents={props.profiles.EC2}
          onChange={props.dataChange}
          clusterFilter={props.clusterFilter}
        />
      );
      break;
    case 'Traditional':
      serverForm = (
        <RunCluster
          contents={props.profiles.Traditional}
          onChange={props.dataChange}
          clusterFilter={props.clusterFilter}
        />
      );
      break;
    default:
      serverForm = <span>no valid serverType: {props.serverType}</span>;
  }

  const optionMapper = (el, index) => (
    <option key={`${el}_${index}`} value={el}>
      {el}
    </option>
  );

  return (
    <div>
      <section className={formStyle.group}>
        <label className={formStyle.label}>Server Type</label>
        <select
          className={formStyle.input}
          value={props.serverType}
          onChange={props.serverTypeChange}
        >
          {Object.keys(props.profiles).map(optionMapper)}
        </select>
      </section>
      <section>{serverForm}</section>
    </div>
  );
}

RunClusterForm.propTypes = {
  serverType: PropTypes.string,
  serverTypeChange: PropTypes.func,
  profiles: PropTypes.object,
  dataChange: PropTypes.func,
  clusterFilter: PropTypes.func,
};

RunClusterForm.defaultProps = {
  serverType: undefined,
  serverTypeChange: undefined,
  profiles: undefined,
  dataChange: undefined,
  clusterFilter: undefined,
};
