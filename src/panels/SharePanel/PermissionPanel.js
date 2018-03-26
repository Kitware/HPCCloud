import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/ItemEditor.mcss';

const permissionLevels = ['Read', 'Write', 'Admin'];

export default class PermissionPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nameKey: props.shareType === 'users' ? 'login' : 'name',
      focused: false,
    };
    this.onSelect = this.onSelect.bind(this);
    this.onPermissionChange = this.onPermissionChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.optionMapper = this.optionMapper.bind(this);
    this.rowMapper = this.rowMapper.bind(this);
  }

  // this replicates the behavior of <select multiple>
  onSelect(e) {
    const event = { which: 'unShareIds' };
    const id = e.currentTarget.dataset.id;
    const multiselect = e.metaKey || e.ctrlKey;

    // if no meta key, the clicked option becomes the sole selected one
    if (!multiselect) {
      event.selected = [e.currentTarget.dataset.id];
      // otherwise concat the option with the others
    } else if (this.props.selected.indexOf(id) === -1) {
      event.selected = this.props.selected.concat([e.currentTarget.dataset.id]);
      // unselect
    } else {
      const tmp = [].concat(this.props.selected);
      tmp.splice(tmp.indexOf(id), 1);
      event.selected = tmp;
    }
    this.props.onSelect(event);
  }

  onPermissionChange(e) {
    this.props.onPermissionChange(
      e.target.parentElement.dataset.id,
      e.target.value
    );
  }

  onFocus() {
    this.setState({ focused: true });
  }

  onBlur() {
    this.setState({ focused: false });
  }

  optionMapper(el, i, arr) {
    // skip the first item, or the last one if !showAdmin
    if (i === 0 || (!this.props.showAdmin && el === 'Admin')) {
      return null;
    }
    // value = i-1 because we skip the first item
    return (
      <option key={`${arr[0].name}_${el}`} value={i - 1}>
        {el}
      </option>
    );
  }

  rowMapper(el, i) {
    if (!el) {
      return null;
    }
    // console.log('key:el, this.state.nameKey);
    const name = el[this.state.nameKey];
    return (
      <div
        onClick={this.onSelect}
        key={el._id}
        data-index={i}
        data-id={el._id}
        className={[
          style.ppRow,
          this.props.selected.indexOf(el._id) !== -1 ? style.selected : null,
        ].join(' ')}
      >
        <span>{name}</span>
        <select
          onChange={this.onPermissionChange}
          data-index={i}
          className={style.ppRowSelect}
          value={this.props.permissions[i].level}
        >
          {[{ name, i }].concat(permissionLevels).map(this.optionMapper)}
        </select>
      </div>
    );
  }

  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  /* eslint-disable jsx-a11y/tabindex-no-positive */
  render() {
    return (
      <div
        className={[
          style.permissionPanelContainer,
          this.state.focused ? style.focused : '',
        ].join(' ')}
        onClick={this.onFocus}
        onBlur={this.onBlur}
        tabIndex="6"
      >
        {this.props.items.map(this.rowMapper)}
      </div>
    );
  }
}

PermissionPanel.propTypes = {
  items: PropTypes.array,
  permissions: PropTypes.array,
  shareType: PropTypes.oneOf(['users', 'groups']).isRequired,
  selected: PropTypes.array,
  showAdmin: PropTypes.bool,
  onSelect: PropTypes.func,
  onPermissionChange: PropTypes.func,
};

PermissionPanel.defaultProps = {
  showAdmin: false,
  items: [],
  selected: [],

  permissions: undefined,
  onSelect: undefined,
  onPermissionChange: undefined,
};
