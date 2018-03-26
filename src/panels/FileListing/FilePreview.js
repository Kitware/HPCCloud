import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/Modal.mcss';
import theme from 'HPCCloudStyle/Theme.mcss';

import LoadingPanel from '../LoadingPanel';
import client from '../../network';

export default class FilePreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      fullscreen: false,
      contents: '',
    };
    this.keyPressed = this.keyPressed.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyPressed);
    client
      .downloadItem(this.props.fileId, null, null, 'inline')
      .then((resp) => {
        this.setState({ loading: false, contents: resp.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentWillUnmount() {
    client.cancel();
    document.removeEventListener('keyup', this.keyPressed);
  }

  keyPressed(e) {
    if (e.key === 'Escape') {
      this.props.closer();
    }
  }

  toggleFullscreen(e) {
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  render() {
    return (
      <div
        className={`${style.modalContainer} ${
          this.state.fullscreen ? style.fullscreen : ''
        }`}
      >
        <div className={style.header}>
          <span className={style.title}>{this.props.title}</span>
          <i className={style.fullscreenIcon} onClick={this.toggleFullscreen} />
          <i className={style.closeIcon} onClick={this.props.closer} />
        </div>
        <div className={`${style.modal} ${theme.fixedWidth}`}>
          {this.state.loading ? <LoadingPanel /> : this.state.contents}
        </div>
      </div>
    );
  }
}

FilePreview.propTypes = {
  fileId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  closer: PropTypes.func.isRequired,
};
