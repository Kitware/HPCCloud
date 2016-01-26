var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
  __BROWSER_BUILD__: true,
});

module.exports = {
    plugins: [
        definePlugin,
    ],
    entry: './lib/app.js',
    output: {
        path: './dist',
        filename: 'HPCCloud.js',
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            loader: "eslint-loader",
            exclude: /node_modules/,
        }],
        loaders: [
            { test: require.resolve("./lib/app.js"), loader: "expose?HPCCloud" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=60000&mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=60000" },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.css$/, loader: "style!css!postcss" },
            { test: /\.mcss$/,loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss' },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.html$/, loader: 'html-loader' },
            { test: /\.js$/, include: /node_modules\/tonic-/, loader: "babel?presets[]=react,presets[]=es2015" },
            { test: /\.js$/, include: /node_modules\/simput/, loader: "babel?presets[]=react,presets[]=es2015" },
            { test: /\.js$/, exclude: /node_modules/, loader: "babel?presets[]=react,presets[]=es2015" },
        ],
    },
    postcss: [
        require('autoprefixer')({ browsers: ['last 2 versions'] }),
    ],
    eslint: {
        configFile: '.eslintrc',
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
