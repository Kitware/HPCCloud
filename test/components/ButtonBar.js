import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ButtonBar from '../../src/panels/ButtonBar';

/* global describe it */

describe('ButtonBar', () => {
  it('should render an empty bar', () => {
    const el = TestUtils.renderIntoDocument(<ButtonBar actions={[]} />);
    const buttons = TestUtils.findAllInRenderedTree(
      el,
      (component) => component.tagName === 'BUTTON'
    );
    expect(buttons.length).toEqual(0);
  });

  it('should render a buttons', () => {
    const actions = [
      { name: 'Reset', disabled: false },
      { name: 'Submit', disabled: false },
    ];
    const el = TestUtils.renderIntoDocument(<ButtonBar actions={actions} />);
    const buttons = TestUtils.findAllInRenderedTree(
      el,
      (component) => component.tagName === 'BUTTON'
    );
    expect(buttons.length).toEqual(2);
  });

  it('should be hidden', () => {
    const actions = [
      { name: 'Reset', disabled: false },
      { name: 'Submit', disabled: false },
    ];
    var renderer = TestUtils.createRenderer(),
      result;
    renderer.render(<ButtonBar visible={false} actions={actions} />);
    result = renderer.getRenderOutput();
    expect(result).toEqual(null); // when not visible it renders null
  });
});
