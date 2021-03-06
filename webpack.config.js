const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDev = process.env.NODE_ENV === 'development';
console.log('ENV development: ' + isDev);

// *.js 文件的 loader
const jsLoader = [
  {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          '@babel/preset-env',
          {
            'useBuiltIns': false,
            'corejs': false,
            'loose': true,
          },
        ],
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            "corejs": 3,
            "helpers": true,
            "regenerator": true,
            "useESModules": true,
          },
        ],
        ['@babel/plugin-transform-modules-commonjs', { 'loose': true }],
        ['@babel/plugin-proposal-class-properties', { 'loose': true }],
        ['@babel/plugin-proposal-private-methods', { 'loose': true }],
      ],
    },
  },
];

const config = {
  entry: {
    'common': './example/tiledClass/common.js',
    'TiledData': './example/tiledClass/TiledData.js',
    'TiledJsonData': './example/tiledClass/TiledJsonData.js',
    'TiledLayersContainer.pixi': './example/tiledClass/TiledLayersContainer.pixi.js',
    'TiledLayersContainer.tinyjs': './example/tiledClass/TiledLayersContainer.tinyjs.js',
    'TiledSprite.pixi': './example/tiledClass/TiledSprite.pixi.js',
    'TiledSprite.tinyjs': './example/tiledClass/TiledSprite.tinyjs.js',
  },
  output: {
    path: path.resolve('./util/'),
    filename: '[name].umd.js',
    chunkFilename: '[name].chunk.umd.js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: jsLoader,
      },
    ],
  },
  plugins: [
    new webpack.ids.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new webpack.DefinePlugin({
      ENV: '"production"',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'example/tiledClass' },
      ],
    }),
  ],
  externals: {
    'Tiny': 'Tiny',
    'PIXI': 'PIXI',
  },
  optimization: {
    minimize: false,
  },
  mode: 'production',
};

// 生成分析报表
// const analyzer = require('yargs').argv.analyzer;
// if (analyzer) {
//   config.plugins.push(new BundleAnalyzerPlugin({
//     analyzerMode: 'static',
//   }));
// }

module.exports = config;
