const merge = require('webpack-merge');
const base = require('./webpack.base.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(base, {
    mode: 'production',
    output: {
        publicPath: './',// 配置该项热重载react-hot-loader才会生效
        filename: 'builds.[hash].js',
        path: path.resolve('./dist'),
    },
    module: {

    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin()
        ],
    },
    plugins: [
        new ExtractTextPlugin({ //css打包单独立一个文件，而不是在js中生成
            filename: 'style.[hash].css'
        }),
        new CleanWebpackPlugin('dist'),
        new webpack.HashedModuleIdsPlugin(),

    ]
})
