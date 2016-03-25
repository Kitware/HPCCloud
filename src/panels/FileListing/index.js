import client from '../../network';
import { formatFileSize } from '../../utils/Format';
import React from 'react';
import style from 'HPCCloudStyle/JobMonitor.mcss';

const indentWidth = 20;

export default React.createClass({
  displayName: 'FileListing',

  propTypes: {
    folderId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  },

  getDefaultProps() {
    return {
      title: '',
    };
  },

  getInitialState() {
    return {
      folders: {}, // object of folders: {id, files:[...files for folder], open: true|false}
      items: [],   // array of top level files for this.props.folderId
      open: false,
    };
  },

  componentDidMount() {
    this.updateState(this.props.folderId);
  },

  updateState(folderId, parentFolder = false, open = false) {
    var items,
      folders;
    if (parentFolder) {
      folders = this.state.folders;
    } else {
      folders = {};
    }

    // restore from cache, no need to requery folders and files
    if (this.state.folders[folderId] && this.state.folders[folderId].files.length) {
      folders[folderId].open = open;
      this.setState({ folders });
      return;
    }

    // get items for folder
    client.listItems({ folderId })
      .then((resp) => {
        var promises = resp.data.map((item) => client.getItem(item._id));
        return Promise.all(promises);
      })
      // get folders for folder
      .then((resps) => {
        items = resps.map(item => item.data);
        return client.listFolders({ parentId: folderId, parentType: 'folder' });
      })
      // setState with new folders and items
      .then((resp) => {
        var depth = parentFolder ? this.state.folders[folderId].depth + 1 : 0;
        items = items.concat(resp.data);
        resp.data.forEach((folder) => { folders[folder._id] = { open: false, files: [], depth }; });
        if (parentFolder) {
          folders[folderId].open = open;
          folders[folderId].files = items;
          this.setState({ folders });
        } else {
          this.setState({ folders, items });
        }
      })
      .catch((err) => {
        var msg = err.data && err.data.message ? err.data.message : err;
        console.log(msg);
      });
  },

  fileMapper(file, index) {
    var value,
      depth = this.state.folders[file.folderId] ? this.state.folders[file.folderId].depth + 1 : 0;

    // size === 0 ? file size : file size and download button
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
    return (<section key={`${file.name}_${index}`} className={ style.listItem }>
      <strong className={ style.itemContent } style={{ paddingLeft: depth * indentWidth }}>
        <i className={style.fileIcon}></i> {file.name}
      </strong>
      <span>{value}</span>
    </section>);
  },

  folderMapper(folder, index) {
    var depth = this.state.folders[folder._id].depth;
    return (<section key={`${folder.name}_${index}`} className={ style.listItem } onClick={this.openFolder} data-folder-id={folder._id}>
      <strong className={ style.itemContent } style={{ paddingLeft: depth * indentWidth }}>
        <i className={style.folderIcon}></i> {folder.name}
      </strong>
      <span>...</span>
    </section>);
  },

  openFolderMapper(folder, index) {
    var depth = this.state.folders[folder._id].depth;
    return (<div key={`${folder.name}_${index}`}>
      <section className={ style.listItem } onClick={this.openFolder} data-folder-id={folder._id}>
        <strong className={ style.itemContent } style={{ paddingLeft: depth * indentWidth }}>
          <i className={style.folderOpenIcon}></i> {folder.name}
        </strong>
        <span>...</span>
      </section>
      { this.state.folders[folder._id].files.map(this.superMapper)}
    </div>);
  },

  superMapper(el, index) {
    if (!el) {return null;}
    if (el._modelType === 'item') {
      return this.fileMapper(el, index);
    } else if (el._modelType === 'folder') {
      if (this.state.folders[el._id].open) {
        return this.openFolderMapper(el, index);
      }
      return this.folderMapper(el, index);
    }
    return null;
  },

  toggleAdvanced() {
    this.setState({ open: !this.state.open });
  },

  openFolder(e) {
    var id = e.currentTarget.dataset.folderId;
    this.updateState(id, true, !this.state.folders[id].open);
  },

  render() {
    return (<div>
      <div className={ style.toolbar }>
        <div className={ style.title }>{this.props.title}</div>
        <div className={ style.buttons }>
          <span key={status} className={ style.count }>{ `files(${this.state.items.length})` }</span>
          <i
            className={ this.state.open ? style.advancedIconOn : style.advancedIconOff}
            onClick={ this.toggleAdvanced }
          ></i>
        </div>
      </div>
      <div className={ this.state.open ? style.taskflowContainer : style.hidden }>
        {this.state.items.map(this.superMapper)}
      </div>
    </div>);
  },
});
