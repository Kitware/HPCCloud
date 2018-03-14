import React from 'react';

export default React.createClass({
  displayName: 'FormPanel/CheckboxInput',

  propTypes: {
    id: React.PropTypes.string,
    item: React.PropTypes.object,
    value: React.PropTypes.bool,
    style: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  editField(event) {
    if (this.props.onChange) {
      this.props.onChange(this.props.id, !this.props.value);
    }
  },

  render() {
    const { style, item, value } = this.props;

    return (
      <section className={style.group}>
        <label className={style.label} title={item.description}>
          {item.label}
        </label>
        <input
          style={{ position: 'relative', top: '-5px' }}
          type="checkbox"
          checked={value}
          onChange={this.editField}
        />
      </section>
    );
  },
});
