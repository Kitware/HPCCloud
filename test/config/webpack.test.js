// webpack for redux tests
const path = require('path');
const webpack = require('webpack');

const appRules = require('../../config/rules-hpccloud.js');
const pvwRules = require('../../config/rules-pvw.js');
const visualizerRules = require('../../config/rules-visualizer.js');
const vtkjsRules = require('../../config/rules-vtkjs.js');
const wslinkRules = require('../../config/rules-wslink.js');
const simputRules = require('../../config/rules-simput.js');

const eslintrcPath = path.join(__dirname, '../../.eslintrc.js');
const plugins = [];

plugins.push(
  new webpack.DefinePlugin({
    KARMA_TEST_RUNNER: JSON.stringify(true),
  })
);

module.exports = {
  plugins,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|test/,
        loader: 'istanbul-instrumenter-loader',
        enforce: 'post',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        enforce: 'pre',
        options: { configFile: eslintrcPath },
      },
    ].concat(
      appRules,
      pvwRules,
      visualizerRules,
      vtkjsRules,
      wslinkRules,
      simputRules
    ),
  },
  resolve: {
    alias: {
      'PVWStyle/ReactProperties/PropertyPanel.mcss': path.join(
        __dirname,
        '../../node_modules/simput/style/PropertyPanel.mcss'
      ),
      PVWStyle: path.join(__dirname, '../../node_modules/paraviewweb/style'),
      // see that file for why we do this.
      workflows: path.join(__dirname, '../../test/helpers/workflowNames'),
      // Constants.js uses Theme.mcss
      HPCCloudStyle: path.join(__dirname, '../../style'),
      SimputStyle: path.join(__dirname, '../../node_modules/simput/style'),
    },
  },
  externals: {
    Simput: 'Simput',
  },
};
