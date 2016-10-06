import React    from 'react';
import LinkIcon from '../LinkIcon';
import { Link } from 'react-router';
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
  displayName: 'BreadCrumb',

  propTypes: {
    active: React.PropTypes.number,
    className: React.PropTypes.string,
    icons: React.PropTypes.array,
    paths: React.PropTypes.array,
    titles: React.PropTypes.array,
    hasTabs: React.PropTypes.bool,
    labels: React.PropTypes.array,
  },

  getDefaultProps() {
    return {
      active: -1,
      icons: DEFAULT_BREADCRUMB_ICONS,
      hasTabs: false,
    };
  },

  render() {
    var mapper;
    if (!this.props.hasTabs) {
      mapper = (path, index) =>
        <LinkIcon key={`${path}_${index}`} to={path}
          icon={this.props.icons[index]}
          title={this.props.titles ? this.props.titles[index] : null}
          className={ index === this.props.active ? style.activeBreadCrumb : null}
        />;
    } else {
      const iconClasses = (index) => [
        this.props.icons[index],
        index === this.props.active ? style.activeBreadCrumb : null,
      ];
      mapper = (path, index) =>
        <span key={`${path}_${index}`} className={this.props.className}>
          <Link to={path} className={this.props.className}
            title={this.props.titles ? this.props.titles[index] : null}
          >
            <i className={ iconClasses(index).join(' ') } />
            <span className={index === this.props.active ? style.activeBreadCrumb : null}>
              &nbsp;{ this.props.labels[index] }
            </span>
          </Link>
        </span>;
    }


    return (
      <div className={ this.props.className }>
        { this.props.paths.map(mapper) }
      </div>);
  },
});
