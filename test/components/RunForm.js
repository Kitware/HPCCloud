import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react/lib/ReactTestUtils';
import client from '../../src/network';
import RunForm    from '../../src/panels/run';
import RunEC2     from '../../src/panels/run/RunEC2';
import RunCluster from '../../src/panels/run/RunCluster';

import style    from 'HPCCloudStyle/ItemEditor.mcss';

import sampleData from '../sampleData/runFormState';
import machines from '../sampleData/machines';
import awsClusters from '../sampleData/awsClusters';
import awsState from '../sampleData/awsState';

import deepClone    from 'mout/src/lang/deepClone';
/* global describe it */

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(Promise.resolve({ data }));
}

const blankFunc = () => {};

describe('RunForm', () => {
  describe('EC2', () => {
    setSpy(client, 'listAWSProfiles', awsState.list);
    setSpy(client, 'getEC2InstanceTypes', machines);
    setSpy(client, 'listClusters', awsClusters);

    const formState = { profiles: awsState.list, profile: awsState.list[0],
      busy: false,
      machines,
      machineFamilies: Object.keys(machines[awsState.list[0].regionName]),
      machinesInFamily: machines[awsState.list[0].regionName]['General purpose'],
      clusters: awsClusters,
    };

    it('renders EC2 form', () => {
      const el = TestUtils.renderIntoDocument(<RunForm
        serverType="EC2" profiles={sampleData}
        onChange={blankFunc} serverTypeChange={blankFunc}
      />);
      expect(TestUtils.scryRenderedComponentsWithType(el, RunEC2).length).toEqual(1);
      expect(client.listAWSProfiles).toHaveBeenCalled();
    });

    it('should have a cluster list if there are clusters', () => {
      const el = TestUtils.renderIntoDocument(<RunEC2
        contents={sampleData.EC2} onChange={blankFunc} />);
      el.setState(formState);
      expect(TestUtils.scryRenderedDOMComponentsWithClass(el, style.group).length).toEqual(7);
    });

    it('should not have a cluster list when there are no clusters', () => {
      const el = TestUtils.renderIntoDocument(<RunEC2
        contents={sampleData.EC2} onChange={blankFunc} />);
      var noClusters = deepClone(formState);
      delete noClusters.clusters;
      el.setState(noClusters);
      expect(TestUtils.scryRenderedDOMComponentsWithClass(el, style.group).length).toEqual(6);
    });
  });

  describe('Trad Cluster', () => {
    it('renders Traditional Cluster form', () => {
      setSpy(client, 'listClusters', []);

      const el = TestUtils.renderIntoDocument(<RunForm
        serverType="Traditional" profiles={sampleData}
        onChange={blankFunc} serverTypeChange={blankFunc}
      />);
      expect(TestUtils.scryRenderedComponentsWithType(el, RunCluster).length).toEqual(1);
      expect(client.listClusters).toHaveBeenCalled();
    });
  });
});
