import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import style from 'HPCCloudStyle/Theme.mcss';

import LinkIcon from '../LinkIcon';

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

export default class BreadCrumb extends React.Component {
  constructor(props) {
    super(props);
    this.iconClasses = this.iconClasses.bind(this);
    this.tabMapper = this.tabMapper.bind(this);
    this.otherMapper = this.otherMapper.bind(this);
  }

  iconClasses(index) {
    return [
      this.props.icons[index],
      index === this.props.active ? style.activeBreadCrumb : null,
    ];
  }

  tabMapper(path, index) {
    return (
      <span key={`${path}_${index}`} className={this.props.className}>
        <Link
          to={path}
          className={this.props.className}
          title={this.props.titles ? this.props.titles[index] : null}
        >
          <i className={this.iconClasses(index).join(' ')} />
          <span
            className={
              index === this.props.active ? style.activeBreadCrumb : null
            }
          >
            &nbsp;{this.props.labels[index]}
          </span>
        </Link>
      </span>
    );
  }

  otherMapper(path, index) {
    return (
      <LinkIcon
        key={`${path}_${index}`}
        to={path}
        icon={this.props.icons[index]}
        title={this.props.titles ? this.props.titles[index] : null}
        className={index === this.props.active ? style.activeBreadCrumb : null}
      />
    );
  }

  render() {
    const mapper = this.props.hasTabs ? this.tabMapper : this.otherMapper;
    return (
      <div className={this.props.className}>{this.props.paths.map(mapper)}</div>
    );
  }
}

BreadCrumb.propTypes = {
  active: PropTypes.number,
  className: PropTypes.string,
  icons: PropTypes.array,
  paths: PropTypes.array,
  titles: PropTypes.array,
  hasTabs: PropTypes.bool,
  labels: PropTypes.array,
};

BreadCrumb.defaultProps = {
  active: -1,
  icons: DEFAULT_BREADCRUMB_ICONS,
  hasTabs: false,
  className: '',
  paths: [],
  titles: [],
  labels: [],
};
