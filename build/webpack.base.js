const isDev = process.env.NODE_ENV === 'development'
const path = require('path')
// const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const globalConfig = require('../mpa.config.js')
const Util = require('./utils')
const distPath = path.resolve(__dirname, '../dist')

module.exports = {
    entry: Util.getEntry(),
    target: 'web',
    output: {
        filename: globalConfig.disableHash ? '[name].js' : '[name].[hash:8].js',
        path: distPath,
        publicPath: globalConfig.publicPath || '/'
    },
    resolve: {
        extensions: ['.sass', '.scss', '.js', '.css'],
        alias: {
            '@': path.resolve(__dirname, '../src/common')
        }
    },
    module: {
        rules: [
            // 针对.vue单文件组件
            {
                test: /\.vue$/i,
                use: ['vue-loader']
            },
            // 针对js & jsx
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: []
                    }
                }
            },
            // 针对.sass/.scss文件
            {
                test: /\.s[ac]ss$/i,
                oneOf: [
                    // 1. <style lang="sass" module>
                    {
                        resourceQuery: /module/,
                        use: [
                            {
                                loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                                options: isDev ? {} : {
                                    hmr: isDev,
                                    publicPath: '/'
                                }
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 2,
                                    modules: true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: [
                                        require('autoprefixer')({})
                                    ]
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        indentedSyntax: true
                                    }
                                }
                            }
                        ]
                    },
                    // 2. <style lang="sass">
                    {
                        use: [
                            {
                                loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                                options: isDev ? {} : {
                                    hmr: isDev,
                                    publicPath: '/'
                                }
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 2
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: [
                                        require('autoprefixer')({})
                                    ]
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        indentedSyntax: true
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            // 针对.css文件
            {
                test: /\.css$/i,
                oneOf: [
                    // 1. <style module>
                    {
                        resourceQuery: /module/,
                        use: [
                            {
                                loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                                options: isDev ? {} : {
                                    hmr: isDev,
                                    publicPath: '/'
                                }
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1,
                                    modules: true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: [
                                        require('autoprefixer')({})
                                    ]
                                }
                            }
                        ]
                    },
                    // 2. <style>
                    {
                        use: [
                            {
                                loader: 'vue-style-loader'
                            },
                            {
                                loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                                options: isDev ? {} : {
                                    hmr: isDev,
                                    publicPath: '/'
                                }
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: [
                                        require('autoprefixer')({})
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            // 针对小于2k的静态图片 -> base64
            {
                test: /\.(png|jpg|gif|svg)$/i,
                loader: 'url-loader',
                options: {
                    limit: 2048
                }
            },
            // 针对小于8k的特殊静态资源
            {
                test: /\.(eot|woff|woff2|ttf|otf)(\?.*)?$/i,
                loader: 'file-loader',
                options: {
                    limit: 8192,
                    name: '[path][name].[ext]',
                    outputPath: 'static/'
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        ...Util.addHtmlWebpackPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: globalConfig.disableHash ? '[name].css' : '[name].[hash:8].css',
            chunkFilename: '[id].css'
        }),
        new ResourceHintWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: 'public',
                to: './',
                filter: (resource) => {
                    console.log(resource)
                }
            }
        ])
    ]
}