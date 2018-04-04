import React from 'react';
import PropTypes from 'prop-types';

import states from 'HPCCloudStyle/States.mcss';
import editor from 'HPCCloudStyle/ItemEditor.mcss';

// PROPS:
// `children`: A child element to display to the left of the buttons
// `actions`: a list of actions in the format {name, label, icon}
//            name: id and action to pass to onAction,
//            label: button label,
//            icon: css class for icon
// `onAction`: calls a delegate function which has the same prototype as the action's name
// `visible`: if the bar is visible or not.
export default class ButtonBar extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
  }

  onAction(event) {
    const action = event.currentTarget.dataset.action;
    if (this.props.onAction) {
      this.props.onAction(action);
    }
  }

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <div className={editor.buttonGroup}>
        <span>{this.props.children}</span>
        <div className={editor.buttonContainer}>
          <span
            className={this.props.error ? editor.errorBox : states.isHidden}
          >
            {this.props.error}
          </span>
          {this.props.actions.map((action, index) => (
            <button
              className={editor.button}
              key={`${action.name}_${index}`}
              data-action={action.name}
              onClick={this.onAction}
              disabled={action.disabled}
            >
              {action.label} <i className={action.icon} />
            </button>
          ))}
        </div>
      </div>
    );
  }
}

ButtonBar.propTypes = {
  actions: PropTypes.array,
  children: PropTypes.object,
  error: PropTypes.string,
  onAction: PropTypes.func,
  visible: PropTypes.bool,
};

ButtonBar.defaultProps = {
  visible: true,
  actions: [],
  children: undefined,
  error: '',
  onAction: undefined,
};
