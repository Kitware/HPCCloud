import React from 'react';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

const permissionLevels = ['Read', 'Write', 'Admin'];

export default React.createClass({
  displayName: 'PermissionPanel',

  propTypes: {
    items: React.PropTypes.array,
    permissions: React.PropTypes.array,
    shareType: React.PropTypes.oneOf(['users', 'groups']).isRequired,
    selected: React.PropTypes.array,
    showAdmin: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onPermissionChange: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      showAdmin: false,
      items: [],
      selected: [],
    };
  },

  getInitialState() {
    return {
      nameKey: this.props.shareType === 'users' ? 'login' : 'name',
    };
  },

  onSelect(e) {
    const event = { which: 'unShareIds' };
    const id = e.currentTarget.dataset.id;
    if (this.props.selected.indexOf(id) === -1) {
      event.selected = this.props.selected.concat([e.currentTarget.dataset.id]);
    } else {
      const tmp = [].concat(this.props.selected);
      tmp.splice(tmp.indexOf(id), 1);
      event.selected = tmp;
    }
    this.props.onSelect(event);
  },

  onPermissionChange(e) {
    this.props.onPermissionChange(e.target.parentElement.dataset.id, e.target.value);
  },

  optionMapper(el, i, arr) {
    // skip the first item, or the last one if !showAdmin
    if (i === 0 || (!this.props.showAdmin && el === 'Admin')) {
      return null;
    }
    // value = i-1 because we skip the first item
    return (<option key={`${arr[0].name}_${el}`} value={i - 1}>
      {el}
    </option>);
  },

  rowMapper(el, i) {
    if (!el) {
      return null;
    }
    // console.log('key:el, this.state.nameKey);
    const name = el[this.state.nameKey];
    return (<div onClick={this.onSelect} key={el._id} data-index={i} data-id={el._id}
      className={[style.ppRow, this.props.selected.indexOf(el._id) !== -1 ? style.selected : null].join(' ')}
      >
      <span>{ name }</span>
      <select onChange={this.onPermissionChange} data-index={i} className={style.ppRowSelect} value={this.props.permissions[i].level}>
        { [{ name, i }].concat(permissionLevels).map(this.optionMapper) }
      </select>
    </div>);
  },

  render() {
    return (<div className={style.permissionPanelContainer}>
      { this.props.items.map(this.rowMapper) }
    </div>);
  },
});
