var path = require('path');
var nodeExternals = require('webpack-node-externals');
var awt = require('awesome-typescript-loader');

var typescriptLoader = {
    test: /\.ts?$/,
    loader: 'awesome-typescript-loader'
};

module.exports = [
    {
        entry: './src/server/index.ts',
        target: 'node',
        node: {
            __dirname: false,
            __filename: false,
        },
        externals: [nodeExternals()],
        resolve: {
            extensions: ['.ts'],
            plugins: [new awt.TsConfigPathsPlugin()],
        },
        module: {
            loaders: [typescriptLoader]
        },
        output: {
            filename: 'server.js',
            path: path.resolve(__dirname)
        }
    },
    {
        entry: './src/client/index.ts',
        target: 'web',
        node: { fs: 'empty' },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['node_modules'],
            plugins: [new awt.TsConfigPathsPlugin()],
        },
        module: {
            loaders: [typescriptLoader]
        },
        output: {
            filename: 'public/bundle.js',
            path: path.resolve(__dirname)
        }
    }
];