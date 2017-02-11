// https://webpack.js.org/
var path = require( "path" ),
    webpack = require( 'webpack' ),
    chalk = require( 'chalk' ),
    ScriptExtHtmlWebpackPlugin = require( 'script-ext-html-webpack-plugin' ),
    copyWebpackPlugin = require( 'copy-webpack-plugin' ),    
    HtmlWebpackPlugin = require( 'html-webpack-plugin' );
    
const DEV_MODE = process.env.NODE_ENV === 'development';
const colorFun = DEV_MODE ? chalk.black.bgYellow : chalk.bgCyan.white;

console.log( colorFun( `DEV_MODE = ${DEV_MODE} , process.env.NODE_ENV = ${process.env.NODE_ENV}` ) );

var config = {
    context: path.resolve( 'src' ),
    entry: {
        app: [ './js/main.js' ],// 這裡要放 Array , 因為在 gulp 時會動態加入 hotreload 的 js
    },
    output: {
        filename: "asset/js/[name].js?[hash]",        
        path: path.resolve( __dirname, './dist' ),        
        publicPath: '',
    },
    resolveLoader: {
        moduleExtensions: [ "-loader" ],
    },
    resolve: {
        alias: {
            // 'vue$': 'vue/dist/vue.common.js'
        },
        modules:[
            path.resolve( 'src/vue' ),
            path.resolve( 'src/html' ),
            path.resolve( 'src/img' ),
            path.resolve( 'src/css' ),
            path.resolve( 'src/asset' ),
            path.resolve( 'src/js' ),
            path.resolve( 'src' ),
            path.resolve( "node_modules"),
        ],
        extensions: [ ".js", ".vue", ".stylus" ]
    },
    devServer: {    //https://webpack.js.org/configuration/dev-server/#devserver
        hot: true,
        stats: {    //https://webpack.js.org/configuration/stats/
            colors: true,
            hash: false, 
            version: false,
            timings: true,
            assets: true, 
            chunks: false,
            chunkModules: false,
            modules: false,
            cached: false, 
            reasons: false,
            source: true,
            error: true,
            errorDetails: true,
            chunkOrigins: false,
        }
    }
};
config.module = {
    // https://webpack.js.org/configuration/module/#module-rules
    rules: [
        {
            test: /\.vue$/,
            loader: 'vue-loader',
            include: path.resolve( 'src/vue' ),
            exclude: /node_modules/,
            options: {
                // https://github.com/vuejs/vue-loader/blob/master/docs/en/features/postcss.md
                postcss: [
                    require( 'autoprefixer' )( {
                        browsers: [ "last 5 version", "iOS >=8", "Safari >=8" ],
                    }),
                    require( 'cssnano' )( {
                        zindex: false,
                        calc: false,
                        reduceIdents: false,
                    }),
                ],
            }
        },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
                path.resolve( 'src/js' ),
                path.resolve( 'src/lib' )
            ],
            exclude: /node_modules/
        },
        {
            test: /\.(png|jpg|gif|svg|ico)$/,
            include: path.resolve( 'src/img' ),
            loader: 'url-loader',
            exclude: /node_modules/,
            options: {
                limit: 1024,
                name: "asset/[path][name].[ext]?[hash:8]"
            }
        },
        {
            test: /\.pug$/,
            loader: 'pug-loader',
            options: {
                pretty: DEV_MODE,
                self: true,
            }
        }
    ]
};

config.plugins = [
    copyWebpackPlugin( [    
        { from: 'asset', to: './' },        
    ] ),    
    new HtmlWebpackPlugin({
        template: 'html/index.template.pug',       
        data: {
            DEV_MODE:DEV_MODE
        }
    }),
    new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'defer',
    }),
    new webpack.DefinePlugin( {
        __DEV__: DEV_MODE,
        'process.env.NODE_ENV': DEV_MODE ? "'development'" : '"production"'
    }),
    //  http://vue-loader.vuejs.org/en/workflow/production.html
    ...DEV_MODE ? [
        new webpack.HotModuleReplacementPlugin()
    ] : [
        new webpack.optimize.UglifyJsPlugin( {
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        // optimize module ids by occurence count
        new webpack.LoaderOptionsPlugin( {
            test: /\.css$/, // optionally pass test, include and exclude, default affects all loaders
            minimize: true,
            debug: false,
            options: {
            }
        })
    ]
];


 // 不要將這裡打包到你的 js 檔裡,
config.externals = {
    'vue': 'Vue',
    'vuex': 'Vuex',
    'axios': 'axios',
    'vue-router': 'VueRouter'
};
module.exports = config;