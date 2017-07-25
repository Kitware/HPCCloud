// webpack for redux tests
var webpack = require('webpack'),
  path = require('path'),
  loaders = require('paraviewweb/config/webpack.loaders.js');

function nodeEnv() {
  if (process.env.NODE_ENV) {
    return '\'' + process.env.NODE_ENV + '\'';
  }
  return '\'development\'';
}

const definePlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': nodeEnv(),
});

module.exports = {
  plugins: [
    definePlugin,
  ],
  module: {
    loaders: loaders.concat([
      { test: /\.js$/, include: /node_modules\/pvw-visualizer\//, loader: 'babel?presets[]=es2015,presets[]=react' },
    ]),
    postLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|test/,
        loader: 'istanbul-instrumenter',
      },
    ],
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
