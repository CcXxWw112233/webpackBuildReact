const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { srcPath, indexJsPath, indexHtmlPath  } = require('./webpack/file.path.js')
const { resolve } = require('path')

var path = require('path');
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
        'react-hot-loader/patch',
        indexJsPath
    ],
    resolve:{
        //配置别名，在项目中可缩减引用路径
        alias: {
            '@': resolve('src'),
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
                test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']
            }, {
                test: /\.less$/,
                use: ['style-loader',
                    {
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
                    },  {
                        loader: 'less-loader',
                        options: {
                            modules: true
                        }
                    }]
            }, {
                test: /\.css$/, use: ['style-loader', 'css-loader']
            }, {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                },
            },   {
                test: /\.jsx?$/,
                use: ['babel-loader'],
                include: path.join(process.cwd(), 'src')
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
        // // 解决无需 import React from 'react' 便可以创建函数组件
        new webpack.ProvidePlugin({
          'React': 'react'
        }),
    ]
}
