const path = require('path');
const webpack = require('../webpack');
const {getWebpackEntries, normalizeOptions} = require('../utils')
const Promise = require('bluebird');
const {resolve} = require;

const clientLoader = {
  test: /index\.jsx$/,
  exclude: /node_modules/,
  loader: path.resolve(__dirname, './loaders/client.js')
};

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [

  ]
};

// exports
module.exports = compileScripts;
module.exports.getWebpackConfig = getWebpackConfig;

/**
 * compile scripts given the options
 * @param options
 * @returns {PromiseLike<T> | Promise<T>}
 */
function compileScripts(options) {

  return webpack(getWebpackConfig(options), options);
}


function getWebpackConfig(options) {

  const {destination, mode, loader} = normalizeOptions(options);

  const entries = getWebpackEntries(options, 'js');

  const clientLoaders = loader? [clientLoader] : [];

  return {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name]'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: resolve('babel-loader'),
          options: {
            cacheDirectory: true
          }
        },
        ...clientLoaders
      ]
    },
    plugins : []
  }
}
