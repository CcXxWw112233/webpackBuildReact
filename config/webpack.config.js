const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { srcPath, indexJsPath, indexHtmlPath  } = require('./webpack/file.path.js')

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
        hot:true
    },
    // 入口文件
    entry: [
        'react-hot-loader/patch',
        indexJsPath
    ],

    // 输入配置
    output: {
        publicPath: '/'
    },

    // 模块配置
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: 'babel-loader'
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