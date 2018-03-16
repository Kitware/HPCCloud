import React from 'react';
import PropTypes from 'prop-types';

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

export default class ActiveList extends React.Component {
  constructor(props) {
    super(props);
    this.changeActive = this.changeActive.bind(this);
    this.itemMapper = this.itemMapper.bind(this);
  }

  changeActive(event) {
    const el = event.currentTarget;

    if (this.props.onActiveChange) {
      const newIndex = parseInt(el.dataset.index, 10);
      if (!this.props.list[newIndex].disabled) {
        this.props.onActiveChange(newIndex, this.props.list[newIndex]);
      }
    }
  }

  itemMapper(el, index) {
    return (
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
  }

  render() {
    return (
      <ul className={[this.props.className, style.list].join(' ')}>
        {this.props.list.map(this.itemMapper)}
      </ul>
    );
  }
}

ActiveList.propTypes = {
  active: PropTypes.number,
  className: PropTypes.string,
  list: PropTypes.array,
  onActiveChange: PropTypes.func,
};

ActiveList.defaultProps = {
  className: '',
  active: undefined,
  list: [],
  onActiveChange: () => {},
};
