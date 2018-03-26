import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router';

import theme from 'HPCCloudStyle/Theme.mcss';
import style from 'HPCCloudStyle/ItemEditor.mcss';

import client from '../../network';
// import { volumeTypes }    from '../../utils/Constants';

// render mappers
const optionMapper = (el, index) => (
  <option key={`${el.name}_${index}`} value={index}>
    {el.name}
  </option>
);
const machineFamilyMapper = (family, index) => (
  <option key={family} value={family}>
    {family}
  </option>
);
const machineMapper = (machine, index) => (
  <option key={machine.id} value={index}>
    {`${machine.id} - ${machine.cpu} core${machine.cpu > 1 ? 's' : ''} - ` +
      `${machine.memory} ${machine.gpu ? ' + GPU' : ''} - ${machine.storage}` +
      ` - $${Number(machine.price).toPrecision(3)} est. per hour per node`}
  </option>
);

/* eslint-disable react/no-unused-state */
export default class RunEC2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      busy: false,

      clusters: [],
      selectedCluster: '',

      profiles: [],
      profile: {},

      machines: {},
      machineFamilies: [],
      machinesInFamily: [],

      volumes: [],
    };
    this.updateState = this.updateState.bind(this);
    this.dataChange = this.dataChange.bind(this);
  }

  componentDidMount() {
    this.updateState();
  }

  componentWillUnmount() {
    this.dataChange({
      currentTarget: { dataset: { key: 'name' } },
      target: { value: '' },
    });
  }

  updateState() {
    this.setState({ busy: true });
    let newState;
    client
      .listAWSProfiles()
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
        newState.machineFamilies = Object.keys(
          newState.machines[newState.profile.regionName]
        );
        newState.machinesInFamily =
          newState.machines[newState.profile.regionName]['General purpose'];
        if (this.props.onChange) {
          this.props.onChange('machine', newState.machinesInFamily[0], 'EC2');
        }
        return client.listClusters('ec2');
      })
      .then((resp) => {
        newState.clusters = resp.data;
        if (this.props.onChange) {
          this.props.onChange('cluster', null, 'EC2');
        }
        return client.listVolumes();
      })
      .then((resp) => {
        newState.volumes = resp.data;
        if (this.props.onChange) {
          this.props.onChange('volume', null, 'EC2');
        }
        this.setState(newState);
      })
      .catch((err) => {
        console.log('Error: Sim/RunEC2', err);
        this.setState({ busy: false });
      });
  }

  dataChange(event) {
    const key = event.currentTarget.dataset.key;
    let value = event.target.value;
    switch (key) {
      case 'profile':
        value = this.state.profiles[value];
        this.setState({
          machineFamilies: Object.keys(this.state.machines[value.regionName]),
          profile: value,
        });
        // Only want to propagate the id
        value = value._id;
        break;
      case 'machineFamily':
        this.setState({
          machinesInFamily: this.state.machines[this.state.profile.regionName][
            value
          ],
        });

        if (this.props.onChange) {
          this.props.onChange(
            'machine',
            this.state.machines[this.state.profile.regionName][value][0],
            'EC2'
          );
        }
        break;
      case 'machine':
        // Convert from index into machine object
        value = this.state.machinesInFamily[value];
        break;
      default:
        break;
    }

    if (this.props.onChange) {
      this.props.onChange(key, value, 'EC2');
    }
  }

  render() {
    if (this.state.profiles.length === 0) {
      return this.state.busy ? null : (
        <div
          className={[style.container, theme.warningBox].join(' ')}
          style={{ margin: '15px' }}
        >
          <span>
            There are no EC2 AWS profiles defined. Add some on&nbsp;
            <Link to="/Preferences/AWS">the AWS preference page</Link>.
          </span>
        </div>
      );
    }

    const runningClusters = this.state.clusters.filter(
      (el) => el.status === 'running'
    );
    return (
      <div className={style.container}>
        {runningClusters.length ? (
          <section className={style.group}>
            <label className={style.label}>Existing Instances</label>
            <select
              className={style.input}
              onChange={this.dataChange}
              data-key="cluster"
            >
              <option value={null} />
              {runningClusters.map((el, index) => (
                <option key={el._id} value={el._id}>
                  {el.name}
                </option>
              ))}
            </select>
          </section>
        ) : null}
        <section className={style.group}>
          <label className={style.label}>Name:</label>
          <input
            className={style.input}
            data-key="name"
            value={this.props.contents.name}
            onChange={this.dataChange}
            required
            disabled={this.props.contents.cluster}
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Profile:</label>
          <select
            className={style.input}
            onChange={this.dataChange}
            data-key="profile"
            value={this.props.contents.profle}
            disabled={this.props.contents.cluster}
          >
            {this.state.profiles.map(optionMapper)}
          </select>
        </section>
        <section className={style.group}>
          <label className={style.label}>Machine family:</label>
          <select
            onChange={this.dataChange}
            className={style.input}
            data-key="machineFamily"
            defaultValue="General purpose"
            disabled={this.props.contents.cluster}
          >
            {this.state.machineFamilies.map(machineFamilyMapper)}
          </select>
        </section>
        <section className={style.group}>
          <label className={style.label}>Machine type:</label>
          <select
            onChange={this.dataChange}
            className={style.input}
            data-key="machine"
            disabled={this.props.contents.cluster}
          >
            {this.state.machinesInFamily.map(machineMapper)}
          </select>
        </section>
        <section className={style.group}>
          <label className={style.label}>Cluster size:</label>
          <input
            type="number"
            min="1"
            max="100"
            className={style.input}
            data-key="clusterSize"
            value={this.props.contents.clusterSize}
            onChange={this.dataChange}
            required
            disabled={this.props.contents.cluster}
          />
        </section>
        {/* EBS Volume */}
        <section className={style.group}>
          <label className={style.label}>Existing Volume:</label>
          <select
            className={style.input}
            onChange={this.dataChange}
            data-key="volume"
            disabled={this.props.contents.cluster}
          >
            <option value={null} />
            {this.state.volumes
              .filter(
                (el) => el.status === 'created' || el.status === 'available'
              )
              .map((el, index) => (
                <option key={el._id} value={el._id}>
                  {el.name}
                </option>
              ))}
          </select>
        </section>
        <section className={style.group}>
          <label className={style.label}>Volume Name:</label>
          <input
            type="text"
            className={style.input}
            data-key="volumeName"
            value={this.props.contents.volumeName}
            onChange={this.dataChange}
            required
            disabled={this.props.contents.volume}
            placeholder="New Volume Name"
          />
        </section>
        <section className={style.group}>
          <label className={style.label}>Size:</label>
          <input
            type="number"
            min="1"
            max="16384"
            className={style.input}
            data-key="volumeSize"
            value={this.props.contents.volumeSize}
            onChange={this.dataChange}
            required
            disabled={this.props.contents.volume}
            placeholder="New Volume Size"
          />
        </section>
        {/* only valid type on the endpoint is ebs?
          <section className={style.group}>
              <label className={style.label}>Type</label>
              <select
                className={style.input}
                data-key="type"
                onChange={this.formChange}
                disabled={this.props.data._id}
                required
              >
                { Object.keys(types).map((key, index) =>
                  <option key={`${key}_${index}`} value={types[key]}>{key} ({types[key]})</option>)
                }
              </select>
          </section>
          */}
      </div>
    );
  }
}

RunEC2.propTypes = {
  contents: PropTypes.object,
  onChange: PropTypes.func,
};

RunEC2.defaultProps = {
  contents: undefined,
  onChange: undefined,
};
