const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const plugins = [
  new CleanWebpackPlugin(['dist/js'], {
    verbose: true
  }),
  new HtmlWebpackPlugin({
    template: path.join(__dirname, 'src/server/views/layout.html'),
    filename: 'layout.html',
    inject: 'body'
  })
]

module.exports = {
  devtool: 'eval-source-map',
  entry: ['babel-polyfill', './src/client/components'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  },
  plugins: plugins
}
