import client from '../../network';
import { formatFileSize } from '../../utils/Format';
import OutputPanel from '../OutputPanel';
import React from 'react';
import style from 'HPCCloudStyle/JobMonitor.mcss';

export default React.createClass({
  displayName: '',

  propTypes: {
    folderId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  },

  getInitialState() {
    return {
      files: [],
    };
  },

  componentDidMount() {
    client.listItems({ folderId: this.props.folderId })
      .then((resp) => {
        var promises = resp.data.map((item) => client.getItem(item._id));
        return Promise.all(promises);
      })
      .then((resps) => {
        var files = resps.map(item => this.fileMapper(item.data));
        this.setState({ files });
      })
      .catch((err) => {
        var msg = err.data && err.data.message ? err.data.message : err;
        console.log(msg);
      });
  },

  fileMapper(file) {
    var name = file.name;
    var value;
    if (file.size === 0) {
      value = (<span><em>{formatFileSize(file.size)}</em></span>);
    } else {
      value = (<span key={file._id}>
        <em>{formatFileSize(file.size)} </em>
        <a href={`api/v1/item/${file._id}/download`} target="_blank">
          <i className={style.downloadIcon}></i>
        </a>
      </span>);
    }
    return { name, value };
  },

  render() {
    return <OutputPanel title={this.props.title} items={this.state.files} advanced />;
  },
});
