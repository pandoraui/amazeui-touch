
var webpack = require('webpack')
// var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('vendors.js');

export default {
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  // devtool: 'inline-source-map',
  // devtool: 'cheap-module-eval-source-map',
  // debug: true,
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
  watch: false,
/*==============================================================================
  //var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

  //插件项
  //使用一个 CommonsChunkPlugin 插件，生成页面复用的公共文件
  plugins: [commonsPlugin],

  //页面入口文件配置
  entry: {
    page1 : './src/js/page/page1.js',
    //支持数组形式，将加载数组中的所有模块，但以最后一个模块作为输出
    page2: ["./entry1", "./entry2"]
  },

  //入口文件输出配置
  output: {
    path: 'dist/js/page',
    filename: '[name].bundle.js'
    //该段代码最终会生成一个 page1.bundle.js 和 page2.bundle.js，
    //并存放到 ./dist/js/page 文件夹下。
  },

  module: {
      //加载器配置 "-loader"其实是可以省略不写的，多个loader之间用“!”连接起来。
      loaders: [
        //.css 文件使用 style-loader 和 css-loader 来处理
        { test: /\.css$/, loader: 'style-loader!css-loader' },

        //.js 文件使用 jsx-loader 来编译处理
        { test: /\.js$/, loader: 'jsx-loader?harmony' },

        //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
        { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},

        //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
        { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
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
*/
};
