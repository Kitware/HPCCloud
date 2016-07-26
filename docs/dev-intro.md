# Development Introduction

HPC-Cloud relies heavily on these libaries:

## Front-End

- [React](https://facebook.github.io/react/): View library
- [Redux](http://redux.js.org/): Data store and flow
- [React-Router](https://github.com/reactjs/react-router): Page routing
- [PostCSS](http://postcss.org/): Isolates and autoprefixes css classes and properties
- [Axios](https://github.com/mzabriskie/axios): Network call library
- [FontAwesome](http://fontawesome.io/): Icons

In the `/src` folder there are several folders: 
- `config`: react-router routes config
- `network`: network stack
- `pages`: app pages for react-router, each folder is a mapped to a route in [`config/routes.js`](../src/config/routes.js). e.g. `/pages/Simulation/View` maps to `[hostname]/view/simulation/[some simulation id]`
- `panels`: comming, reusable panels for use throughout the application
- `redux`: redux data flow and store
- `tools`: react wrappers for external tools
- `utils`: various helpers
- `widgets`: similar to panels but more simple
- `workflows`: simultion workflows

To get started with development on the front end, in your HPC-Cloud directory run: 

```
# installs dependancies
npm install

# runs a webpack-dev server on localhost:9999.
npm start
```

## Dev tools

HPC-Cloud is written in ES6 it's transpiled into ES5 with Babel. 

- [Webpack](https://webpack.github.io/) and several loaders for building.
- [Babel](https://babeljs.io/): ES6 Transpiler
- [ESLint](http://eslint.org/): Syntax checker

### Style

ESLint ensures that code style is followed and adhered to, we're extending [Airbnb's rules](https://github.com/airbnb/javascript). Webpack will throw errors if something is wrong. The basics are:

- Tab width is two spaces.
- No line padding at the beginning or end of a function.
- `var` must be declared at the top of the scope, use `const` or `let` otherwise.
- Spaces surround properties in objects, also one space before the value e.g. `{ foo: bar }`;
- Comma after the final property in objects which are declared over multiple lines.
- Open brackets are on the same line as the declaration. e.g. `function qux() { \n`
- Anonymous functions must be [ES6 arrow function](https://babeljs.io/docs/learn-es2015/#arrows-and-lexical-this).
- String concatenation must be [ES6 string templates](https://babeljs.io/docs/learn-es2015/#template-strings).

## Test tools

For a full overview of testing consult [/test/README.md](../test/README.md).

- [Karma](https://karma-runner.github.io/0.13/index.html): with [karma-webpack](https://github.com/webpack/karma-webpack) and [istanbul-instrumenter](https://github.com/deepsweet/istanbul-instrumenter-loader) - test runner, transpiles tests with a webpack extension.
- [Jasmine](http://jasmine.github.io/2.4/introduction.html) - test framework 
- [expect](https://github.com/mjackson/expect) - assertion library
- [PhantomJS](http://phantomjs.org/) - headless webkit environment for testing in
- [babel-polyfill](https://github.com/babel/babel/tree/master/packages/babel-polyfill) - PhantomJS has no Promise object, so we supplement it with this.
- [redux-actions-assertions](https://github.com/dmitry-zaets/redux-actions-assertions) - Redux tests only, but can be used for component tests which use redux.
- [React Test Utils](https://facebook.github.io/react/docs/test-utils.html) - For tests involving React components
