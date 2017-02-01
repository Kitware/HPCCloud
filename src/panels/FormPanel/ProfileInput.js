import React from 'react';
import ActiveList from '../ActiveList';
import deepEquals from 'mout/src/lang/deepEquals';
import FormPanel from '.';

import style from 'HPCCloudStyle/Profile.mcss';

export default React.createClass({

  displayName: 'FormPanel/ProfileInput',

  propTypes: {
    id: React.PropTypes.string,
    item: React.PropTypes.object,
    value: React.PropTypes.array,
    style: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  getInitialState() {
    return {
      active: 0,
      data: this.props.value,
    };
  },

  componentWillReceiveProps(nextProps) {
    const data = nextProps.value,
      oldData = this.props.value;

    if (!deepEquals(data, oldData)) {
      this.setState({ data });
    }
  },

  activeChange(active) {
    this.setState({ active });
  },

  updateProfiles(data) {
    this.setState({ data });
    if (this.props.onChange) {
      this.props.onChange(this.props.id, data);
    }
  },

  addProfile() {
    const data = this.state.data;
    data.push({ name: 'New profile' });
    this.updateProfiles(data);
  },

  removeProfile() {
    const { data, active } = this.state;
    if (active < data.length) {
      data.splice(active, 1);
      this.updateProfiles(data);
    }
  },

  updateProfile(profile) {
    const { data, active } = this.state;
    const newData = data
      .slice(0, active)
      .concat([profile])
      .concat(data.slice(active + 1));

    this.updateProfiles(newData);
  },

  updateProfileName(event) {
    const name = event.target.value;
    const { data, active } = this.state;
    if (!data[active]) {
      data[active] = { name };
    } else {
      data[active].name = name;
    }
    this.updateProfiles(data);
  },

  render() {
    const item = this.props.item;

    return (
      <div className={ style.container }>
        <div className={ style.header }>
          <label
            className={ style.label }
            title={ item.description }
          >{ item.label }</label>
          <div className={ style.buttons }>
            <i className={ style.addIcon } onClick={ this.addProfile } />
            <i className={ style.removeIcon } onClick={ this.removeProfile } />
          </div>
        </div>
        <div className={ style.content }>
          <ActiveList
            className={ style.menu }
            onActiveChange={ this.activeChange }
            active={this.state.active}
            list={ this.state.data }
          />
          <div className={ this.state.data.length ? style.subContent : style.hiddenSubContent }>
            <section className={ this.props.style.group }>
              <label
                className={ this.props.style.label }
                title="Name of the profile"
              >Profile name</label>
              <input
                className={ this.props.style.input }
                type="text"
                value={ this.state.data[this.state.active] ? this.state.data[this.state.active].name : 'No profile' }
                onChange={ this.updateProfileName }
                required
              />
            </section>
            <FormPanel
              config={ item.profile }
              style={ this.props.style }
              data={ this.state.data[this.state.active] }
              onChange={ this.updateProfile }
            />
          </div>
        </div>
      </div>);
  },
});
