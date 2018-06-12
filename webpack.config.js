const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry : ['./src/index.js', './scss/main.scss'],
    output : {
        filename : 'bundle.js',
        path : path.resolve(__dirname, 'dist')
    },
    devtool : 'inline-source-map',
    devServer : {
        contentBase : './dist'
    },
    module : {
        rules : [
            {
                test : /src\.js$/,
                exclude : /(node_modules|bower_components)/,
                use : {
                    loader : 'babel-loader',
                    options : {
                        presets : [ 'env' ]
                    }
                }
            },
            { // sass / scss loader for webpack
                   test: /\.(sass|scss)$/,
                   loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
            },
            {
              test: /\.glsl$/,
              loader: 'webpack-glsl-loader'
            }
        ]
    },
      plugins: [
        new ExtractTextPlugin({ // define where to save the file
          filename: 'styles.css',
          allChunks: true,
        }),
        new UglifyJSPlugin()
    ]
};
