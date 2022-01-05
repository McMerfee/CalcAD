// const path = require('path');
// const { ProvidePlugin } = require('webpack');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const Dotenv = require('dotenv-webpack');
const autoprefixer = require('autoprefixer');
const sass = require('sass');

const smp = new SpeedMeasurePlugin();

const isProd = process.env.NODE_ENV === 'production';
const isStage = process.env.NODE_ENV === 'staging';

const config = smp.wrap({
  entry: './src/client/index.js',
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [
          /node_modules/,
          /webpack.config.js/,
        ],
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
              sassOptions: {
                fiber: false,
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                autoprefixer(),
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        secure: false,
      },
    },
    publicPath: '/',
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Cache-Control, Content-Type, Accept',
      'Access-Control-Allow-Credentials': 'true',
    },
  },
  plugins: [
    // new ProvidePlugin({
    //   i18n: [path.resolve(__dirname, 'src/client/utils/importi18n.js'), 'default'],
    // }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [],
      cleanAfterEveryBuildPatterns: ['dist'],
    }),
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/client/assets/',
          to: 'src/client/assets',
        },
        {
          from: './public',
          to: 'public',
        },
      ],
    }),
    new Dotenv(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      (isProd || isStage) && new CssMinimizerPlugin({
        minimizerOptions: {
          options: { preset: ['default'] },
        },
      }),
      (isProd || isStage) && new TerserPlugin(),
    ].filter(Boolean),
  },
});

module.exports = config;
