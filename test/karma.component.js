/* eslint-disable */
var wpConfig = require('./webpack.test.js');
var karmaConfig = require('./karma.base.js');

wpConfig.entry = {
  'tests.components.js': './test/tests.components.js',
};

karmaConfig.webpack = wpConfig;

karmaConfig.files = [
  '../node_modules/babel-polyfill/dist/polyfill.js',
  'tests.components.js'
];

karmaConfig.preprocessors = {
  'tests.components.js': ['webpack', 'sourcemap'],
};

karmaConfig.coverageReporters = {
  reporters: [
    {
      type: 'html',
      dir: 'coverage/components',
      subdir: 'html'
    }, {
      type: 'lcovonly',
      dir: 'coverage/components',
      subdir: 'lcov'
    },
  ],
};

module.exports = function(config) {
  config.set(karmaConfig);
};
