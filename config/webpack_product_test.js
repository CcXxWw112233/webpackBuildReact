const { resolve } = require('path');
const {
  projectPath,
  srcPath,
  indexJsPath,
  indexHtmlPath
} = require('./webpack/file.path.js');

module.exports = {
  bail: true,
  devtool: undefined,
  entry: {
    index: './src/index.js',
    vendor: [
      'react',
      'react-dom',
      'dva',
      'react-router',
      'moment',
      'js-cookie',
      'lodash'
    ]
  },
  output: {
    path: resolve('./dist'),
    pathinfo: false,
    filename: '[name].[chunkhash:8].js',
    publicPath: undefined,
    chunkFilename: '[name].[chunkhash:8].async.js'
  },
  resolve: {
    modules: ['node_modules', resolve(projectPath, 'node_modules')],
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.json',
      '.jsx',
      '.ts',
      '.tsx'
    ],
    alias: {
      '@': resolve(projectPath, 'src'),
      src: resolve(projectPath, 'src')
    },
    plugins: []
  },
  module: {
    rules: [
      {
        //0
        test: /\.tsx?$/,
        include: projectPath,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            options: {
              emitErrors: true
            },
            loader: 'tslint-loader'
          }
        ]
      },
      {
        //1
        exclude: [
          /\.(html|ejs)$/,
          /\.json$/,
          /\.(js|jsx|ts|tsx)$/,
          /\.(css|less|scss|sass)$/
        ],
        loader: 'url-loader',
        options: { limit: 10000, name: 'static/[name].[hash:8].[ext]' }
      },
      {
        //2
        test: /\.js$/,
        include: projectPath,
        exclude: /node_modules/,
        use: [
          //   {
          //     loader:
          //       'F:\\work\\newdicolla-platform\\node_modules\\af-webpack\\lib\\debugLoader.js'
          //   },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  // 'F:\\work\\newdicolla-platform\\node_modules\\roadhog\\lib\\babel.js',
                  { browsers: ['last 2 versions'] }
                ]
              ],
              plugins: [
                [
                  'import',
                  { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }
                ],
                'transform-remove-console'
              ],
              cacheDirectory: true,
              babelrc: false
            }
          }
        ]
      },
      {
        //3
        test: /\.jsx$/,
        include: 'F:\\work\\newdicolla-platform',
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\af-webpack\\lib\\debugLoader.js'
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\babel-loader\\lib\\index.js',
            options: {
              presets: [
                [
                  'F:\\work\\newdicolla-platform\\node_modules\\roadhog\\lib\\babel.js',
                  { browsers: ['last 2 versions'] }
                ]
              ],
              plugins: [
                [
                  'import',
                  { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }
                ],
                'transform-remove-console'
              ],
              cacheDirectory: true,
              babelrc: false
            }
          }
        ]
      },
      {
        //4
        test: /\.(ts|tsx)$/,
        include: 'F:\\work\\newdicolla-platform',
        exclude: /node_modules/,
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\af-webpack\\lib\\debugLoader.js'
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\babel-loader\\lib\\index.js',
            options: {
              presets: [
                [
                  'F:\\work\\newdicolla-platform\\node_modules\\roadhog\\lib\\babel.js',
                  { browsers: ['last 2 versions'] }
                ]
              ],
              plugins: [
                [
                  'import',
                  { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }
                ],
                'transform-remove-console'
              ],
              cacheDirectory: true,
              babelrc: false
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\awesome-typescript-loader\\dist\\entry.js',
            options: {
              configFileName: 'F:\\work\\newdicolla-platform\\tsconfig.json',
              transpileOnly: true
            }
          }
        ]
      },
      {
        //5
        test: /\.html$/,
        loader:
          'F:\\work\\newdicolla-platform\\node_modules\\file-loader\\index.js',
        options: { name: '[name].[ext]' }
      },
      {
        //6
        test: /\.css$/,
        exclude: /node_modules/, ///, [(Function: exclude)],
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\extract-text-webpack-plugin\\dist\\loader.js',
            options: { omit: 0, remove: true }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\css-loader\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\postcss-loader\\lib\\index.js',
            options: {
              ident: 'postcss',
              plugins: []
            }
          }
        ]
      },
      {
        //7
        test: /\.css$/,
        include: /node_modules/,
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\extract-text-webpack-plugin\\dist\\loader.js',
            options: { omit: 0, remove: true }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\css-loader\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\postcss-loader\\lib\\index.js',
            options: { ident: 'postcss', plugins: [] }
          }
        ]
      },
      {
        //8
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\extract-text-webpack-plugin\\dist\\loader.js',
            options: { omit: 0, remove: true }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\css-loader\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\postcss-loader\\lib\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\less-loader\\dist\\cjs.js',
            options: { modifyVars: {} }
          }
        ]
      },
      {
        //9
        test: /\.less$/,
        include: /node_modules/,
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\extract-text-webpack-plugin\\dist\\loader.js',
            options: { omit: 0, remove: true }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\css-loader\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\postcss-loader\\lib\\index.js',
            options: {
              ident: 'postcss'
              //   plugins: [(Function: plugins)]
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\less-loader\\dist\\cjs.js',
            options: { modifyVars: {} }
          }
        ]
      },
      {
        //10
        test: /\.(sass|scss)$/,
        exclude: /node_modules/, //[(Function: exclude)],
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\extract-text-webpack-plugin\\dist\\loader.js',
            options: { omit: 0, remove: true }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\css-loader\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\postcss-loader\\lib\\index.js',
            options: {
              ident: 'postcss',
              plugins: [] //[(Function: plugins)]
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\sass-loader\\dist\\cjs.js',
            options: undefined
          }
        ]
      },
      {
        //11
        test: /\.(sass|scss)$/,
        include: /node_modules/,
        use: [
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\extract-text-webpack-plugin\\dist\\loader.js',
            options: { omit: 0, remove: true }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\css-loader\\index.js',
            options: {
              importLoaders: 1,
              minimize: { minifyFontValues: false },
              sourceMap: true
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\postcss-loader\\lib\\index.js',
            options: {
              ident: 'postcss',
              plugins: [] //[Function: plugins]
            }
          },
          {
            loader:
              'F:\\work\\newdicolla-platform\\node_modules\\sass-loader\\dist\\cjs.js',
            options: undefined
          }
        ]
      }
    ]
  },
  plugins: [
    new HashedModuleIdsPlugin({
      hashFunction: 'md5',
      hashDigest: 'base64',
      hashDigestLength: 4
    }),
    new ModuleConcatenationPlugin(),
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css',
      id: 1,
      options: { allChunks: true }
    }),
    new ManifestPlugin({
      opts: {
        basePath: '/app/',
        publicPath: '',
        fileName: 'manifest.json',
        stripSrc: null,
        transformExtensions: /^(gz|map)$/i,
        writeToFileEmit: false,
        cache: null,
        seed: null,
        filter: null,
        map: null,
        reduce: null
      }
    }),
    new UglifyJsPlugin({
      options: { compress: [Object], mangle: [Object], output: [Object] }
    }),
    new DefinePlugin({
      definitions: {
        'process.env.NODE_ENV': '"production"',
        'process.env.HMR': undefined
      }
    }),
    new HtmlWebpackPlugin({
      options: {
        template: './public/index.ejs',
        filename: 'index.html',
        hash: false,
        inject: true,
        compile: true,
        favicon: false,
        minify: false,
        cache: true,
        showErrors: true,
        chunks: 'all',
        excludeChunks: [],
        title: 'Webpack App',
        xhtml: false
      }
    }),
    new CaseSensitivePathsPlugin({
      options: {},
      pathCache: {},
      fsOperations: 0,
      primed: false
    }),
    new LoaderOptionsPlugin({ options: { options: [Object], test: [Object] } }),
    new ProgressPlugin({ profile: undefined, handler: [Function] }),
    new CommonsChunkPlugin({
      chunkNames: ['vendor'],
      filenameTemplate: undefined,
      minChunks: Infinity,
      selectedChunks: undefined,
      children: undefined,
      deepChildren: undefined,
      async: undefined,
      minSize: undefined,
      ident:
        'F:\\work\\newdicolla-platform\\node_modules\\webpack\\lib\\optimize\\CommonsChunkPlugin.js0'
    }),

    new ContextReplacementPlugin({
      resourceRegExp: /moment[/\\]locale$/,
      newContentResource: undefined,
      newContentRecursive: undefined,
      newContentRegExp: /en-gb|zh-cn/
    })
  ],
  externals: undefined,
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  performance: {}
};
