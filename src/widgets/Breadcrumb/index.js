import React    from 'react';
import LinkIcon from '../LinkIcon';
import style    from 'HPCCloudStyle/Theme.mcss';

const DEFAULT_BREADCRUMB_ICONS = [
  style.breadCrumbRootIcon,
  style.breadCrumbProjectIcon,
  style.breadCrumbSimulationIcon,
  style.breadCrumbUnknownIcon,
  style.breadCrumbUnknownIcon,
  style.breadCrumbUnknownIcon,
  style.breadCrumbUnknownIcon,
  style.breadCrumbUnknownIcon,
  style.breadCrumbUnknownIcon,
];

export default React.createClass({
  displayName: 'LinkIcon',

  propTypes: {
    className: React.PropTypes.string,
    icons: React.PropTypes.array,
    paths: React.PropTypes.array,
  },

  getDefaultProps() {
    return {
      icons: DEFAULT_BREADCRUMB_ICONS,
    };
  },

  render() {
    return (
      <div className={ this.props.className }>
        {this.props.paths.map((path, index) =>
          <LinkIcon key={index} to={path} icon={this.props.icons[index]} />
        )}
      </div>);
  },
});
