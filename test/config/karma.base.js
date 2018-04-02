/* eslint-disable */

module.exports = {
  basePath: '..',
  client: {
    // set to true if you're trying to read some console.log statement
    captureConsole: false
  },
  singleRun: true,
  frameworks: ['jasmine'],
  browsers: ['ChromeHeadless'],
  reporters: ['spec', 'coverage'],
  plugins: [
    'karma-jasmine',
    'karma-chrome-launcher',
    'karma-spec-reporter',
    'karma-webpack',
    'karma-coverage',
    'karma-sourcemap-loader',
  ],
  preprocessors: {
    'tests.webpack.js': ['webpack', 'sourcemap'],
  },
  webpackMiddleware: {
      noInfo: true,
      stats: {
          chunks: false
      }
  },
  coverageReporter: {
    reporters: [
      {
        type: 'html',
        dir: 'coverage/',
        subdir: 'html'
      }, {
        type: 'lcovonly',
        dir: 'coverage',
        subdir: 'lcov'
      },
    ]
  }
};
