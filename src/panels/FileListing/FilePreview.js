import React from 'react';
import LoadingPanel from '../LoadingPanel';
import client from '../../network';
import style from 'HPCCloudStyle/Modal.mcss';
import theme from 'HPCCloudStyle/Theme.mcss';

export default React.createClass({
  displayName: 'FilePreview',

  propTypes: {
    fileId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    closer: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return { loading: true, contents: '' };
  },

  componentDidMount() {
    client.downloadItem(this.props.fileId, null, null, 'inline')
      .then((resp) => {
        this.setState({ loading: false, contents: resp.data });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  render() {
    return (<div className={style.modalContainer}>
      <div className={style.header}>
        <span className={style.title}>{this.props.title}</span>
        <i className={style.closeIcon} onClick={this.props.closer}></i>
      </div>
      <div className={`${style.modal} ${theme.fixedWidth}`}>
      { this.state.loading ? <LoadingPanel /> : this.state.contents}
      </div>
    </div>);
  },
});
