import React        from 'react';

import RunCluster   from './RunCluster';
import RunEC2       from './RunEC2';
import RunOpenStack from './RunOpenStack';

import formStyle    from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
  displayName: 'RunClusterForm',

  propTypes: {
    serverType: React.PropTypes.string,
    serverTypeChange: React.PropTypes.func,
    profiles: React.PropTypes.object,
    dataChange: React.PropTypes.func,
    clusterFilter: React.PropTypes.func,
  },

  render() {
    var serverForm;
    switch (this.props.serverType) {
      case 'EC2':
        serverForm = (<RunEC2 contents={this.props.profiles.EC2} onChange={this.props.dataChange}
          clusterFilter={this.props.clusterFilter} />);
        break;
      case 'Traditional':
        serverForm = (<RunCluster contents={this.props.profiles.Traditional} onChange={this.props.dataChange}
          clusterFilter={this.props.clusterFilter} />);
        break;
      case 'OpenStack':
        serverForm = <RunOpenStack />;
        break;
      default:
        serverForm = <span>no valid serverType: {this.props.serverType}</span>;
    }

    const optionMapper = (el, index) => <option key={`${el}_${index}`} value={el}>{el}</option>;

    return (
      <div>
        <section className={formStyle.group}>
          <label className={formStyle.label}>Server Type</label>
          <select
            className={formStyle.input}
            value={this.props.serverType}
            onChange={ this.props.serverTypeChange }
          >
            { Object.keys(this.props.profiles).map(optionMapper) }
          </select>
        </section>
        <section>
          {serverForm}
        </section>
      </div>
    );
  },

});
