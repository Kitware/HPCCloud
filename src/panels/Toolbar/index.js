import React from 'react';
import Breadcrumb from '../../panels/Breadcrumb';
import merge from 'mout/src/object/merge';
import style from 'HPCCloudStyle/Toolbar.mcss';
import states from 'HPCCloudStyle/States.mcss';

export default React.createClass({
  displayName: 'PreferenceSubBar',

  propTypes: {
    actions: React.PropTypes.array,
    breadcrumb: React.PropTypes.object,
    hasTabs: React.PropTypes.bool,
    filter: React.PropTypes.bool,
    hidden: React.PropTypes.bool,
    location: React.PropTypes.object,
    onAction: React.PropTypes.func,
    title: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object,
    ]),
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
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
    };
  },

  onAction(event) {
    const action = event.target.dataset.action;
    if (this.props.onAction) {
      this.props.onAction(action);
    }
  },

  updateFilter(e) {
    const filter = e.target.value;

    this.context.router.replace({
      pathname: this.props.location.pathname,
      query: merge(this.props.location.query, { filter }),
      state: this.props.location.state,
    });
  },

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
  },
});
