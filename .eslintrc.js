module.exports = {
  root: true,
  extends: ['umi', 'prettier', 'prettier/react'],
  globals: {
    luckysheet: true,
    pdfjsLib: true,
  },
  parser: 'babel-eslint',
  plugins: ['react', 'prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  rules: {
    'prettier/prettier': ['warn', {}, {}],
    'react/jsx-no-bind': 'off',
    'react/no-deprecated': 'off',
    'jsx-a11y/href-no-hash': 'off',
    'jsx-a11y/alt-text': 'off',
    eqeqeq: 'off',
    'no-unreachable': 'off',
    radix: 'off',
    'array-callback-return': 'off',
    'no-unused-expressions': 'off',
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
      experimentalObjectRestSpread: true,
    },
  },
  settings: {
    polyfills: ['fetch', 'Promise'],
    react: {
      version: 'detect',
    },
  },
}
// https://blog.csdn.net/song_de/article/details/106102775
// ：https://juejin.im/post/5d5ba34af265da03aa257075
// https://blog.csdn.net/qq_38128179/article/details/85621825
