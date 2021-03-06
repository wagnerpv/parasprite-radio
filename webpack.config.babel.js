'use strict'
import webpack from 'webpack'
import coffeelintStylish from 'coffeelint-stylish'
import path from 'path'

let inProduction = process.env.NODE_ENV === 'production' || process.argv.indexOf('-p') !== -1

export default {
  entry: {
    main: ['./src/script/main'],
    admin: ['./src/script/admin'],
    popout: ['./src/script/popout'],
    livestream: ['./src/script/livestream']
  },
  output: {
    path: __dirname,
    filename: './build/script/[name].js',
    chunkFilename: './build/script/[id].js'
  },
  module: {
    preLoaders: [
      // { test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/ },
      // { test: /\.coffee$/, loader: 'coffeelint-loader', exclude: /node_modules/ },
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          sourceMaps: inProduction,
          presets: ['es2015'],
          plugins: ['transform-strict-mode']
        }
      },
      { test: /\.coffee$/, loader: 'coffee-loader', exclude: /node_modules/ },
      { test: /\.mustache$/, loader: 'mustache', exclude: /node_modules/ }
    ],
    noParse: [
      /node_modules\/hls\.js/
    ]
  },

  coffeelint: {
    reporter: (results) => {
      // results = [].concat(results.warn, results.error)
      let errors = [].concat(results.error)
      let warnings = [].concat(results.warn)
      let clog = console.log
      if (errors.length > 0) {
        console.log = (str) => { this.emitError(str.replace(/^\n+|\n+$/g, '')) }
        coffeelintStylish.reporter('', errors)
      }
      if (warnings.length > 0) {
        console.log = (str) => { this.emitWarning(str.replace(/^\n+|\n+$/g, '')) }
        coffeelintStylish.reporter('', warnings)
      }
      console.log = clog
    }
  },

  resolve: {
    extensions: ['', '.coffee', '.js', '.json', '.mustache'],
    root: [path.join(__dirname, '/src/script')],

    alias: {
      'underscore': 'lodash'
    }
  },

  plugins: [

    new webpack.ProvidePlugin({
      // Detect and inject
      $: 'jquery',
      Backbone: 'backbone',
      _: 'underscore',
      Marionette: 'backbone.marionette'
    })
  ],

  devtool: 'inline-source-map',
  debug: true
}
