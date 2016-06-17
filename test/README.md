# HPC-Cloud Tests

We test two things:

1. **Redux actions and reducers** - Redux maintains the data structure and data flow of HPC-Cloud. Many bugs have come from incorrect or inconsistent Redux actions and their corresponding reducers. For actions which call a backend resource we mock the `client` call with an [expect spy](https://github.com/mjackson/expect#spy-methods) which returns our expected data that we use in tests.
2. **React components**  - We reuse React components in `src/panels` in many places. At time of writing there aren't many tests for components, however the infrastructure is there and it's easy to write new tests component behavior. 

## Running

- Redux - `nam run test:redux`
- Components - `npm run test:components`
- Everything - `nam run test`

## Writing new tests

We're using: 

- [Karma](https://karma-runner.github.io/0.13/index.html): with [webpack](https://webpack.github.io/) and [istanbul-instrumenter](https://github.com/deepsweet/istanbul-instrumenter-loader)
- [Jasmine](http://jasmine.github.io/2.4/introduction.html)
- [PhantomJS](http://phantomjs.org/)
- [expect](https://github.com/mjackson/expect)
- [redux-actions-assertions](https://github.com/dmitry-zaets/redux-actions-assertions) (Redux tests only, but can be used for tests which have redux elements.)
- [React Test Utils](https://facebook.github.io/react/docs/test-utils.html) (For tests involving React components)

### Redux
Check if there is already a file for the actions or reducers you're testing in `/test/redux`, add a new file if there isn't one already. Action testing can be split up by "simple actions" and "async actions". Simple actions just return an object with `type` and optionally some data payload. Async actions call some backend component. 

### Components
Writing tests for React components can be a bit finicky. For components with some state or props reliance they may not fully render. Luckily you can manipulate the React components just like you would with plain javascript objects.