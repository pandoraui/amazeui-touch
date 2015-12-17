// var path = require('path')
// var webpack = require('webpack')

export default {
  // devtool: 'inline-source-map', //devtool: 'source-map'
  // devtool: 'cheap-module-eval-source-map',
  // debug: true,
  watch: false,
  // plugins: [
  //   new webpack.optimize.OccurenceOrderPlugin(),
  //   new webpack.HotModuleReplacementPlugin(),
  //   new webpack.NoErrorsPlugin()
  // ],
  // entry: {
  //   'index': 'index',
  //   'vendor': ['react', 'redux', 'react-redux', 'classnames', 'whatwg-fetch']
  // },
  // output: {
  //   //path: path.join(__dirname, 'public/js/dest'),
  //   filename: '[name].bundle.js'
  // },
  // plugins: [
  //   new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
  // ],
  output: {
    library: 'AMUITouch',
    libraryTarget: 'umd'
  },
  externals: [
    {
      'react': {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      }
    },
    {
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      }
    },
    {
      'react-addons-css-transition-group': {
        root: 'React.addons.CSSTransitionGroup',
        commonjs2: 'react-addons-css-transition-group',
        commonjs: 'react-addons-css-transition-group',
        amd: 'react-addons-css-transition-group'
      }
    }
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        // move to package.json
        query: {
          // stage: 0,
          // loose: "all",
          // optional: ['es7.objectRestSpread'],
          // plugins: ['object-assign'],
        }
      }
    ]
  },
/*==============================================================================
  //参看： http://www.tuicool.com/articles/2qiE7jN
          https://github.com/Lucifier129/Isomorphism-react-todomvc/blob/master/webpack.config.js

  //plugins 是插件项，这里我们使用了一个 CommonsChunkPlugin 的插件，它用于提取多个入口文件的公共脚本部分，然后生成一个 common.js 来方便多页面之间进行复用。
  //new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
  //var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js'),

  //独立出css样式
  //如果我们希望样式通过 <link> 引入，而不是放在 <style> 标签内呢，即使这样做会多一个请求。
  //配合以下插件
  //var ExtractTextPlugin = require("extract-text-webpack-plugin");
  //此时要 {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common.js'),   //智能提取公共部分
    new ExtractTextPlugin("[name].css")
  ],

  //页面入口文件配置
  entry: {
    page1 : './src/js/page/page1.js',
    //支持数组形式，将加载数组中的所有模块，但以最后一个模块作为输出
    page2: ["./entry1", "./entry2"],
    'vendor': ['react', 'redux', 'react-redux', 'classnames'],

    //??? 疑问，这里要自己配置公共依赖，觉得commonsPlugin智能提取更好？？？
  },

  //打包输出配置
  output: {
    path: 'dist/js/page',  //打包输出的路径，也可以 path.join(__dirname, 'out'),
    filename: '[name].bundle.js',
    publicPath: "./out/"   //html引用路径，在这里是本地地址
    //该段代码最终会生成一个 page1.bundle.js page2.bundle.js 和 vendor.bundle.js，
    //并存放到 ./dist/js/page 文件夹下。
  },

  // 新添加的module属性
  module: {
      //加载器配置 "-loader"其实是可以省略不写的，多个loader之间用“!”连接起来。
      loaders: [
        //.css 文件使用 style-loader 和 css-loader 来处理
        { test: /\.css$/, loader: 'style-loader!css-loader' },

        //.js 文件使用 jsx-loader 来编译处理
        { test: /\.js$/, loader: 'jsx-loader?harmony' },  //loader: "babel"

        //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
        { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},

        //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
        { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=8192'}
        //配置信息的参数“?limit=8192”表示将所有小于8kb的图片都转为base64形式（其实应该说超过8kb的才使用 url-loader 来映射到文件，否则转为data url形式）。
      ]
  },

  //其它解决方案配置
  resolve: {
    //查找module的话从这里开始查找
    root: 'E:/github/flux-example/src', //绝对路径

    //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
    extensions: ['', '.js', '.json', '.scss'],

    //模块别名定义，方便后续直接引用别名，无须多写长长的地址
    alias: {
      AppStore : 'js/stores/AppStores.js',//后续直接 require('AppStore') 即可
      ActionType : 'js/actions/ActionType.js',
      AppAction : 'js/actions/AppAction.js'
    }
  }



  // webpack 命令行的几种基本命令

$ webpack // 最基本的启动webpack方法
$ webpack -w // 提供watch方法，实时进行打包更新
$ webpack -p // 对打包后的文件进行压缩，提供production
$ webpack -d // 提供source map，方便调试。

*/
};
