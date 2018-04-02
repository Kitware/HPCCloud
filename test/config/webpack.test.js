// webpack for redux tests
const webpack = require('webpack');
const path = require('path');

const appRules = require('../../config/rules-hpccloud.js');
const linterRules = require('../../config/rules-linter.js');
const pvwRules = require('../../config/rules-pvw.js');
const visualizerRules = require('../../config/rules-visualizer.js');
const vtkjsRules = require('../../config/rules-vtkjs.js');
const wslinkRules = require('../../config/rules-wslink.js');
const simputRules = require('../../config/rules-simput.js');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|test/,
        loader: 'istanbul-instrumenter-loader',
        enforce: 'post',
      },
    ].concat(
      linterRules,
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
      // see that file for why we do this.
      workflows: path.resolve('./test/helpers/workflowNames'),
      // Constants.js uses Theme.mcss
      HPCCloudStyle: path.resolve('./style'),
      PVWStyle: path.resolve('./node_modules/paraviewweb/style'),
    },
  },
};
