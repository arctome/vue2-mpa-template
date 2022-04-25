const path = require('path')
const glob = require('glob')
const fs = require('fs')
const globalConfig = require('../mpa.config') || {}
const HtmlWebpackPlugin = require('html-webpack-plugin')

// 工具函数
/**
 * @method getEntry 获取src下的分页（按目录）
 */
function getEntry() {
    const globPath = 'src/pages/*/*.js' // 匹配src/pages目录下的所有文件夹中的js文件
    // (\/|\\\\) 这种写法是为了兼容 windows和 mac系统目录路径的不同写法
    const pathDir = 'src/pages/(\/|\\\\)(.*?)(\/|\\\\)' // 路径为src目录下的所有文件夹
    const files = glob.sync(globPath)
    let dirname; const entries = []
    for (let i = 0; i < files.length; i++) {
        dirname = path.dirname(files[i])
        entries.push(dirname.replace(new RegExp('^' + pathDir), '$2').replace('src/', ''))
    }
    return entries
}
/**
 * @method addEntry 生成entry { k:v } 对象
 */
function addEntry() {
    const entryObj = {}
    getEntry().forEach(item => {
        entryObj[item] = path.resolve(__dirname, '..', 'src', 'pages', item, 'index.js')
    })
    return entryObj
}
/**
 * @method addHtmlWebpackPlugin 为每个entry生成plugins
 */
function addHtmlWebpackPlugin() {
    const pluginsArr = []
    const defaultConfig = {}
    getEntry().forEach(item => {
        const userConfig = require(path.resolve(__dirname, '..', 'src', 'pages', item, 'config.js'))
        const config = Object.assign({}, defaultConfig, userConfig)
        pluginsArr.push(
            new HtmlWebpackPlugin({
                filename: `${item}.html`,
                template: config.mobile ? path.resolve(__dirname, '..', '../public/mobile.html') : path.resolve(__dirname, '..', '../public/index.html'),
                hash: globalConfig.disableHash ? false : true,
                chunks: ['vendor', item],
                inject: true,
                prefetch: ['*.js', '*.css'],
                preload: false,
                meta: {
                    ...config.meta
                },
                templateParameters: {
                    title: config.title
                },
                minify: {
                    removeAttributeQuotes: false,
                    removeComments: true,
                    collapseWhitespace: true,
                    removeScriptTypeAttributes: false,
                    removeStyleLinkTypeAttributes: true
                }
            })
        )
    })
    return pluginsArr
}
// 获取本机IP,当IP 设置为本机IP 后, 局域网内其它人可以通过 IP+端口,访问本机开发环境.
function getHost() {
    let localIP = null
    const interfaces = require('os').networkInterfaces()
    for (const devName in interfaces) {
        const iface = interfaces[devName]
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i]
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && alias.mac !== '00:00:00:00:00:00') {
                localIP = alias.address
            }
        }
    }

    localIP = localIP || '127.0.0.1'
    return localIP
}
// end

module.exports = {
    getEntry,
    addEntry,
    addHtmlWebpackPlugin,
    getHost
}
