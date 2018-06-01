const path = require('path');
const webpack = require('../webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {getWebpackEntries, getIncludeFiles, normalizeOptions} = require('../utils');
const {resolve} = require;

const webpackConfig = {

  cache: true,
  mode: 'development',
  devtool: 'cheap-module-source-map',
};

// exports
module.exports = compileStyles;
module.exports.getWebpackConfig = getWebpackConfig;

function compileStyles(options) {

  return webpack(getWebpackConfig(options), options);
}

function getWebpackConfig(options) {

  const {destination, mode, loader, cwd, sync} = normalizeOptions(options);

  const entries = getWebpackEntries(options, 'css');

  const useCSSLoader = mode === 'development' && sync;

  const plugins = [
    new MiniCssExtractPlugin({
      filename: loader ? '[name]/styles.css' : '[name]'
    })
  ]

  const uses = useCSSLoader? [resolve('css-hot-loader'), MiniCssExtractPlugin.loader] : [MiniCssExtractPlugin.loader]

  console.log(getIncludeFiles(options))

  return {
    ...webpackConfig,
    mode,
    entry: entries,
    output: {
      path: path.resolve(destination),
      filename: '[name].tmp'
    },
    module: {
      rules: [
        {
          test: /\.styl$/,
          exclude: /node_modules/,
          use: [
            ...uses,
            resolve('css-loader'),
            {
              loader: resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('autoprefixer')()
                ]
              }
            },
            {
              loader: resolve('stylus-loader'),
              options: {
                paths: [cwd, path.resolve('./node_modules')],
                import: getIncludeFiles(options)
              },
            },
          ],
        }
      ]
    },
    plugins
  }
}
