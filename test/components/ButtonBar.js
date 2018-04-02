import expect from 'expect';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ShallowRenderer from 'react-test-renderer/shallow';
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
    const renderer = new ShallowRenderer();
    renderer.render(<ButtonBar visible={false} actions={actions} />);
    const result = renderer.getRenderOutput();
    expect(result).toEqual(null); // when not visible it renders null
  });
});
