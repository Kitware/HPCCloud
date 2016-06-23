/* eslint-disable */

module.exports = {
  basePath: '..',
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
  preprocessors: {
    'tests.webpack.js': ['webpack', 'sourcemap'],
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
