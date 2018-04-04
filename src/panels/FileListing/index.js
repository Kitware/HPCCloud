import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import style from 'HPCCloudStyle/JobMonitor.mcss';

import { formatFileSize } from '../../utils/Format';
import FilePreview from './FilePreview';

import { dispatch } from '../../redux';
import * as Actions from '../../redux/actions/fs';

const indentWidth = 20;

function buildFolders(fs, id, container = {}, depth = -1) {
  const folder = fs.folderMapById[id];
  const children = [];

  // Fill container
  container[id] = { children, depth };

  // Fill children
  if (folder) {
    container[id].open = folder.open;
    // - folders first
    folder.folderChildren.forEach((folderId) => {
      if (fs.folderMapById[folderId]) {
        const childFolder = fs.folderMapById[folderId].folder;
        if (childFolder) {
          children.push(childFolder);
          buildFolders(fs, childFolder._id, container, depth + 1);
        }
      }
    });

    // - items after
    folder.itemChildren.forEach((itemId) => {
      const item = fs.itemMapById[itemId];
      if (item) {
        children.push(item);
      }
    });
  }

  return container;
}

class FileListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: [], // list of folderId's which are open
      open: false,
      previewOpen: false,
      previewTitle: '',
      previewId: '',
    };

    this.togglePreview = this.togglePreview.bind(this);
    this.closePreview = this.closePreview.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
    this.fileMapper = this.fileMapper.bind(this);
    this.folderMapper = this.folderMapper.bind(this);
    this.openFolderMapper = this.openFolderMapper.bind(this);
    this.superMapper = this.superMapper.bind(this);
    this.toggleAdvanced = this.toggleAdvanced.bind(this);
    this.openFolder = this.openFolder.bind(this);
  }

  componentWillUnmount() {
    this.props.clearFileSelection();
  }

  togglePreview(e) {
    const previewId = e.currentTarget.dataset.id;
    const previewTitle = e.currentTarget.dataset.name;
    this.setState({ previewOpen: this.state.open, previewTitle, previewId });
  }

  closePreview() {
    this.setState({ previewOpen: false });
  }

  toggleSelection(e) {
    const fileId = e.target.dataset.fileId;
    this.props.onFileSelection(fileId);
  }

  fileMapper(file, index) {
    let value;
    const depth = this.props.folders[file.folderId]
      ? this.props.folders[file.folderId].depth + 1
      : 0;

    // size === 0 ? file size : file size and download button
    if (file.size === 0) {
      value = (
        <span>
          <em>{formatFileSize(file.size)}</em>
        </span>
      );
    } else if (this.props.actionsDisabled) {
      value = (
        <span key={file._id}>
          <em>{formatFileSize(file.size)} </em>
        </span>
      );
    } else {
      value = (
        <span key={file._id}>
          <em>{formatFileSize(file.size)} </em>
          <a
            href={`api/v1/item/${file._id}/download?contentDisposition=inline`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className={style.downloadIcon} />
          </a>
          {/* 500,000B (500KB) maximum preview-able size */}
          {file.size <= 500000 ? (
            <i
              className={style.previewIcon}
              data-name={file.name}
              data-id={file._id}
              onClick={this.togglePreview}
            />
          ) : null}
        </span>
      );
    }

    let checkbox = null; // only allow file selection if actions are available
    if (file.meta && file.meta.offline) {
      checkbox = <i className={style.offline} data-file-id={file._id} />;
    } else if (!this.props.actionsDisabled) {
      checkbox = (
        <i
          className={
            this.props.selection.indexOf(file._id) !== -1
              ? style.checked
              : style.unchecked
          }
          onClick={this.toggleSelection}
          data-file-id={file._id}
        />
      );
    }

    return (
      <section key={`${file._id}_${index}`} className={style.listItem}>
        <strong
          className={style.itemContent}
          style={{ paddingLeft: depth * indentWidth }}
        >
          {checkbox}
          <i className={style.fileIcon} /> {file.name}
        </strong>
        <span>{value}</span>
      </section>
    );
  }

  folderMapper(folder, index) {
    const depth = this.props.folders[folder._id].depth;
    return (
      <section
        key={`${folder._id}_${index}`}
        className={style.listItem}
        onClick={this.openFolder}
        data-folder-id={folder._id}
      >
        <strong
          className={style.itemContent}
          style={{ paddingLeft: depth * indentWidth }}
        >
          <i className={style.folderIcon} /> {folder.name}
        </strong>
        <span>...</span>
      </section>
    );
  }

  openFolderMapper(folder, index) {
    const depth = this.props.folders[folder._id].depth;
    return (
      <div key={`${folder._id}_${index}`}>
        <section
          className={style.listItem}
          onClick={this.openFolder}
          data-folder-id={folder._id}
        >
          <strong
            className={style.itemContent}
            style={{ paddingLeft: depth * indentWidth }}
          >
            <i className={style.folderOpenIcon} /> {folder.name}
          </strong>
          <span>...</span>
        </section>
        {this.props.folders[folder._id].children.map(this.superMapper)}
      </div>
    );
  }

  superMapper(el, index) {
    if (!el) {
      return null;
    }
    if (el._modelType === 'item') {
      return this.fileMapper(el, index);
    } else if (el._modelType === 'folder') {
      if (this.props.folders[el._id].open) {
        return this.openFolderMapper(el, index);
      }
      return this.folderMapper(el, index);
    }
    return null;
  }

  toggleAdvanced() {
    this.setState({ open: !this.state.open });
  }

  openFolder(e) {
    const id = e.currentTarget.dataset.folderId;
    const opened = this.state.opened;
    if (!this.props.folders[id].open) {
      opened.splice(opened.indexOf(id), 1);
    } else {
      opened.push(id);
    }

    this.setState({ opened });
    this.props.toggleOpenFolder(id, !this.props.folders[id].open);
  }

  render() {
    // if folderId is not provided just render the toolbar
    if (!this.props.folderId) {
      return (
        <div className={style.toolbar}>
          <div className={style.title}>{this.props.title}</div>
          <div className={style.buttons}>
            <span className={style.count}>files(0)</span>
            <i
              className={
                this.state.open ? style.advancedIconOn : style.advancedIconOff
              }
              onClick={this.toggleAdvanced}
            />
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className={style.toolbar}>
          <div className={style.title}>{this.props.title}</div>
          <div className={style.buttons}>
            <span className={style.count}>
              {`files(${
                this.props.folders[this.props.folderId].children.length
              })`}
            </span>
            <i
              className={
                this.state.open ? style.advancedIconOn : style.advancedIconOff
              }
              onClick={this.toggleAdvanced}
            />
          </div>
        </div>
        <div
          className={this.state.open ? style.taskflowContainer : style.hidden}
        >
          {this.props.folders[this.props.folderId].children.map(
            this.superMapper
          )}
        </div>
        {this.state.previewOpen ? (
          <FilePreview
            contents={this.state.previewContent}
            closer={this.closePreview}
            fileId={this.state.previewId}
            title={this.state.previewTitle}
          />
        ) : null}
      </div>
    );
  }
}

FileListing.propTypes = {
  folderId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  selection: PropTypes.array,
  folders: PropTypes.object, // { [id]: { children: [..], depth: 0 } }
  actionsDisabled: PropTypes.bool, // if true you cannot download or preview files
  toggleOpenFolder: PropTypes.func.isRequired,
  onFileSelection: PropTypes.func.isRequired,
  clearFileSelection: PropTypes.func.isRequired,
};

FileListing.defaultProps = {
  selection: [],
  folders: {},
  actionsDisabled: false,
};

// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */
const pendingRequests = [];

export default connect(
  (state, props) => {
    // FIXME that should be managed inside the state manager
    if (
      props.folderId &&
      !state.fs.folderMapById[props.folderId] &&
      pendingRequests.indexOf(props.folderId) === -1
    ) {
      pendingRequests.push(props.folderId);
      setImmediate(() => {
        dispatch(Actions.fetchFolder(props.folderId));
      });
    } else if (!props.folderId) {
      return { folders: null };
    }

    return {
      selection: state.fs.selection,
      folders: buildFolders(state.fs, props.folderId),
    };
  },
  () => ({
    toggleOpenFolder: (folderId, opening) =>
      dispatch(Actions.toggleOpenFolder(folderId, opening)),
    onFileSelection: (fileId) => dispatch(Actions.toggleFileSelection(fileId)),
    clearFileSelection: () => dispatch(Actions.clearFileSelection()),
  })
)(FileListing);
