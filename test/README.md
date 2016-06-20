# HPC-Cloud Tests

We test two things:

1. **Redux actions and reducers** - Redux maintains the data structure and data flow of HPC-Cloud. Many bugs have come from incorrect or inconsistent Redux actions and their corresponding reducers. For actions which call a backend resource we mock the `client` call with an [expect spy](https://github.com/mjackson/expect#spy-methods) which returns our expected data that we use in tests.
2. **React components**  - We reuse React components in `src/panels` in many places. At time of writing there aren't many tests for components, however the infrastructure is there and it's easy to write new tests component behavior. 

## Running

- Redux - `npm run test:redux`
- Components - `npm run test:components`
- Everything - `npm run test`

## Writing new tests

We're using: 

- [Karma](https://karma-runner.github.io/0.13/index.html): with [karma-webpack](https://github.com/webpack/karma-webpack) and [istanbul-instrumenter](https://github.com/deepsweet/istanbul-instrumenter-loader) - test runner, transpiles tests with a webpack extension.
- [Jasmine](http://jasmine.github.io/2.4/introduction.html) - test framework 
- [expect](https://github.com/mjackson/expect) - assertion library
- [PhantomJS](http://phantomjs.org/) - headless webkit environment for testing in
- [babel-polyfill](https://github.com/babel/babel/tree/master/packages/babel-polyfill) - PhantomJS has no Promise object, so we supplement it with this.
- [redux-actions-assertions](https://github.com/dmitry-zaets/redux-actions-assertions) - Redux tests only, but can be used for component tests which use redux.
- [React Test Utils](https://facebook.github.io/react/docs/test-utils.html) - For tests involving React components

### Redux
Check if there is already a file for the actions or reducers you're testing in `/test/redux`, add a new file if there isn't one already. Action testing can be split up by "simple actions" and "async actions". Simple actions just return an object with `type` and optionally some data payload. Async actions call some backend component. 

#### Template

```js
// import necessary libraries and tools.
import { registerMiddlewares } from 'redux-actions-assertions';
import { registerAssertions } from 'redux-actions-assertions/expect';
import thunk from 'redux-thunk'; // useful for testing async actions
import expect from 'expect';
import complete from '../helpers/complete'; // a done/fail helper for redux-action-assertions

// what we're testing
import myActions from '../../src/redux/actions/myActions';
import myReducer from '../../src/redux/reducers/myReducer';
import client from '../../src/network'; // for setting spies on

/* global describe it afterEach */

registerMiddlewares([thunk]);
registerAssertions();

function setSpy(target, method, data) {
  expect.spyOn(target, method)
    .andReturn(Promise.resolve({ data }));
}

describe('some action test', () => {
  describe('simple actions', () => {
    it('should increment a value', (done) => {
      const expectedAction = { type: myActions.INCREMENT };
      expect(myActions.increment)
        .toDispatchActions(expectedAction, complete(done));

      const initialState = { value: 0 }; // this can also be exported from the reducers, be sure to clone it if you use it.
      const expectedState = { value: 1 };
      expect(myReducer(initialState, expectedAction))
        .toEqual(expectedState); // does a deep equal, if you're dealing with big payloads it can be hard to read error output.
    });
  });

  describe('asyn actions', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should increment a value on the server', (done) => {
      const expectedAction = { type: myActions.UPDATE_VALUE, value: 2 };
      setSpy(client, 'serverIncrement', { value: 2 })
      expect(myActions.serverIncrement()) // this action would call `client.serverIncrement` which we're spying on
        .toDispatchActions(expectedAction, complete(done));
    });
  });
});
```

### Components
Writing tests for React components can be a bit finicky. For components with reliance on state or props they may not fully render. Luckily you can manipulate the React components just like you would with plain javascript objects.

#### Template

```js
// import necessary libraries and tools.
import expect from 'expect';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import MyComponent from '../../src/panels/sampleComponent';

/* global describe it afterEach */

describe('some component test', () => {
  it('should render increment buttons', (done) => {
    const el = TestUtils.renderIntoDocument(<MyComponent buttons={[{ action: 'increment', name: 'Increment Value' }]} />);
    const buttons = TestUtils.findAllInRenderedTree(el, (component) => component.tagName === 'BUTTON');
    expect(buttons.length).toEqual(1);
  });
});
```