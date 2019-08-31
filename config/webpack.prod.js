const merge = require('webpack-merge');
const base = require('./webpack.base.js');
const { resolve } = require('path')

module.exports = merge(base, {
    mode: 'production',
    output: {
        publicPath: './',// 配置该项热重载react-hot-loader才会生效
        filename: 'index.[hash].js',
        path: resolve('./dist'),
    },
})