var path = require('path');
var webpack = require('webpack');

var minimize = process.argv.indexOf('--minimize') != -1;

var config = {
    debug: !minimize,
    entry: { kartograph: './src/index.coffee' },
    output: {
        path: './dist',
        pathinfo: !minimize,
        library: 'kartograph',
        libraryTarget: 'var',
        filename: minimize ? '[name].min.js' : '[name].js',
        chunkFilename: '[id].js'
    },
    module: {
        loaders: [
            { test: /\.coffee$/, loader: 'coffee' },
        ]
    },
    resolve: {
        extensions: ['', '.js', '.coffee'],
        alias: {
            jquery: require.resolve('./src/vendor/jquery.coffee'),
            jQuery: 'jquery'
        }
    },
    plugins: []
};

if (!minimize) {
    config.devtool = 'source-map';
}

if (minimize) {
    var dedup = new webpack.optimize.DedupePlugin();
    var ujs = new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_debugger: true,
            dead_code: true,
            unused: true
        },
        sourceMap: false});

    config.plugins.push(dedup);
    config.plugins.push(ujs);
}

module.exports = config;
