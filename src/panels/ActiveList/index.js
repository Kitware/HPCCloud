import React from 'react';
import style from 'HPCCloudStyle/ActiveList.mcss';

// Expectations:
//   - style:
//       - (li) selectable
//       - (li) unselectable
//       - (li) active
//       - (ul) list
//   - properties:
//       - active: Active index in the list
//       - list: List of object to show
//           - item: name, label, disabled, classPrefix, classSufix
//       - onActiveChange: Callback(activeIdx, activeItem)

export default React.createClass({
  displayName: 'ActiveList',

  propTypes: {
    active: React.PropTypes.number,
    className: React.PropTypes.string,
    list: React.PropTypes.array,
    onActiveChange: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      className: '',
    };
  },

  changeActive(event) {
    var el = event.currentTarget;

    if (this.props.onActiveChange) {
      const newIndex = parseInt(el.dataset.index, 10);
      if (!this.props.list[newIndex].disabled) {
        this.props.onActiveChange(newIndex, this.props.list[newIndex]);
      }
    }
  },

  render() {
    var mapper = (el, index) => (
      <li
        key={`${el.name}_${index}`}
        className={
          el.disabled
            ? style.unselectable
            : this.props.active === index ? style.active : style.selectable
        }
        data-index={index}
        onClick={this.changeActive}
      >
        <i className={el.classPrefix} />
        {el.name}
        <i className={el.classSufix} />
      </li>
    );

    return (
      <ul className={[this.props.className, style.list].join(' ')}>
        {this.props.list.map(mapper)}
      </ul>
    );
  },
});
