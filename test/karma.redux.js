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
    reporters: ['spec', 'coverage'],
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-webpack',
      'karma-coverage',
      'karma-sourcemap-loader',
    ],
    files: [
      '../node_modules/babel-polyfill/dist/polyfill.js',
      'tests.webpack.js'
    ],
    preprocessors: {
      'tests.webpack.js': ['webpack', 'sourcemap'],
    },
    webpack: wpConfig,
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
    }
  });
};
