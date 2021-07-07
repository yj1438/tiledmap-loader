const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const autoprefixer = require('autoprefixer');

const isDev = process.env.NODE_ENV === 'development';
console.log('开发环境：' + isDev);
// 生成分析报表
const analyzer = require('yargs').argv.analyzer;

const postcssCfg = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins: [
      autoprefixer(),
    ],
  },
};

// *.js 文件的 loader
const jsLoader = [
  { loader: 'thread-loader' },
  {
    loader: 'babel-loader',
    options: {
      presets: [['@babel/preset-env', { 'useBuiltIns': 'usage', 'corejs': '3', loose: true }]],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            // "corejs": false, // default
            // "helpers": true, // default
            'regenerator': false,
            'useESModules': true,
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
    index: './index.js'
  },
  output: {
    path: path.resolve('./www/'),
    filename: 'js/[name]_[hash:6].js',
    chunkFilename: 'js/[name]_[hash:6].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: jsLoader,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          'css-loader',
          postcssCfg,
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          'css-loader',
          postcssCfg,
          'less-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|webp|gif|bmp)$/,
        exclude: /resource/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 900,
              name: '[name]_[hash:6].[ext]',
              outputPath: 'css',
              publicPath: './',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|webp|gif|bmp)$/,
        include: /resource/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]_[hash:6].[ext]',
              outputPath: 'res',
              publicPath: './res',
              limit: false,
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.tiled$/,
        include: path.resolve('./canvas/'),
        use: [
          {
            loader: '../src/index.js',
            options: {},
          },
        ],
      },
    ],
  },
  plugins: [
    new ProgressBarPlugin({
      renderThrottle: 1000,
    }),
    new webpack.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]_[hash:6].css',
      chunkFilename: 'css/[name]_[hash:6].chunk.css',
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'layout/index.html',
      chunks: ['index'],
      chunksSortMode: 'auto',
    })
  ],
  externals: {
    'Tiny': 'Tiny',
    'PIXI': 'PIXI',
  },
  resolve: {
    alias: {
      common: path.join(__dirname, './common'),
    },
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all', // all async initial
      name: 'common',
      minChunks: 2,
    },
    minimizer: [
      new TerserJSPlugin({ extractComments: false }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  stats: {
    modules: false,
    children: false,
    entrypoints: false,
  },
};

if (isDev) {
  jsLoader.splice(1, 0, { loader: 'cache-loader' });
  config.optimization.minimize = false;
  config.devtool = 'source-map'; // https://webpack.js.org/configuration/devtool/#devtool
  config.devServer = {
    contentBase: './dist',
    hot: true,
    host: '0.0.0.0',
    disableHostCheck: true,
  };
  config.mode = 'development';
  config.plugins.push(new webpack.DefinePlugin({
    ENV: '"development"',
  }));
} else {
  config.mode = 'production';
  config.plugins.push(new webpack.DefinePlugin({
    ENV: '"production"',
  }));
}

if (analyzer) {
  config.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
  }));
}

module.exports = config;
