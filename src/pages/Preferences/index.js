import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/Preferences.mcss';

export const breadcrumb = (user, page) => {
  const paths = [
    '/Preferences/User',
    '/Preferences/Cluster',
    '/Preferences/AWS',
    '/Preferences/Status',
  ]; // '/Preferences/Network', ];
  const icons = [
    style.userIcon,
    style.clusterIcon,
    style.ec2Icon,
    style.statusIcon,
  ]; // style.networkIcon, ],;
  const titles = ['User preferences', 'Cluster', 'EC2', 'Server status'];
  const labels = ['User', 'Cluster', 'EC2', 'Status'];
  if (user && user.admin) {
    paths.splice(1, 0, '/Preferences/Groups');
    icons.splice(1, 0, style.groupIcon);
    titles.splice(1, 0, 'Groups');
    labels.splice(1, 0, 'Groups');
  }
  return {
    paths,
    icons,
    titles,
    labels,
    active: labels.indexOf(page),
  };
};

export default function Preferences(props) {
  return <div>{props.children}</div>;
}

Preferences.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Preferences.defaultProps = {
  children: null,
};
