import React            from 'react';
import Toolbar          from '../../panels/Toolbar';
import merge            from 'mout/src/object/merge';

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
    title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    placeholder: React.PropTypes.object,
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
      sortKey: '',
      sortReverse: false,
    };
  },

  toolbarAction(action) {
    if (this.props.onAction) {
      this.props.onAction(action, this.state.selected.map((index) => this.props.items[index]));
      // reset selection after action is performed on them.
      this.setState({ selected: [], actions: [TOOLBAR_ACTIONS.add] });
    }
  },

  lineAction(action) {
    const [name, id] = action.split(':');
    this.props.onAction(name, id);
  },

  itemClicked(e) {
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
      const linkToGo = trEl.dataset.link;
      const id = this.props.items[parseInt(trEl.dataset.index, 10)]._id;

      const location = {
        pathname: linkToGo,
        query: merge(this.props.location.query, { filter }),
        state: this.props.location.state,
      };
      this.props.onAction('click', { location, id });
    }
  },

  sortBy(e) {
    const sortKey = e.currentTarget.dataset.title;
    let sortReverse;
    if (this.state.sortKey !== sortKey && this.state.sortKey !== '') {
      sortReverse = false;
    } else {
      sortReverse = !this.state.sortReverse;
    }
    this.setState({ sortKey, sortReverse });
  },

  render() {
    const helper = this.props.accessHelper;
    let comparisonFn = helper.cellContentFunctions[1];
    let content = null;
    let fnIndex = 1; // default sortBy index, the second column which for us is the name
    if (!this.state.sortKey.length) {
      comparisonFn = helper.cellContentFunctions[fnIndex];
    } else {
      fnIndex = helper.columns.indexOf(this.state.sortKey);
      comparisonFn = helper.cellContentFunctions[fnIndex];
    }

    let sorter;
    if (this.props.items.length && typeof comparisonFn(this.props.items[0]) === 'number') {
      sorter = (a, b) => a - b;
    } else {
      sorter = (a, b) => comparisonFn(a).localeCompare(comparisonFn(b));
    }

    updateQuery(this.props.location.query.filter);
    const filteredList = this.props.items.filter(itemFilter).sort(sorter);
    if (this.state.sortReverse) {
      filteredList.reverse(); // modifies filteredList in place, odd that const doesn't guard that
    }

    const columnMapper = (title, index) => {
      // if there is no title then you cannot sort by that item, nothing to click on
      if (!title) {
        return null;
      }
      // return the title with a sorted icon, if the column is not being sorted the icon is hidden
      return (
        <span onClick={this.sortBy} data-title={title}>
          { title }
          { index === fnIndex ?
            this.state.sortReverse ? <i className={style.sortedAsc}></i> : <i className={style.sortedDesc}></i>
            : <i className={[style.sortedAsc, style.visHidden].join(' ')}></i>
          }
        </span>);
    };

    if (this.props.items.length) {
      content = (
        <table className={ style.table }>
          <thead>
              <tr>
                  {helper.columns.map((title, index) => (
                    <th key={`${title}_${index}`}>
                      { columnMapper(title, index) }
                    </th>
                    ))}
              </tr>
          </thead>
          <tbody>
            { filteredList.map((item, index) =>
              <tr key={ `${item._id}_${index}` } data-link={ helper.viewLink(item) } data-index={ index }
                className={this.state.selected.indexOf(index) !== -1 ? style.selected : ''}
              >
                { helper.cellContentFunctions.map((func, idx) => (
                  <td key={ `${item._id}_${idx}` } onClick={ this.itemClicked }>
                    {func(item)}
                  </td>
                )) }
                <td>{ helper.actionItem ? helper.actionItem(item, this.lineAction) : null }</td>
              </tr>
            )}
          </tbody>
        </table>);
    } else if (this.props.placeholder) {
      content = this.props.placeholder;
    }

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
          { content }
      </div>);
  },
});
