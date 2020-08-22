const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { srcPath, indexJsPath, indexHtmlPath } = require('./webpack/file.path.js')
var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 生成HTML文件
const generateIndex = new HtmlWebpackPlugin({
    inject: 'body',
    filename: 'index.html',
    template: indexHtmlPath
})

module.exports = {
    // 基础目录（绝对路径），用于从配置中解析入口点和加载程序
    // 默认使用当前目录，但建议在配置中传递一个值。这使得您的配置独立于CWD（当前工作目录）
    context: srcPath,
    // 入口文件
    entry: [
        'babel-polyfill', //react regeneratorRuntime is not defined
        'react-hot-loader/patch',
        indexJsPath
    ],
    resolve: {
        //配置别名，在项目中可缩减引用路径
        alias: {
            '@': path.resolve('src'),
        }
    },
    // 模块配置
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)/,
                use: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.tsx?$/,
                // ts-loader是官方提供的处理tsx的文件
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']
            }, {
                test: /\.less$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader, //可以打包出一个单独的css文件
                    "css-loader",
                    "postcss-loader",
                    {
                        loader: 'less-loader',
                        options: {
                            modules: true
                        }
                    }]
            }, {
                test: /\.css$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    "postcss-loader"
                ]
            }, {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                },
            }, {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                }
            }, {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                }
            }, {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                }
            }
        ]
    },
    // 插件配置
    plugins: [
        generateIndex,
        // 开启全局的模块热替换(HMR)
        new webpack.HotModuleReplacementPlugin(),
        // 热加载中可以输入更加友好的模块名
        new webpack.NamedModulesPlugin(),
        //解决函数组件没 import React from 'react'报错
        new webpack.ProvidePlugin({
            "React": "react",
        }),
        new MiniCssExtractPlugin({ //css打包单独立一个文件，而不是在js中生成
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        }),
    ]
}




// new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/) //忽略moment包里的locale包

// noparse
/**
 * module: {
 *   noParse: '/jquery/', //不解析jquery的相关依赖包
 *   rules: []
 * }
*/

// 打包多个页面
// entry多个，output多个， 多个new htmlwebpackplugin({template:'xx.html',chunks:[entry入口的chunks可选多个或单个]})


// 抽离公共代码
// module.exports = {
//    //...
//     optimization: {
//       splitChunks: {
//         chunks: 'async',
//         minSize: 30000,
//         minChunks: 1,
//         maxAsyncRequests: 5,
//         maxInitialRequests: 3,
//         automaticNameDelimiter: '~',
//         name: true,
//         cacheGroups: {
//           vendors: {
//             test: /[\\/]node_modules[\\/]/,
//             priority: -10
//           },
//           default: {
//             minChunks: 2,
//             priority: -20,
//             reuseExistingChunk: true
//           }
//         }
//       }
//     }
//   };

// 动态链接库DLLPlugin 和 DLLReferencePlugin 用某种方法实现了拆分 bundles，同时还大大提升了构建的速度
/**
 * 先将单独的比如react,react-dom构建好到一个文件里面
 * dllplugin会将文件产生映射生成maaifest.json文件
 * DllReferencePlugin会从映射中直接引用文件，提升打包速度
 *  */ 


//  happypack 多线程提升打包速度