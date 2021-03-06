/* eslint-disable */
var wpConfig = require('./config/webpack.test.js');
var karmaConfig = require('./config/karma.base.js');

wpConfig.entry = {
  'tests.redux.js': './test/contexts/tests.redux.js',
};

karmaConfig.webpack = wpConfig;

karmaConfig.files = [
  'node_modules/babel-polyfill/dist/polyfill.js',
  'dist/simput-pyfr.js',
  'dist/simput-nwchem.js',
  'dist/simput-nwchem-neb.js',
  'dist/simput-openfoam-tutorials.js',
  'dist/simput-openfoam-windtunnel.js',
  'test/contexts/tests.redux.js'
];

karmaConfig.preprocessors = {
  'test/contexts/tests.redux.js': ['webpack', 'sourcemap'],
};

karmaConfig.coverageReporters = {
  dir: 'coverage/redux',
  reporters: [
    {
      type: 'html',
      subdir: 'html'
    }, {
      type: 'lcovonly',
      subdir: 'lcov'
    },
  ]
};

module.exports = function(config) {
  config.set(karmaConfig);
};
