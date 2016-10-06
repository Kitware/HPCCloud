import React from 'react';
import style from 'HPCCloudStyle/Preferences.mcss';

export const breadcrumb = {
  paths: [
    '/Preferences/User',
    '/Preferences/Cluster',
    '/Preferences/AWS',
    '/Preferences/Volumes',
    '/Preferences/Status',
    //'/Preferences/Network',
  ],
  icons: [
    style.userIcon,
    style.clusterIcon,
    style.ec2Icon,
    style.volumesIcon,
    style.statusIcon,
    // style.networkIcon,
  ],
  titles: [
    'User preferences',
    'Cluster',
    'EC2',
    'Volumes',
    'Server status',
  ],
  labels: [
    'User',
    'Cluster',
    'EC2',
    'Volumes',
    'Status',
  ],
  active: -1,
};

export default React.createClass({

  displayName: 'Preferences',

  propTypes: {
    children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
  },

  render() {
    return <div>{ this.props.children }</div>;
  },
});
