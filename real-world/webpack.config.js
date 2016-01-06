var path = require('path')
var webpack = require('webpack')

module.exports = {
  // debug: !isProduction,
  // devtool: 'source-map', //生成sourcemap,便于开发调试
  // devtool: 'cheap-module-eval-source-map',
  // entry: {
  //   // 'path': path.join(__dirname, './start/js'),
  //   //分开打包，需要指定文件分组，并且配置resolve解释依赖文件的位置
  //   'index': './' + appPaths.appEntry,//'index.js',//appPaths.appEntry,
  //   // 'vendors': ['react', 'react-dom', 'redux', 'react-redux', 'redux-thunk', 'classnames'], //这里可以结合智能提取公共脚本插件
  // },
  output: {
    // library: 'AMUITouch',
    // libraryTarget: 'umd',
    // path: path.join(__dirname, 'dist'),  //文件输出目录
    // publicPath: '/static/',  //用于配置文件发布路径，如CDN或本地服务器
    filename: '[name].bundle.js'
  },
  plugins: [
    //将公共代码抽离出来合并为一个文件
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"), //可以使用多次
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    //提供全局的变量，在模块中使用无需用require引入
    // new webpack.ProvidePlugin({
    //   jQuery: "jquery",
    //   $: "jquery",
    // }),
    // new CommonsChunkPlugin('common.js'),
    // //js文件的压缩
    // new uglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })
  ],
  // 新添加的module属性
  module: {
    //加载器配置 "-loader"其实是可以省略不写的，多个loader之间用“!”连接起来。
    loaders: [
      //.css 文件使用 style-loader 和 css-loader 来处理
      // { test: /\.css$/, loader: 'style-loader!css-loader' },

      //.js 文件使用 jsx-loader 来编译处理
      //include: __dirname,
      // { test: /\.js$/, exclude: /node_modules/, loader: 'babel!babel-loader',},
      { test: /\.js?$/, exclude: /node_modules/ , loaders: ['react-hot', 'babel'] },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      // { test: /\.js$/, exclude: /node_modules/, loader: 'babel!jsx-loader?harmony' },  //loader: "babel"
      // { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },  //loader: "babel"

      //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
      // { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
      // { test: /\.css$/, loader: "style!css" },

      //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
      // { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=8192'}
      //配置信息的参数“?limit=8192”表示将所有小于8kb的图片都转为base64形式（其实应该说超过8kb的才使用 url-loader 来映射到文件，否则转为data url形式）。
    ]
  },
  //其它解决方案配置
  resolve: {
    //查找module的话从这里开始查找
    // root: 'E:/github/flux-example/src', //绝对路径
    // 这里 root 指谁的根，项目根目录？可以配置 path.join(__dirname, '/src/js') 吗
    // root: path.join(__dirname, 'node_modules'),
    // root: [process.cwd() + '/node_modules'],
    // modulesDirectories: ["node_modules"],

    //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
    extensions: ['', '.js', '.json', '.jsx'],
    // extensions: ['', '.js', '.json', '.jsx', ,'.es6', '.scss'],

    //模块别名定义，方便后续直接引用别名，无须多写长长的地址
    // alias: {
    //   babel_polyfill : './babel/dist/polyfill',//后续直接 require('AppStore') 即可
    //   // ActionType : 'js/actions/ActionType.js',
    //   // AppAction : 'js/actions/AppAction.js'
    // }
  }
}


// // When inside Redux repo, prefer src to compiled version.
// // You can safely delete these lines in your project.
// var reduxSrc = path.join(__dirname, '..', '..', 'src')
// var reduxNodeModules = path.join(__dirname, '..', '..', 'node_modules')
// var fs = require('fs')
// if (fs.existsSync(reduxSrc) && fs.existsSync(reduxNodeModules)) {
//   // Resolve Redux to source
//   module.exports.resolve = { alias: { 'redux': reduxSrc } }
//   // Compile Redux from source
//   module.exports.module.loaders.push({
//     test: /\.js$/,
//     loaders: [ 'babel' ],
//     include: reduxSrc
//   })
// }
