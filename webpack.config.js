var webpack = require('webpack'),
    path = require('path'),
    loaders = require('./node_modules/paraviewweb/config/webpack.loaders.js');

var definePlugin = new webpack.DefinePlugin({
  __BROWSER_BUILD__: true,
});

module.exports = {
    plugins: [
        definePlugin,
    ],
    entry: './src/app.js',
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
            { test: require.resolve("./src/app.js"), loader: "expose?HPCCloud" },
            { test: /\.js$/, include: /node_modules\/simput\//, loader: 'babel?presets[]=es2015,presets[]=react' },
        ].concat(loaders),
    },
    resolve: {
        alias: {
            'PVWStyle/ReactProperties/PropertyPanel.mcss': path.resolve('./node_modules/simput/style/PropertyPanel.mcss'),
            PVWStyle: path.resolve('./node_modules/paraviewweb/style'),
            SimputStyle: path.resolve('./node_modules/simput/style'),
            HPCCloudStyle: path.resolve('./style'),
        },
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
