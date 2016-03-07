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

  toolbarAction(e) {
    if (this.props.onAction) {
      this.props.onAction(e);
    }
  },

  goTo(e) {
    var linkToGo = e;
    const filter = '';

    if (e.target) {
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
            actions={[{ name: 'addItem', icon: style.addIcon }]}
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
                { filteredList.map(item =>
                  <tr key={ item._id } data-link={ helper.getViewLink(item) }>
                    <td onClick={ this.goTo } >
                      <ImageIcon data={ helper.getIcon(item) } />
                    </td>
                    <td onClick={ this.goTo } >{ helper.getName(item) }</td>
                    <td onClick={ this.goTo } >{ helper.getDescription(item) }</td>
                    <td onClick={ this.goTo } >{ helper.getCreationDate(item) }</td>
                    <td onClick={ this.goTo } >{ helper.getUpdateDate(item) }</td>
                    <td>
                      <IconActionList actions={ helper.getActions(item) } onAction={ this.goTo } />
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
      </div>);
  },
});
