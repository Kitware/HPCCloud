import React            from 'react';
import Toolbar          from '../../panels/Toolbar';
import ImageIcon        from '../../widgets/ImageIcon';
import merge            from 'mout/src/object/merge';
import IconActionList   from '../../panels/IconActionList';

// Styles
import style from 'HPCCloudStyle/TableListing.mcss';

// Filter helper
import {
    updateQuery,
    itemFilter,
} from '../../utils/Filters';

const TOOLBAR_ACTIONS = {
  add: { name: 'addItem', icon: style.addIcon },
  delete: { name: 'deleteItems', icon: style.deleteIcon },
};

export default React.createClass({

  displayName: 'TableListing',

  propTypes: {
    accessHelper: React.PropTypes.object,
    breadcrumb: React.PropTypes.object,
    items: React.PropTypes.array,
    location: React.PropTypes.object,
    onAction: React.PropTypes.func,
    title: React.PropTypes.string,
  },

  contextTypes: {
    router: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      title: 'Items',
    };
  },

  getInitialState() {
    return {
      selected: [],
      actions: [TOOLBAR_ACTIONS.add],
    };
  },

  toolbarAction(action) {
    if (this.props.onAction) {
      this.props.onAction(action, this.state.selected.map((index) => this.props.items[index]));
      // reset selection after action is performed on them.
      this.setState({ selected: [], actions: [TOOLBAR_ACTIONS.add] });
    }
  },

  itemClicked(e) {
    var linkToGo = e;
    var selectedIndex = -1;
    const filter = '';

    if ((e.metaKey || e.ctrlKey) && e.target) {
      let trEl = e.target;
      while (!trEl.dataset.index) {
        trEl = trEl.parentNode;
      }
      const selected = this.state.selected;
      const actions = this.state.actions;

      selectedIndex = parseInt(trEl.dataset.index, 10);
      if (selected.indexOf(selectedIndex) !== -1) {
        // remove already selected cell
        selected.splice(selected.indexOf(selectedIndex), 1);
        if (selected.length === 0) {
          actions.pop();
        }
      } else {
        // add new cell to selection
        if (selected.length === 0) {
          actions.push(TOOLBAR_ACTIONS.delete);
        }
        selected.push(selectedIndex);
      }

      this.setState({ selected, actions });
      return;
    } else if (e.target) {
      let trEl = e.target;
      while (!trEl.dataset.link) {
        trEl = trEl.parentNode;
      }
      linkToGo = trEl.dataset.link;

      this.context.router.push({
        pathname: linkToGo,
        query: merge(this.props.location.query, { filter }),
        state: this.props.location.state,
      });
    }

    this.context.router.push({
      pathname: linkToGo,
      query: merge(this.props.location.query, { filter }),
      state: this.props.location.state,
    });
  },

  render() {
    updateQuery(this.props.location.query.filter);
    const filteredList = this.props.items.filter(itemFilter);
    const helper = this.props.accessHelper;

    return (
      <div className={ style.container }>
          <Toolbar
            location={ this.props.location }
            title={this.props.title}
            breadcrumb={ this.props.breadcrumb }
            actions={ this.state.actions }
            onAction={ this.toolbarAction }
            filter
          />
          <table className={ style.table }>
              <thead>
                  <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Created</th>
                      <th>Updated</th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>
                { filteredList.map((item, index) =>
                  <tr key={ `${item._id}_${index}` } data-link={ helper.getViewLink(item) } data-index={ index }
                    className={this.state.selected.indexOf(index) !== -1 ? style.selected : ''}
                  >
                    <td onClick={ this.itemClicked } >
                      <ImageIcon data={ helper.getIcon(item) } />
                    </td>
                    <td onClick={ this.itemClicked } >{ helper.getName(item) }</td>
                    <td onClick={ this.itemClicked } >{ helper.getDescription(item) }</td>
                    <td onClick={ this.itemClicked } >{ helper.getCreationDate(item) }</td>
                    <td onClick={ this.itemClicked } >{ helper.getUpdateDate(item) }</td>
                    <td>
                      <IconActionList actions={ helper.getActions(item) } onAction={ this.itemClicked } />
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
      </div>);
  },
});
