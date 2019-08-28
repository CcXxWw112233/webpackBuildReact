const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { srcPath, indexJsPath, indexHtmlPath  } = require('./webpack/file.path.js')
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
    devServer: {
        port: 9000,
        host:'localhost',
        overlay:{
            errors:true, //编译过程中如果有任何错误，都会显示到页面上
        },
        open:true,// 自动帮你打开浏览器
        hot:true, // 热重载
        historyApiFallback: true, //BrowserRouter模式下刷新报错
    },
    // 入口文件
    entry: [
        'react-hot-loader/patch',
        indexJsPath
    ],

    // 输入配置
    output: {
        publicPath: '/'// 配置该项热重载react-hot-loader才会生效
    },

    // 模块配置
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: 'babel-loader'
            }, {
                test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']
            }, {
                test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']
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
        new webpack.NamedModulesPlugin()
    ]
}

// "sass-loader": "^7.0.1",
//     "style-loader": "^0.21.0",
//     "css-loader": "^0.28.11",
//     "less-loader": "^5.0.0",
//     "node-sass": "^4.9.0",
//     "url-loader": "^1.0.1",
//html-loader