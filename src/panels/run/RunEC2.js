import client   from '../../network';
import React    from 'react';
import { Link } from 'react-router';

import theme    from 'HPCCloudStyle/Theme.mcss';
import style    from 'HPCCloudStyle/ItemEditor.mcss';

export default React.createClass({
  displayName: 'run/cluster',

  propTypes: {
    contents: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },

  getInitialState() {
    return {
      busy: false,
      profiles: [],
      profile: {},
      machines: {},
      machineFamilies: [],
      machinesInFamily: [],
    };
  },

  componentDidMount() {
    this.updateState();
  },

  updateState() {
    this.setState({ busy: true });
    let newState;
    client.listAWSProfiles()
      .then((resp) => {
        newState = {
          profiles: resp.data,
          profile: resp.data[0],
          busy: false,
        };

        if (this.props.onChange) {
          this.props.onChange('profile', resp.data[0]._id, 'EC2');
        }

        return client.getEC2InstanceTypes();
      })
      .then((resp) => {
        newState.machines = resp.data;
        newState.machineFamilies = Object.keys(newState.machines[newState.profile.regionName]);
        newState.machinesInFamily = newState.machines[newState.profile.regionName]['General purpose'];
        this.setState(newState);
      })
      .catch((err) => {
        console.log('Error: Sim/RunEC2', err);
        this.setState({ busy: false });
      });
  },

  dataChange(event) {
    var key = event.currentTarget.dataset.key,
      value = event.target.value;

    if (key === 'profile') {
      value = this.state.profiles[value];
      this.setState({
        machineFamilies: Object.keys(this.state.machines[value.regionName]),
      });
    } else if (key === 'machineFamily') {
      this.setState({
        machinesInFamily: this.state.machines[this.state.profile.regionName][value],
      });
    }

    if (this.props.onChange) {
      this.props.onChange(key, value, 'EC2');
    }
  },

  render() {
    var optionMapper = (el, index) =>
      <option
        key={ `${el.name}_${index}` }
        value={index}
      >{el.name}</option>;
    var machineFamilyMapper = (family, index) =>
      <option
        key={family}
        value={family}
      >
        { family }
      </option>;
    var machineMapper = (machine, index) =>
      <option
        key={machine.id}
        value={index}
      >
        { `${machine.id} - ${machine.cpu} core${machine.cpu > 1 ? 's' : ''} - ` +
          `${machine.memory}GB ${machine.gpu ? ' + GPU' : ''} - ${machine.storage}` +
          ` - $${Number(machine.price).toPrecision(3)} est. per hour per node` }
      </option>;

    if (this.state.profiles.length === 0) {
      return this.state.busy ? null :
        <div className={ [style.container, theme.warningBox].join(' ') } style={{ margin: '15px' }}>
            <span>
                There are no EC2 AWS profiles defined. Add some on&nbsp;
                <Link to="/Preferences/AWS">the AWS preference page</Link>.
            </span>
        </div>;
    }
    return (
      <div className={style.container}>
          <section className={style.group}>
              <label className={style.label}>Name:</label>
              <input
                className={style.input}
                data-key="name"
                value={this.props.contents.name}
                onChange={this.dataChange} required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Profile:</label>
              <select
                className={style.input}
                onChange={this.dataChange}
                data-key="profile"
                value={this.props.contents.profle}
              >
                {this.state.profiles.map(optionMapper)}
              </select>
          </section>
          <section className={style.group}>
              <label className={style.label}>Machine family:</label>
              <select
                onChange={this.dataChange} className={style.input}
                data-key="machineFamily"
                defaultValue="General purpose"
              >
                {this.state.machineFamilies.map(machineFamilyMapper)}
              </select>
          </section>
          <section className={style.group}>
              <label className={style.label}>Machine type:</label>
              <select
                onChange={this.dataChange} className={style.input}
                data-key="machine"
              >
                {this.state.machinesInFamily.map(machineMapper)}
              </select>
          </section>
          <section className={style.group}>
              <label className={style.label}>Cluster size:</label>
              <input type="number" min="1" max="100" className={style.input}
                data-key="clusterSize"
                value={this.props.contents.clusterSize}
                onChange={this.dataChange} required
              />
          </section>
          <section className={style.group}>
              <label className={style.label}>Volumne size:</label>
              <input type="number" min="1" max="16384" className={style.input}
                data-key="volumneSize"
                value={this.props.contents.volumneSize}
                onChange={this.dataChange} required
              />
          </section>
      </div>);
  },
});
