// const merge = require('webpack-merge');
// const base = require('./webpack.base.js');
// const { resolve } = require('path')

// module.exports = merge(base, {
//     mode: 'production',
//     output: {
//         publicPath: './',// 配置该项热重载react-hot-loader才会生效
//         filename: 'index.[hash].js',
//         path: resolve('./dist'),
//     },
// })

const merge = require('webpack-merge');
const base = require('./webpack.base.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(base, {
  mode: 'production',
  output: {
    publicPath: './',
    filename: 'builds.[hash].js',
    path: path.resolve('./dist')
  },
  module: {},
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({}),
      new UglifyJsPlugin({
        exclude: /\/node_modules/, //不包含哪些文件
        // //允许过滤哪些块应该被uglified（默认情况下，所有块都是uglified）。
        // //返回true以uglify块，否则返回false。
        // chunkFilter: (chunk) => {
        //     // `vendor` 模块不压缩
        //     if (chunk.name === 'vendor') {
        //         return false;
        //     }
        //     return true;
        // },
        cache: false, //是否启用文件缓存，默认缓存在node_modules/.cache/uglifyjs-webpack-plugin.目录
        parallel: true, //使用多进程并行运行来提高构建速度
        sourceMap: true
      })
    ],
    splitChunks: {
      name: 'common'
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      //css打包单独立一个文件，而不是在js中生成
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css'
    }),
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin()
    // new CompressionPlugin({
    //     test: new RegExp('\\.(js|css)$'),
    // })
  ]
});
