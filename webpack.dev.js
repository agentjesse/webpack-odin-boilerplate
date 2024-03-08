const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './src',  // guide example: ./dist
    client: {
      logging: 'warn', // Suppress the standard webpack console messages
    },
    watchFiles: {
      paths: ['src/*.html'], //might be default
      options: {
        usePolling: false,
      },
    },
  },
});
