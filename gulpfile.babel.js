/**
 * Amaze UI Touch Building Tasks
 *
 * @author Minwe <minwe@yunshipei.com>
 */

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack-stream';
import named from 'vinyl-named';
import assign from 'object-assign';
import webpackConfig from './webpack.config';
import browserify from 'browserify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import merge from 'merge-stream';
import markedify from 'markedify';
import BS from 'browser-sync';
import pkg from './package.json';
import getMarked from './docs/_utils/getMarked';

const ENV = process.env.NODE_ENV;
const $ = gulpLoadPlugins();
const isProduction = ENV === 'production' || ENV === 'travisci';
const banner = `/** ${pkg.title} v${pkg.version} | by Amaze UI Team
  * (c) ${$.util.date(Date.now(), 'UTC:yyyy')} AllMobilize, Inc., Licensed under ${pkg.license}
  * ${$.util.date(Date.now(), 'isoDateTime')}
  */
  `;

const paths = {
  style: [
    'src/scss/amazeui.touch.scss'
  ],
  scssModules: 'src/scss/**/*.scss',
  fonts: 'src/fonts/*',
  // jsEntry: ['src/js/index.js'],
  jsEntry: 'src/js/index.js',
  dist: 'dist',
};

// const docsDir = 'docs/_app';
// const appPaths = {
//   js: `${docsDir}/js/app.js`,
//   styleDir: `${docsDir}/style`,
//   style: `${docsDir}/style/app.scss`,
//   dist: 'www',
//
//   ksEntry: 'kitchen-sink/app.js',
//   ksIndex: 'kitchen-sink/index.html',
//   ksDist: 'www/kitchen-sink',
//
//   appEntry: 'app/js/app.js',
//   appIndex: 'app/index.html',
//   appDist: 'www/app'
// };
var appDir = 'docs/_app';
var appPaths;
var resetPaths = function(dir, entryJs){
  entryJs = entryJs || 'app.js';
  appDir = dir || 'docs/_app';
  appPaths = {
    imgs: `${appDir}/i/*`,
    js: `${appDir}/js/app.js`,
    styleDir: `${appDir}/style`,
    style: [`${paths.style}`, `${appDir}/style/app.scss`],
    dist: dir ? `www/${appDir}` : 'www',

    appEntry: `${appDir}/js/${entryJs}`,
    appIndex: `${appDir}/index.html`,
    appDist: `www/${appDir}`
  }
  return appPaths;
}
resetPaths();


/*
// move to package.json
const babelOptions = {
  optional: ['es7.objectRestSpread'],
  plugins: ['object-assign'],
};*/

const autoprefixerOptions = {
  //FIXME Autoprefixer会分析CSS代码，并且根据Can I Use所提供的资料来决定要加上哪些浏览器前缀
  //browsers: ['> 1%', 'last 2 versions', 'ie 10']
  browsers : [
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 2.3',
    'bb >= 10'
  ]
};

const replaceVersion = function() {
  return $.replace('__VERSION__', pkg.version);
};

const addBanner = function() {
  return $.header(banner);
};

const buildBanner = function() {
  return $.header(`/*! Updated: ${$.util.date(Date.now(), 'isoDateTime')} */`);
};

gulp.task('clean', () => {
  return del(['dist', 'www', 'lib']);
});

gulp.task('clean:app', () => {
  console.log('Dir: ' + appDir);
  return del([appPaths.appDist]);
});

/**
 * Build Amaze UI Touch
 */

gulp.task('build:clean', () => {
  return del([paths.dist, 'lib']);
});

gulp.task('style:scss', () => {
  var options = appDir === 'docs/_app' ? paths : appPaths;
  //if(!options.style) return;
  return gulp.src(options.style)
    .pipe($.sass({
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerOptions))
    .pipe(addBanner())
    .pipe(gulp.dest(options.dist + '/css'))
    .pipe($.if(!isProduction, gulp.dest(appPaths.appDist + '/css')))
    .pipe($.csso())
    .pipe(addBanner())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(options.dist + '/css'))
    .pipe($.if(isProduction, gulp.dest(appPaths.appDist + '/css')));
});

gulp.task('style:fonts', () => {
  return gulp.src(paths.fonts)
    // .pipe(gulp.dest(paths.dist + '/css/fonts'))
    .pipe(gulp.dest(appPaths.appDist + '/css/fonts'));
});

gulp.task('copy:imgs', () => {
  return gulp.src(appPaths.imgs)
    // .pipe(gulp.dest(paths.dist + '/i'))
    .pipe(gulp.dest(appPaths.appDist + '/i'));
});

gulp.task('style:watch', () => {
  gulp.watch(paths.scssModules, ['style:scss']);
});

gulp.task('style', ['style:scss', 'style:fonts', 'copy:imgs']);
gulp.task('styleDev', ['style:scss', 'style:fonts', 'copy:imgs', 'style:watch']);

// transform ES6 & JSX
gulp.task('build:babel', () => {
  return gulp.src('src/js/**/*')
    .pipe(replaceVersion())
    .pipe($.babel())
    .pipe(gulp.dest('lib'));
});

// 由于 browserify-shim 打包 UMD 不会自动添加 CommonJS、AMD 依赖，
// 所以使用 webpack 打包。考虑将 browserify 的工作都转移到 webpack 以减少 npm 依赖数量。
gulp.task('build:pack', () => {
  return gulp.src(paths.jsEntry)
    // .pipe(named())
    .pipe(webpack(assign({},webpackConfig,{
      debug: !isProduction,
      entry: {
        //分开打包，需要指定文件分组，并且配置resolve解释依赖文件的位置
        'index': paths.jsEntry,
        'vendor': ['react', 'react-dom', 'redux', 'react-redux', 'redux-thunk', 'classnames'],  //这里可以结合智能提取公共脚本插件
      },
      output: {
        // library: 'AMUITouch',
        libraryTarget: 'umd',
        //path: path.join(__dirname, 'public/js/dest'),
        filename: '[name].bundle.js'
      },
      resolve: {
        extensions: ["", ".js", ".jsx", '.es6'],
        // 这里 root 指谁的跟，项目根目录？可以配置 path.join(__dirname, '/src/js') 吗
        root: path.join(__dirname, '/'),
        modulesDirectories: ["node_modules"]
      }
    })))
    .pipe(replaceVersion())
    .pipe(addBanner())
    // .pipe($.rename('amazeui.touch.js'))
    .pipe(gulp.dest(paths.dist))
    .pipe($.uglify())
    .pipe(addBanner())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build', (callback) => {
  runSequence(
    'build:clean',
    ['style', 'build:babel', 'build:pack',],
    callback
  );
});

gulp.task('html:replace', () => {
  const rFrom = '__ENV__';
  const rTo = isProduction ? '.min' : '';
  const replaceEnv = function(options) {
    return gulp.src(options.src)
      .pipe($.replace(rFrom, rTo))
      .pipe(gulp.dest(options.dist));
  };
  let app = replaceEnv({
    src: appPaths.appIndex,
    dist: appPaths.appDist,
  });

  return merge(app);
});

let bsf = (options) => {
  const babelify = ['babelify'];
  let transform = Array.isArray(options.transform) ?
    babelify.concat(options.transform) : babelify;

  return watchify(browserify({
    cache: {},
    packageCache: {},
    entries: options.entries,
    debug: !isProduction,
    transform: transform,
    // path map for fake `amazeui-touch` in `./kitchen-sink/`
    // @see https://github.com/vigetlabs/gulp-starter/issues/17
    paths: ['./'+ appDir +'/'],
  }));
};

let bundler = (options) => {
  let stream = (
    options.b.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(replaceVersion())
      .pipe($.if(!isProduction, gulp.dest(options.dist)))
      .pipe($.size({
        title: `[${options.title}]`,
        showFiles: true,
      }))
  );

  return !isProduction ? stream : stream.pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(buildBanner())
    .pipe(gulp.dest(options.dist))
    .pipe($.size({
      showFiles: true,
      title: `[${options.title}] - minified`,
    }))
    .pipe($.size({
      showFiles: true,
      gzip: true,
      title: `[${options.title}] - gzipped`,
    }));
};

// gulp.task('docs:js', () => {
//   const docBundle = bsf({
//     entries: [appPaths.js],
//     transform: [[markedify, {marked: getMarked()}], 'brfs']
//   });
//
//   const docsBundleOptions = {
//     title: 'Docs',
//     b: docBundle,
//     dist: appPaths.dist,
//   };
//
//   docBundle.on('update', bundler.bind(null, docsBundleOptions))
//     .on('log', $.util.log);
//
//   return bundler(docsBundleOptions);
// });

// kitchen-sink
// APP
gulp.task('app:build', () => {
  var appBundle = bsf({
    // vendors: [
    //   "react",
    //   "react-dom",
    //   "react-addons-css-transition-group",
    //   "react-router"
    // ],
    entries: appPaths.appEntry,
    // output: {
    //   path: 'www/app/js'
    // }
  });
  var appOptions = {
    title: 'App',
    b: appBundle,
    dist: appPaths.appDist + '/js',
  };

  appBundle.on('update', bundler.bind(null, appOptions))
    .on('log', $.util.log);

  return bundler(appOptions);
  //return bundler(docsBundleOptions);
});

gulp.task('docs:style', () => {
  let stream = gulp.src(appPaths.style)
    .pipe($.sass({
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerOptions));

  return !isProduction ? stream.pipe(gulp.dest(appPaths.dist)) :
    stream.pipe($.csso())
      .pipe(buildBanner())
      .pipe($.rename({suffix: '.min'}))
      .pipe(gulp.dest(appPaths.dist));
});

gulp.task('docs:replace', () => {
  const rFrom = '__ENV__';
  const rTo = isProduction ? '.min' : '';
  const replaceEnv = function(options) {
    return gulp.src(options.src)
      .pipe($.replace(rFrom, rTo))
      // replace stat code on dev
      .pipe($.replace(/<!--STAT_CODE_START-->(.+)<!--STAT_CODE_END-->/g,
        (match, $1) => {
        return isProduction ? $1 : '';
      }))
      .pipe(gulp.dest(options.dist));
  };
  let docs = replaceEnv({
    src: `${docsDir}/index.html`,
    dist: appPaths.dist,
  });
  let ks = replaceEnv({
    src: appPaths.appIndex,
    dist: appPaths.appDist,
  });

  return merge(docs, ks);
});

gulp.task('app:server', () => {
  let bs = BS.create();
  bs.init({
    server: [appPaths.appDist],
    open: 'external',
  });

  gulp.watch(`${appPaths.dist}/**/*`, bs.reload);
  gulp.watch(`${appPaths.styleDir}/*`, ['docs:style']);
});

gulp.task('docs', (callback) => {
  resetPaths('docs/_app');
  // runSequence('clean',
  //   ['styleDev', 'docs:style', 'docs:js', 'docs:replace', 'app:build'],
  //   'docs:server',
  //   callback);
  runSequence(
      'clean:app',
      ['styleDev', 'html:replace', 'build', 'app:build'],
      'app:server',
      callback);
});

gulp.task('default', ['ks']);

gulp.task('ks', (callback) => {
  resetPaths('kitchen-sink');

  runSequence(
    'clean:app',
    ['styleDev', 'html:replace', 'app:build'],
    'app:server',
    callback);
});

gulp.task('app', (callback) => {
  resetPaths('app');

  runSequence(
    'clean:app',
    ['styleDev', 'style', 'html:replace', 'app:build'],
    'app:server',
    callback);
});

gulp.task('dev', (callback) => {
  resetPaths('_app');

  runSequence(
    'clean:app',
    // ['styleDev', 'html:replace', 'app:build'],
    ['styleDev', 'html:replace', 'app:webpack'],
    'app:server',
    callback);
});


/**

npm install history humps isomorphic-fetch lodash normalizr react react-dom react-redux react-router redux redux-logger redux-router redux-thunk --save

npm install babel babel-core babel-loader concurrently babel-plugin-react-transform react-transform-hmr webpack webpack-dev-middleware webpack-hot-middleware --save-dev

npm install react-tools redux-devtools redux-devtools-dock-monitor redux-devtools-log-monitor --save-dev
*/

import startWebpackConfig from './start/webpack.config';
// import webpack2 from 'webpack';
// run webpack
gulp.task('app:webpack', (callback) => {
  //new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")

  // configuration
  // return webpack(assign({}, {    //webpackConfig
  //   // debug: !isProduction,
  //   //devtool: 'source-map',
  //   entry: {
  //     // 'path': path.join(__dirname, './start/js'),
  //     //分开打包，需要指定文件分组，并且配置resolve解释依赖文件的位置
  //     'index': './' + appPaths.appEntry,//'index.js',//appPaths.appEntry,
  //     // 'vendors': ['react', 'react-dom', 'redux', 'react-redux', 'redux-thunk', 'classnames'], //这里可以结合智能提取公共脚本插件
  //   },
  //
  //   output: {
  //     // library: 'AMUITouch',
  //     // libraryTarget: 'umd',
  //     // path: path.join(__dirname, '/dist/'),
  //     filename: '[name].bundle.js'
  //   },
  //   // 新添加的module属性
  //   module: {
  //     //加载器配置 "-loader"其实是可以省略不写的，多个loader之间用“!”连接起来。
  //     loaders: [
  //       //.css 文件使用 style-loader 和 css-loader 来处理
  //       // { test: /\.css$/, loader: 'style-loader!css-loader' },
  //
  //       //.js 文件使用 jsx-loader 来编译处理
  //       { test: /\.js$/, exclude: /node_modules/, loader: 'babel!babel-loader' },  //loader: "babel"
  //       // { test: /\.js$/, exclude: /node_modules/, loader: 'babel!jsx-loader?harmony' },  //loader: "babel"
  //       // { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },  //loader: "babel"
  //
  //       //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
  //       // { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
  //
  //       //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
  //       // { test: /\.(png|jpg|svg)$/, loader: 'url-loader?limit=8192'}
  //       //配置信息的参数“?limit=8192”表示将所有小于8kb的图片都转为base64形式（其实应该说超过8kb的才使用 url-loader 来映射到文件，否则转为data url形式）。
  //     ]
  //   },
  //   //其它解决方案配置
  //   resolve: {
  //     //查找module的话从这里开始查找
  //     // root: 'E:/github/flux-example/src', //绝对路径
  //     // 这里 root 指谁的根，项目根目录？可以配置 path.join(__dirname, '/src/js') 吗
  //     // root: path.join(__dirname, 'node_modules'),
  //     // root: [process.cwd() + '/node_modules'],
  //     // modulesDirectories: ["node_modules"],
  //
  //     //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
  //     extensions: ['', '.js', '.json', '.jsx'],
  //     // extensions: ['', '.js', '.json', '.jsx', ,'.es6', '.scss'],
  //
  //     //模块别名定义，方便后续直接引用别名，无须多写长长的地址
  //     // alias: {
  //     //   babel_polyfill : './babel/dist/polyfill',//后续直接 require('AppStore') 即可
  //     //   // ActionType : 'js/actions/ActionType.js',
  //     //   // AppAction : 'js/actions/AppAction.js'
  //     // }
  //   }
  // }), function(err, stats) {
  //     // if(err) throw new  $.util.PluginError("webpack", err);
  //     $.util.log("[webpack]", stats.toString({
  //         // output options
  //     }));
  //     callback();
  // });


  return gulp.src(appPaths.appEntry)
    // .pipe(named())
    // .pipe(source())
    // .pipe(buffer())
    .pipe(webpack(assign({}, startWebpackConfig, {  //startWebpackConfig
      // debug: !isProduction,
      entry: {
        // 'path': path.join(__dirname, './start/js'),
        //分开打包，需要指定文件分组，并且配置resolve解释依赖文件的位置
        'index': './' + appPaths.appEntry,//'index.js',//appPaths.appEntry,
        'vendor': ['react', 'react-dom', 'redux', 'react-redux', 'redux-thunk', 'classnames'], //这里可以结合智能提取公共脚本插件
      },
      output: {
        filename: '[name].bundle.js'
      },
    })))
    // .pipe(replaceVersion())
    // .pipe(addBanner())
    // .pipe($.rename('app.js'))
    .pipe(gulp.dest(appPaths.appDist + '/js'))
    .pipe($.uglify())
    // .pipe(addBanner())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(appPaths.appDist + '/js'));

});

gulp.task('start', (callback) => {
  resetPaths('start', 'index.js');

  runSequence(
    'clean:app',
    // ['styleDev', 'html:replace', 'app:build'],
    ['html:replace', 'app:webpack'],
    'app:server',
    callback);
});


/**
// 上传七牛cdn
var qn = require('gulp-qn');
var qiniu = {
  accessKey: '6sBCo463jJOCnBIYX__uy9avZ7C2hj_MHb-ffKAr',
  secretKey: '3vPk7fB0HcwL5V9E2AErHuR19HM389eYqdvQcncL',
  bucket: 'xdemo',
  domain: 'http://7xik9a.com1.z0.glb.clouddn.com'
};

//某任务中插入即可
.pipe(qn({
  qiniu: qiniu,
  prefix: 'gmap'
}))


// 可以在后面输入环境参数 如： gulp build -e production
// 参看 http://keenwon.com/1496.html 以及 https://github.com/keenwon/fede2
var argv = require('optimist').argv,
*/
