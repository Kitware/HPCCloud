import React from 'react';

export default React.createClass({

  displayName: 'FormPanel/EnumInput',

  propTypes: {
    id: React.PropTypes.string,
    item: React.PropTypes.object,
    value: React.PropTypes.string,
    style: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  editField(event) {
    const value = event.target.value;
    if (this.props.onChange) {
      this.props.onChange(this.props.id, value);
    }
  },

  render() {
    const { style, item, value } = this.props;

    return (
      <section className={style.group}>
        <label className={style.label} title={item.description}>{item.label}</label>
        <select
          className={style.input}
          value={ value }
          onChange={this.editField}
        >
        { item.values.map(option =>
          <option key={ option } value={ option }>{ option }</option>
        )}
        </select>
      </section>);
  },
});
