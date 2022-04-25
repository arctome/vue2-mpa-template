const { merge } = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
const globalConfig = require('../mpa.config')
const Util = require('./utils')

module.exports = merge(baseConfig, {
    mode: "development",
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin({})
    ],
    devServer: {
        contentBase: path.join(__dirname, '../dist'),
        publicPath: '/',
        inline: true,
        quiet: false,
        open: true,
        host: Util.getHost(),
        port: globalConfig.port || 8080,
        hot: true,
        overlay: {
            warnings: false,
            errors: true
        },
        historyApiFallback: {
            rewrites: [
            ]
        }
    }
})