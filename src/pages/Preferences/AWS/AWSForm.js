import React from 'react';
import PropTypes from 'prop-types';

import deepEquals from 'mout/src/lang/deepEquals';

import style from 'HPCCloudStyle/ItemEditor.mcss';

function preventDefault(e) {
  e.preventDefault();
}

export default class AWSForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
    };
    this.formChange = this.formChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const data = nextProps.data;
    const oldData = this.props.data;

    if (this.nameInput && nextProps.data && !nextProps.data._id) {
      this.nameInput.focus();
    }

    if (!deepEquals(data, oldData)) {
      this.setState({ data });
    }
  }

  formChange(event) {
    const keyPath = event.target.dataset.key.split('.');
    let currentContainer;
    if (this.props.onChange) {
      const lastKey = keyPath.pop();
      const valueToSave = event.target.value;
      const data = this.state.data;

      currentContainer = data;
      while (keyPath.length) {
        currentContainer = currentContainer[keyPath.shift()];
      }

      // Need to push a new availabilityZone
      if (lastKey === 'regionName') {
        data.availabilityZone =
          valueToSave + this.props.regions[valueToSave][0];
      }

      currentContainer[lastKey] = valueToSave;
      this.setState({ data });
      this.props.onChange(data);
    }
  }

  render() {
    if (!this.state.data) {
      return null;
    }

    return (
      <div>
        <form onSubmit={preventDefault}>
          <section className={style.group}>
            <label className={style.label}>Profile name</label>
            <input
              className={style.input}
              type="text"
              value={this.state.data.name}
              data-key="name"
              onChange={this.formChange}
              disabled={this.state.data._id}
              autoFocus
              required
              ref={(c) => {
                this.nameInput = c;
              }}
            />
          </section>
          <section className={style.group}>
            <label className={style.label}>Key Id</label>
            <input
              className={style.input}
              type="text"
              value={this.state.data.accessKeyId}
              data-key="accessKeyId"
              onChange={this.formChange}
              disabled={this.state.data._id}
              required
            />
          </section>
          {this.state.data._id ? null : (
            <section className={style.group}>
              <label className={style.label}>Secret Id</label>
              <input
                className={style.input}
                type="password"
                value={this.state.data.secretAccessKey}
                data-key="secretAccessKey"
                onChange={this.formChange}
                disabled={this.state.data._id}
                required
              />
            </section>
          )}
          <section className={style.group}>
            <label className={style.label}>Region</label>
            <select
              className={style.input}
              value={this.state.data.regionName}
              data-key="regionName"
              onChange={this.formChange}
              disabled={this.state.data._id}
              required
            >
              {Object.keys(this.props.regions).map((reg, index) => (
                <option key={`${reg}_${index}`} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </section>
          <section className={style.group}>
            <label className={style.label}>Availability Zone</label>
            <select
              className={style.input}
              value={this.state.data.availabilityZone}
              data-key="availabilityZone"
              onChange={this.formChange}
              disabled={this.state.data._id}
              required
            >
              {this.props.regions[this.state.data.regionName].map(
                (zone, index) => (
                  <option
                    key={`${zone}_${index}`}
                    value={this.state.data.regionName + zone}
                  >
                    {this.state.data.regionName + zone}
                  </option>
                )
              )}
            </select>
          </section>
        </form>
      </div>
    );
  }
}

AWSForm.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func,
  regions: PropTypes.object,
};

AWSForm.defaultProps = {
  regions: {
    'us-east-1': ['a', 'b', 'c', 'd', 'e'],
    'us-west-1': ['a', 'b', 'c'],
    'us-west-2': ['a', 'b', 'c'],
    'eu-west-1': ['a', 'b', 'c'],
    'eu-central-1': ['a', 'b'],
    'ap-southeast-1': ['a', 'b'],
    'ap-southeast-2': ['a', 'b'],
    'ap-northeast-1': ['a', 'b', 'c'],
    'sa-east-1': ['a', 'b'],
  },
  data: undefined,
  onChange: undefined,
};
