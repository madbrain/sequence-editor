const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
    entry: {
        bundle: ['./src/index.js']
    },
    output: {
        library: 'Editor',
        libraryExport: 'default',
        libraryTarget: 'umd',
        path: __dirname + '/public',
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte')
        },
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.svelte'],
        mainFields: ['svelte', 'browser', 'module', 'main']
    },
    module: {
        rules: [
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false, //necessary if you use url('/path/to/some/asset.png|jpg|gif')
                        }
                    }
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: 'styles.css' }),
        new CopyWebpackPlugin([
            { from: '**/*', to: 'vendor', context: 'node_modules/highlight.js/styles' }
        ])
    ],
    mode,
    devtool: 'source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'public')
    }
};
