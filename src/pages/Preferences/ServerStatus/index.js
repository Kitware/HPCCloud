// import client           from '../../../network';
import ActiveList       from '../../../panels/ActiveList';
import Toolbar          from '../../../panels/Toolbar';
import React            from 'react';
import { breadcrumb }   from '..';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

// import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import * as Actions from '../../../redux/actions/statuses';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 3 });

const StatusPage = React.createClass({
  displayName: 'Preferences/Status',

  propTypes: {
    active: React.PropTypes.number,
    activeData: React.PropTypes.array,
    list: React.PropTypes.array,
    error: React.PropTypes.string,
    onActiveChange: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      error: null,
      active: 0,
      list: [],
      buttonsDisabled: false,
      presetNames: [],
    };
  },

  activeChange(active) {
    this.props.onActiveChange(active);
  },

  render() {
    const { active, activeData, list } = this.props;
    return (
      <div className={ style.rootContainer }>
        <Toolbar
          breadcrumb={ clusterBreadCrumb }
          title="Status"
          onAction={this.addItem}
        />
        <div className={ style.container }>
          <ActiveList
            className={ style.menu }
            onActiveChange={this.activeChange}
            active={active}
            list={list}
          />
          <div className={ style.content }>
            {activeData.map((el) => <p key={el._id}>{el.name}</p>)}
          </div>
        </div>
      </div>);
  },
});

// Binding

export default connect(
  state => {
    const localState = state.preferences.statuses;
    return {
      list: localState.list,
      active: localState.active,
      activeData: localState.activeData,
    };
  },
  dispatch => ({
    onActiveChange: (index) => dispatch(Actions.updateActiveType(index)),
  })
)(StatusPage);
