import React from 'react';
import PropTypes from 'prop-types';
import style from 'HPCCloudStyle/Toolbar.mcss';

export default class IconActionList extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
  }

  onAction(event) {
    const action = event.target.dataset.action;
    if (this.props.onAction) {
      this.props.onAction(action);
    }
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.props.actions.map((action, index) => (
          <i
            key={`${action.name}_${index}`}
            data-action={action.name}
            onClick={this.onAction}
            className={[style.actionButton, action.icon].join(' ')}
          />
        ))}
      </div>
    );
  }
}

IconActionList.propTypes = {
  actions: PropTypes.array,
  className: PropTypes.string,
  onAction: PropTypes.func,
};

IconActionList.defaultProps = {
  actions: [],
  className: '',
  onAction: undefined,
};
