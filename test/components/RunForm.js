import expect from 'expect';
import React from 'react';
import TestUtils from 'react-dom/test-utils';

import deepClone from 'mout/src/lang/deepClone';

import { HashRouter as Router, Route } from 'react-router-dom';

import style from 'HPCCloudStyle/ItemEditor.mcss';

import client from '../../src/network';
import RunForm from '../../src/panels/run';
import RunEC2 from '../../src/panels/run/RunEC2';
import RunCluster from '../../src/panels/run/RunCluster';

import sampleData from '../sampleData/runFormState';
import machines from '../sampleData/machines';
import awsClusters from '../sampleData/awsClusters';
import awsState from '../sampleData/awsState';

/* global describe it */

function setSpy(target, method, data) {
  expect.spyOn(target, method).andReturn(Promise.resolve({ data }));
}

const blankFunc = () => {};

describe('RunForm', () => {
  describe('EC2', () => {
    setSpy(client, 'listAWSProfiles', awsState.list);
    setSpy(client, 'getEC2InstanceTypes', machines);
    setSpy(client, 'listClusters', awsClusters);

    const formState = {
      profiles: awsState.list,
      profile: awsState.list[0],
      busy: false,
      machines,
      machineFamilies: Object.keys(machines[awsState.list[0].regionName]),
      machinesInFamily:
        machines[awsState.list[0].regionName]['General purpose'],
      clusters: awsClusters,
    };

    it('renders EC2 form', () => {
      const el = TestUtils.renderIntoDocument(
        <Router>
          <Route>
            <RunForm
              serverType="EC2"
              profiles={sampleData}
              onChange={blankFunc}
              serverTypeChange={blankFunc}
            />
          </Route>
        </Router>
      );
      expect(
        TestUtils.scryRenderedComponentsWithType(el, RunEC2).length
      ).toEqual(1);
    });

    it('should have a cluster list if there are clusters', () => {
      let ec2 = null;
      const el = TestUtils.renderIntoDocument(
        <Router>
          <Route>
            <RunEC2
              ref={(c) => {
                ec2 = c;
              }}
              contents={sampleData.EC2}
              onChange={blankFunc}
            />
          </Route>
        </Router>
      );
      ec2.setState(formState);

      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(el, style.group).length
      ).toEqual(9);
    });

    it('should not have a cluster list when there are no clusters', () => {
      let ec2 = null;
      const el = TestUtils.renderIntoDocument(
        <Router>
          <Route>
            <RunEC2
              ref={(c) => {
                ec2 = c;
              }}
              contents={sampleData.EC2}
              onChange={blankFunc}
            />
          </Route>
        </Router>
      );
      const noClusters = deepClone(formState);
      delete noClusters.clusters;
      ec2.setState(noClusters);
      expect(
        TestUtils.scryRenderedDOMComponentsWithClass(el, style.group).length
      ).toEqual(8);
    });
  });

  describe('Trad Cluster', () => {
    it('renders Traditional Cluster form', () => {
      setSpy(client, 'listClusters', []);

      const el = TestUtils.renderIntoDocument(
        <Router>
          <RunForm
            serverType="Traditional"
            profiles={sampleData}
            onChange={blankFunc}
            serverTypeChange={blankFunc}
          />
        </Router>
      );
      expect(
        TestUtils.scryRenderedComponentsWithType(el, RunCluster).length
      ).toEqual(1);
      expect(client.listClusters).toHaveBeenCalled();
    });
  });
});
