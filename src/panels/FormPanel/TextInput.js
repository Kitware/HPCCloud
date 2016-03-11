import React from 'react';

export default React.createClass({

  displayName: 'FormPanel/TextInput',

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
        <input
          className={style.input}
          type="text"
          value={ value }
          onChange={this.editField}
          required
        />
      </section>);
  },
});
