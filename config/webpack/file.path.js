const { resolve } = require('path')

// 项目根目录
const projectPath = process.cwd()
// 代码地址目录

const srcPath = resolve(projectPath, 'src')
// 入口文件目录
const mainPath = resolve(projectPath, 'public')

// 入口文件
const indexJsPath = resolve(srcPath, 'index.js')
const indexHtmlPath = resolve(mainPath, 'index.html')

module.exports = {
    srcPath,
    mainPath,
    indexJsPath,
    indexHtmlPath
}