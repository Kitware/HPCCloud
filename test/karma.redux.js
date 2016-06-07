/* eslint-disable */
// karma config file
var wpConfig = require('./webpack.redux.js');

module.exports = function(config) {
  config.set({
    basePath: '.',
    client: {
      captureConsole: true
    },
    singleRun: true,
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    reporters: ['spec'],
    plugins: [
      'karma-jasmine',
      'karma-spec-reporter',
      'karma-webpack',
      'karma-phantomjs-launcher'
    ],
    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },
    webpack: wpConfig,
    files: [
      '../node_modules/babel-polyfill/dist/polyfill.js',
      'tests.webpack.js',
    ],
  });
};
