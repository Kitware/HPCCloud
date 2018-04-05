import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import Toolbar from '../Toolbar';
import ButtonBar from '../ButtonBar';

function NoOp() {}

/* eslint-disable react/no-multi-comp */

// ----------------------------------------------------------------------------
// FileUploadEntry
// ----------------------------------------------------------------------------

class FileUploadEntry extends React.Component {
  constructor(props) {
    super(props);
    this.processFile = this.processFile.bind(this);
  }

  componentWillUnmount() {
    if (this.props.owner()) {
      this.props.owner().removeMetadata();
      this.props.owner().removeAttachments();
    }
  }

  processFile(event) {
    let file;
    if (event.target.files.length) {
      file = event.target.files[0];
    } else if (event.dataTransfer.files.length) {
      file = event.dataTransfer.files[0];
    }
    event.preventDefault();
    event.stopPropagation();

    if (!file) {
      return;
    }

    // Let's record attachment
    const name = event.target.dataset.name;
    if (this.props.owner && name) {
      this.props.owner().addAttachment(name, file);
    }

    // Let's post process it
    if (this.props.owner && this.props.postProcess) {
      this.props
        .postProcess(file, this.props.owner)
        .then((metadata) => {
          Object.keys(metadata).forEach((key) => {
            this.props.owner().addMetadata(key, metadata[key]);
          });
        })
        .catch((err) => {
          this.input.value = '';
        });
    }
  }

  render() {
    return (
      <div className={style.group}>
        <label className={style.label}>{this.props.label}</label>
        <input
          ref={(c) => {
            this.input = c;
          }}
          className={style.input}
          data-name={this.props.name}
          accept={this.props.accept}
          type="file"
          onChange={this.processFile}
        />
      </div>
    );
  }
}

FileUploadEntry.propTypes = {
  accept: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  owner: PropTypes.func,
  postProcess: PropTypes.func,
};

FileUploadEntry.defaultProps = {
  accept: '*',
  label: undefined,
  name: undefined,
  owner: undefined,
  postProcess: undefined,
};

// ----------------------------------------------------------------------------
// TextEntry
// ----------------------------------------------------------------------------

class TextEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      [props.name]: props.default || '',
    };
    this.updateMetadata = this.updateMetadata.bind(this);
  }

  updateMetadata(event) {
    const name = event.target.dataset.name;
    const value = event.target.value;

    this.setState({ [name]: value });

    if (this.props.owner && name) {
      this.props.owner().addMetadata(name, value);
    }
  }

  render() {
    return (
      <div className={style.group}>
        <label className={style.label}>{this.props.label}</label>
        <input
          className={style.input}
          data-name={this.props.name}
          type="text"
          value={this.state[this.props.name]}
          onChange={this.updateMetadata}
        />
      </div>
    );
  }
}

TextEntry.propTypes = {
  default: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  owner: PropTypes.func,
};

TextEntry.defaultProps = {
  default: undefined,
  label: undefined,
  name: undefined,
  owner: undefined,
};

// ----------------------------------------------------------------------------
// ItemEditor
// ----------------------------------------------------------------------------

export { FileUploadEntry, TextEntry };

export default class ItemEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      description: props.description,
    };

    this.onAction = this.onAction.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.addMetadata = this.addMetadata.bind(this);
    this.removeAttachments = this.removeAttachments.bind(this);
    this.removeMetadata = this.removeMetadata.bind(this);
    this.updateForm = this.updateForm.bind(this);
  }

  componentDidMount() {
    this.attachment = {};
  }

  onAction(action) {
    if (this.props.onAction) {
      this.props.onAction(action, this.state, this.attachment);
    }
  }

  addAttachment(name, file) {
    const attachment = this.attachment || {};
    attachment[name] = file;
    this.attachment = attachment;
  }

  addMetadata(name, value) {
    const metadata = Object.assign({}, this.state.metadata);
    metadata[name] = value;
    this.setState({ metadata });
  }

  removeAttachments() {
    this.attachment = {};
  }

  removeMetadata(key = null) {
    if (key) {
      const metadata = Object.assign({}, this.state.metadata);
      delete metadata[key];
      if (this.attachment[key]) {
        delete this.attachment[key];
      }
      this.setState({ metadata });
      return;
    }

    const metadata = Object.assign({}, this.state.metadata);
    if (this.attachment) {
      Object.keys(this.attachment).forEach((el) => {
        delete metadata[el];
      });
    }
    this.setState({ metadata });
  }

  updateForm(e) {
    const key = e.target.dataset.name;
    const value = e.target.value;

    this.setState({ [key]: value });
  }

  render() {
    return (
      <div className={style.container}>
        <Toolbar
          breadcrumb={
            this.props.breadcrumb || { paths: ['/'], icons: [style.listIcon] }
          }
          title={this.props.title}
        />

        <div className={style.group}>
          <div className={style.label}> Name </div>
          <input
            className={style.input}
            type="text"
            value={this.state.name}
            data-name="name"
            onChange={this.updateForm}
            autoFocus
          />
        </div>
        <div className={style.group}>
          <div className={style.label}> Description </div>
          <textarea
            className={style.input}
            data-name="description"
            rows="5"
            onChange={this.updateForm}
            value={this.state.description}
          />
        </div>
        {this.props.children}
        <ButtonBar
          error={this.props.error}
          actions={this.props.actions}
          onAction={this.onAction}
        />
      </div>
    );
  }
}

ItemEditor.propTypes = {
  actions: PropTypes.array,
  breadcrumb: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  description: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string,
  onAction: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

ItemEditor.defaultProps = {
  actions: [],
  description: '',
  error: '',
  name: '',
  onAction: NoOp,
  title: 'Item editor',
  children: undefined,
  breadcrumb: undefined,
};

/* eslint-enable react/no-multi-comp */
