import React from 'react';
import PropTypes from 'prop-types';

import merge from 'mout/src/object/merge';
import style from 'HPCCloudStyle/Toolbar.mcss';
import states from 'HPCCloudStyle/States.mcss';

import Breadcrumb from '../../panels/Breadcrumb';

export default class PreferenceSubBar extends React.Component {
  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
  }

  onAction(event) {
    const action = event.target.dataset.action;
    if (this.props.onAction) {
      this.props.onAction(action);
    }
  }

  updateFilter(e) {
    const filter = e.target.value;

    this.context.router.replace({
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { filter }),
      state: this.props.location.state,
    });
  }

  render() {
    return (
      <nav
        className={[
          style.container,
          this.props.hidden ? states.isHidden : '',
        ].join(' ')}
      >
        <Breadcrumb
          className={this.props.hasTabs ? style.toolbarTab : style.breadcrumb}
          paths={this.props.breadcrumb.paths}
          icons={this.props.breadcrumb.icons}
          titles={this.props.breadcrumb.titles}
          labels={this.props.breadcrumb.labels}
          active={this.props.breadcrumb.active}
          hasTabs={this.props.hasTabs}
        />

        <div className={style.title}>{this.props.title}</div>

        <div className={style.actions}>
          {this.props.actions.map((action, index) => (
            <i
              key={`${action.name}_${index}`}
              data-action={action.name}
              onClick={this.onAction}
              className={[style.actionButton, action.icon].join(' ')}
            />
          ))}
          {this.props.filter ? (
            <input
              type="text"
              className={style.filter}
              placeholder="filter"
              value={this.props.location.query.filter || ''}
              onChange={this.updateFilter}
            />
          ) : null}
        </div>
      </nav>
    );
  }
}

PreferenceSubBar.propTypes = {
  actions: PropTypes.array,
  breadcrumb: PropTypes.object,
  hasTabs: PropTypes.bool,
  filter: PropTypes.bool,
  hidden: PropTypes.bool,
  location: PropTypes.object,
  onAction: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

PreferenceSubBar.defaultProps = {
  filter: false,
  actions: [],
  title: '',
  breadcrumb: {
    paths: [],
    icons: [],
    titles: [],
  },
  hasTabs: false,
  hidden: false,
  location: undefined, // FIXME router handler...
  onAction: undefined,
};
