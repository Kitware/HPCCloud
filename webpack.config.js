const path = require('path');

const appRules = require('./config/rules-hpccloud.js');
const linterRules = require('./config/rules-linter.js');
const pvwRules = require('./config/rules-pvw.js');
const visualizerRules = require('./config/rules-visualizer.js');
const vtkjsRules = require('./config/rules-vtkjs.js');
const wslinkRules = require('./config/rules-wslink.js');
const simputRules = require('./config/rules-simput.js');

module.exports = {
  plugins: [],
  entry: path.join(__dirname, './src/app.js'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'HPCCloud.js',
  },
  module: {
    rules: [
      {
        test: require.resolve('./src/app.js'),
        loader: 'expose-loader?HPCCloud',
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
      'PVWStyle/ReactProperties/PropertyPanel.mcss': path.resolve(
        './node_modules/simput/style/PropertyPanel.mcss'
      ),
      PVWStyle: path.join(__dirname, './node_modules/paraviewweb/style'),
      VisualizerStyle: path.join(__dirname, './node_modules/pvw-visualizer/style'),
      SimputStyle: path.resolve('./node_modules/simput/style'),
      HPCCloudStyle: path.resolve('./style'),
      workflows: path.resolve('./src/workflows'),
    },
  },
  externals: {
    Simput: 'Simput',
  },
  devServer: {
    contentBase: './dist/',
    port: 9999,
    hot: true,
    quiet: false,
    noInfo: false,
    stats: {
      colors: true,
    },
    proxy: {
      '/api*': 'http://localhost:8080',
      '/static/*': 'http://localhost:8080',
    },
  },
};
