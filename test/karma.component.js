/* eslint-disable */
var wpConfig = require('./config/webpack.test.js');
var karmaConfig = require('./config/karma.base.js');

wpConfig.entry = {
  'tests.components.js': './test/contexts/tests.components.js',
};

karmaConfig.webpack = wpConfig;

karmaConfig.files = [
  'node_modules/babel-polyfill/dist/polyfill.js',
  'test/contexts/tests.components.js'
];

karmaConfig.preprocessors = {
  'test/contexts/tests.components.js': ['webpack', 'sourcemap'],
};

karmaConfig.coverageReporters = {
  dir: 'coverage/components',
  reporters: [
    {
      type: 'html',
      subdir: 'html'
    }, {
      type: 'lcovonly',
      subdir: 'lcov'
    },
  ],
};

module.exports = function(config) {
  config.set(karmaConfig);
};
