const MIN_BABEL_VERSION = 7;

module.exports = (api) => {
  api.assertVersion(MIN_BABEL_VERSION);
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          'useBuiltIns': false,
          'corejs': false,
          'loose': true,
          // targets: {
          //   node: '10.13.0',
          // },
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
  };
};