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
    return {
      loading: true,
      fullscreen: false,
      contents: '',
    };
  },

  componentDidMount() {
    document.addEventListener('keyup', this.keyPressed);
    client.downloadItem(this.props.fileId, null, null, 'inline')
      .then((resp) => {
        this.setState({ loading: false, contents: resp.data });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  componentWillUnmount() {
    client.cancel();
    document.removeEventListener('keyup', this.keyPressed);
  },

  keyPressed(e) {
    if (e.key === 'Escape') {
      this.props.closer();
    }
  },

  toggleFullscreen(e) {
    this.setState({ fullscreen: !this.state.fullscreen });
  },

  render() {
    return (<div className={`${style.modalContainer} ${this.state.fullscreen ? style.fullscreen : ''}`}>
      <div className={style.header}>
        <span className={style.title}>{this.props.title}</span>
        <i className={style.fullscreenIcon} onClick={this.toggleFullscreen} />
        <i className={style.closeIcon} onClick={this.props.closer} />
      </div>
      <div className={`${style.modal} ${theme.fixedWidth}`}>
        { this.state.loading ? <LoadingPanel /> : this.state.contents}
      </div>
    </div>);
  },
});
