// webpack for redux tests
var webpack = require('webpack'),
  path = require('path');

function nodeEnv() {
  if (process.env.NODE_ENV) {
    return '\'' + process.env.NODE_ENV + '\'';
  }
  return '\'development\'';
}

var definePlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': nodeEnv(),
});

module.exports = {
  entry: {
    'tests.webpack.js': './test/tests.webpack.js'
  },
  plugins: [
    definePlugin
  ],
  module: {
    loaders: [
      {
        test: /\.svg$/,
        loader: 'svg-sprite',
        exclude: /fonts/,
      }, {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=60000&mimetype=application/font-woff',
      }, {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=60000',
        include: /fonts/,
      }, {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192',
      }, {
        test: /\.css$/,
        loader: 'style!css!postcss',
      }, {
        test: /\.mcss$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]!postcss',
      }, {
        test: /\.c$/i,
        loader: 'shader',
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.html$/,
        loader: 'html-loader',
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel?presets[]=es2015,presets[]=react',
      }
    ]
  },
  resolve: {
    alias: {
      // see that file for why we do this.
      workflows: path.resolve('./test/helpers/workflowNames'),
      // Constants.js uses Theme.mcss
      HPCCloudStyle: path.resolve('./style'),
    },
  },
};
