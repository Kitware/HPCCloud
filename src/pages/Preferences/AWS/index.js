import AWSForm          from './AWSForm';
import ActiveList       from '../../../panels/ActiveList';
import ButtonBar        from '../../../panels/ButtonBar';
import Toolbar          from '../../../panels/Toolbar';
import React            from 'react';
import { breadcrumb }   from '..';

import style from 'HPCCloudStyle/PageWithMenu.mcss';

import get          from 'mout/src/object/get';
import { connect }  from 'react-redux';
import * as Actions from '../../../redux/actions/aws';

const awsBreadCrumb = Object.assign({}, breadcrumb, { active: 2 });
function getActions(disabled) {
  return [
    { name: 'removeItem', label: 'Delete', icon: style.deleteIcon, disabled },
    { name: 'saveItem', label: 'Save', icon: style.saveIcon, disabled },
  ];
}

/* eslint-disable no-alert */
const AWSPrefs = React.createClass({

  displayName: 'Preferences/AWS',

  propTypes: {
    active: React.PropTypes.number,
    list: React.PropTypes.array,
    error: React.PropTypes.string,
    buttonsDisabled: React.PropTypes.bool,

    onUpdateItem: React.PropTypes.func,
    onActiveChange: React.PropTypes.func,
    onAddItem: React.PropTypes.func,
    onRemoveItem: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      active: 0,
      profiles: [],
      error: null,
      buttonsDisabled: false,
    };
  },

  changeItem(item) {
    const { active, onUpdateItem } = this.props;
    onUpdateItem(active, item);
  },

  activeChange(active) {
    this.props.onActiveChange(active);
  },

  addItem() {
    this.props.onAddItem();
  },

  removeItem() {
    const { list, active, onRemoveItem } = this.props;
    const profileToDelete = list[active];

    if (profileToDelete._id && confirm('Are you sure you want to delete this profile?')) {
      onRemoveItem(active, profileToDelete);
    } else {
      onRemoveItem(active, profileToDelete);
    }
  },

  saveItem() {
    const { onUpdateItem, active, list } = this.props;
    onUpdateItem(active, list[active], true);
  },

  formAction(action) {
    this[action]();
  },

  render() {
    const { active, list, error, buttonsDisabled } = this.props;
    const activeData = active < list.length ? list[active] : null;

    return (
      <div className={ style.rootContainer }>
        <Toolbar
          breadcrumb={ awsBreadCrumb }
          title="AWS EC2"
          actions={[{ name: 'add', icon: style.addIcon }]}
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
            <AWSForm
              data={activeData}
              onChange={ this.changeItem }
            />
            <ButtonBar
              visible={!!activeData}
              onAction={ this.formAction }
              error={ error }
              actions={getActions(buttonsDisabled)}
            />
          </div>
        </div>
      </div>);
  },
});


// Binding --------------------------------------------------------------------
/* eslint-disable arrow-body-style */

export default connect(
  state => {
    const localState = state.preferences.aws;
    return {
      active: localState.active,
      list: localState.list,
      buttonsDisabled: localState.pending,
      error: get(state, 'network.error.save_aws_profile.resp.data.message'),
    };
  },
  dispatch => {
    return {
      onUpdateItem: (index, profile, server) => dispatch(Actions.updateAWSProfile(index, profile, server)(dispatch)),
      onActiveChange: (index) => dispatch(Actions.updateActiveProfile(index)),
      onAddItem: () => dispatch(Actions.addAWSProfile()),
      onRemoveItem: (index, profile) => dispatch(Actions.removeAWSProfile(index, profile)(dispatch)),
    };
  }
)(AWSPrefs);
