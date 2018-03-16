import React from 'react';
import PropTypes from 'prop-types';

import deepClone from 'mout/src/lang/deepClone';

import style from 'HPCCloudStyle/ItemEditor.mcss';

export default class VolumeForm extends React.Component {
  constructor(props) {
    super(props);

    this.formChange = this.formChange.bind(this);
    this.mergeData = this.mergeData.bind(this);
  }

  componentDidMount() {
    const data = deepClone(this.props.data);
    if (this.props.profiles.length) {
      data.profileId = this.props.profiles[0]._id;
    }

    if (this.props.onChange) {
      this.props.onChange(data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.nameInput && nextProps.data && !nextProps.data._id) {
      this.nameInput.focus();
    }
  }

  formChange(event) {
    const propName = event.target.dataset.key;
    const value = event.target.value;
    if (this.props.onChange) {
      const data = deepClone(this.props.data);
      data[propName] = value;
      this.props.onChange(data);
    }
  }

  mergeData(updatedData) {
    const data = Object.assign({}, this.props.data, updatedData);
    this.props.onChange(data);
  }

  render() {
    if (!this.props.data) {
      return null;
    }

    return (
      <div>
        <section className={style.group}>
          <label className={style.label}>Name</label>
          <input
            className={style.input}
            type="text"
            value={this.props.data.name}
            data-key="name"
            onChange={this.formChange}
            disabled={this.props.data._id}
            autoFocus
            required
            ref={(c) => {
              this.nameInput = c;
            }}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Size</label>
          <input
            className={style.input}
            type="number"
            min="1"
            max="16384"
            value={this.props.data.size}
            data-key="size"
            onChange={this.formChange}
            disabled={this.props.data._id}
            required
          />
        </section>
        {/* only valid type on the endpoint is ebs?
          <section className={style.group}>
              <label className={style.label}>Type</label>
              <select
                className={style.input}
                data-key="type"
                onChange={this.formChange}
                disabled={this.props.data._id}
                required
              >
                { Object.keys(types).map((key, index) =>
                  <option key={`${key}_${index}`} value={types[key]}>{key} ({types[key]})</option>)
                }
              </select>
          </section>
          */}
        <section className={style.group}>
          <label className={style.label}>AWS Profile</label>
          <select
            className={style.input}
            data-key="profileId"
            onChange={this.formChange}
            disabled={this.props.data._id}
            defaultValue={
              this.props.profiles.length ? this.props.profiles[0]._id : null
            }
            required
          >
            {this.props.profiles.map((prof) => (
              <option key={`${prof._id}`} value={prof._id}>
                {prof.name}
              </option>
            ))}
          </select>
        </section>
      </div>
    );
  }
}

VolumeForm.propTypes = {
  data: PropTypes.object,
  profiles: PropTypes.array,
  onChange: PropTypes.func,
};

VolumeForm.defaultProps = {
  data: undefined,
  profiles: undefined,
  onChange: undefined,
};
