import expect from 'expect';
import React from 'react';
import TestUtils from 'react-dom/test-utils';

import style from 'HPCCloudStyle/JobMonitor.mcss';

import ExecutionUnit from '../../src/panels/JobMonitor/ExecutionUnit';
import LogFold from '../../src/panels/JobMonitor/LogFold';

/* global describe it */

describe('ExecutionUnit', () => {
  const baseUnit = { name: 'my.super.log', status: 'created', log: [] };
  it('only render a title and subtitle', () => {
    const el = TestUtils.renderIntoDocument(<ExecutionUnit unit={baseUnit} />);
    const titles = TestUtils.scryRenderedDOMComponentsWithClass(
      el,
      style.itemContent
    );
    expect(titles.length).toEqual(2);
    expect(titles[0].textContent).toEqual('log');
    expect(titles[1].textContent).toEqual('created');
  });

  it('render an empty log', () => {
    const el = TestUtils.renderIntoDocument(
      <ExecutionUnit unit={baseUnit} open alwaysShowLogToggle />
    );
    const log = TestUtils.findRenderedDOMComponentWithTag(el, 'pre');
    expect(log.textContent).toEqual('');
  });

  it('render a log with several plain entries', () => {
    const myUnit = Object.assign({}, baseUnit);
    myUnit.log = [
      {
        msg: 'some message',
        status: 'test',
        levelname: 'INFO',
        created: Date.now(),
      },
      { msg: 'some warning', levelname: 'WARN', created: Date.now() + 20 },
      {
        msg: { info: 'here is info' },
        levelname: 'INFO',
        created: Date.now() + 50,
      },
    ];
    const el = TestUtils.renderIntoDocument(
      <ExecutionUnit unit={myUnit} open />
    );
    const logEntries = TestUtils.scryRenderedDOMComponentsWithTag(el, 'p');
    expect(logEntries.length).toEqual(3);
    expect(logEntries[0].textContent).toMatch(
      /\[\d{2}:\d{2}:\d{2}\.\d{3}\] INFO: some message \[test\]/
    );
    expect(logEntries[1].textContent).toMatch(
      /\[\d{2}:\d{2}:\d{2}\.\d{3}\] WARN: some warning/
    );
    expect(logEntries[2].textContent).toMatch(
      new RegExp(JSON.stringify(myUnit.log[2].msg, null, 2))
    );
  });

  it('render a log with a complex entry (LogFold)', () => {
    const myUnit = Object.assign({}, baseUnit);
    myUnit.log = [
      {
        msg: 'some message',
        levelname: 'INFO',
        created: Date.now(),
        data: { cmd: 'ls -la', failed: false },
      },
    ];
    const el = TestUtils.renderIntoDocument(
      <ExecutionUnit unit={myUnit} open />
    );
    const log = TestUtils.findRenderedComponentWithType(el, LogFold);
    expect(log).toExist();
    expect(log.props.header).toMatch(
      /\[\d{2}:\d{2}:\d{2}\.\d{3}\] INFO: some message/
    );
    expect(log.props.content).toEqual(
      JSON.stringify(myUnit.log[0].data, null, 2)
    );
  });

  describe('updates', () => {
    const myUnit = Object.assign({}, baseUnit);
    myUnit.log = [
      {
        msg: 'some message',
        status: 'test',
        levelname: 'INFO',
        created: Date.now(),
      },
    ];
    const el = TestUtils.renderIntoDocument(
      <ExecutionUnit unit={myUnit} open />
    );

    it('has a log', () => {
      const logEntries = TestUtils.scryRenderedDOMComponentsWithTag(el, 'p');
      expect(logEntries.length).toBeGreaterThanOrEqualTo(1);
    });

    it("updates when there's a new log", () => {
      myUnit.log.push({
        msg: 'some warning',
        levelname: 'WARN',
        created: Date.now() + 20,
      });
      expect(el.props.unit.log.length).toEqual(2);
      el.forceUpdate();
      const logEntries = TestUtils.scryRenderedDOMComponentsWithTag(el, 'p');
      expect(logEntries.length).toEqual(2);
    });
  });
});
