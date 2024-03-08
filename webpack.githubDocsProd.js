const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: { //merge() only overwrites what is here, does not replace full object
    path: path.resolve(__dirname, 'docs'), //for github pages hosting
  },
});