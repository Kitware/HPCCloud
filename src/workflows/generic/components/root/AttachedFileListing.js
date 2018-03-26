import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import client from '../../../../network';

// ----------------------------------------------------------------------------

export default class AttachedFileListing extends React.Component {
  constructor(props) {
    super(props);

    // Manage internal state
    this.state = { files: [] };

    // Retreive file informations
    if (props.parentProps[props.containerName]) {
      const fileKeyIdMap =
        props.parentProps[props.containerName].metadata.inputFolder.files;
      const fileKeys = Object.keys(fileKeyIdMap);
      const files = [];
      fileKeys.forEach((fileKey) => {
        client
          .getFile(fileKeyIdMap[fileKey])
          .then((resp) => {
            files.push({ name: fileKey, fileName: resp.data.name });
            if (files.length === fileKeys.length) {
              this.setState({ files });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    } else {
      console.error(
        'AttachedFileListing has invalid containerName',
        props.containerName
      );
    }
  }

  render() {
    return (
      <div>
        {this.state.files.map((file, index) => (
          <div className={style.group} key={`${file.name}_${index}`}>
            <div className={style.label}>{file.name}</div>
            <input
              className={style.input}
              type="text"
              value={file.fileName}
              disabled
            />
          </div>
        ))}
      </div>
    );
  }
}

// ----------------------------------------------------------------------------

AttachedFileListing.propTypes = {
  parentProps: PropTypes.object,
  containerName: PropTypes.string,
};

AttachedFileListing.defaultProps = {
  parentProps: undefined,
  containerName: undefined,
};
