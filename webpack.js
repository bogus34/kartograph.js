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
            { test: /\.coffee$/, loader: 'coffee' }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.coffee'],
        alias: { jQuery: 'jquery' }
    },
    plugins: []
};

if (!minimize) {
    config.devtool = 'source-map';
}

if (minimize) {
    var ujs = new webpack.optimize.UglifyJsPlugin({
        compress: {warnings: false},
        sourceMap: false});
    config.plugins.push(ujs);
}

module.exports = config;
