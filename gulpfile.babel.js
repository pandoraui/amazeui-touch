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

import through from 'through2';

const ENV = process.env.NODE_ENV;
const $ = gulpLoadPlugins();
const isProduction = ENV === 'production' || ENV === 'travisci';
const banner = `/** ${pkg.title} v${pkg.version} | by Cloud Team
  * (c) ${$.util.date(Date.now(), 'UTC:yyyy')} Thinker, Inc., Licensed under ${pkg.license}
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
    quoteSrc: `src`,
    quoteStyles: `src/styles/quote.scss`,
    quotePage: `${appDir}/index.html`,
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

gulp.task('watch', () => {
  // gulp.watch( appDir + '**/*.js', ['app:webpack']);
  gulp.watch( appDir + '/*.html', ['html:replace']);
  gulp.watch( appDir + '/style/*.scss', ['styleDev']);
});

gulp.task('watch:webpack', () => {
  // gulp.watch( appDir + '**/*.js', ['app:webpack']);
  gulp.watch( appDir + '/js/**/*.js', ['app:webpack']);
});

gulp.task('app:server', ['watch'], () => {
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
    'quote:styles',
    ['styleDev', 'html:replace', 'app:build'],
    'watch:quote:styles',
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
    ['styleDev', 'html:replace', 'app:build'],
    // ['styleDev', 'html:replace', 'app:webpack'],
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
  return gulp.src(appPaths.appEntry)

    .pipe(webpack(assign({}, startWebpackConfig, {  //startWebpackConfig
      debug: true,//!isProduction,
      entry: {
        // watch: true,
        devtool: 'source-map', //生成sourcemap,便于开发调试
        // 'path': path.join(__dirname, './start/js'),
        //分开打包，需要指定文件分组，并且配置resolve解释依赖文件的位置
        'index': './' + appPaths.appEntry,//'index.js',//appPaths.appEntry,
        'vendor': ['react', 'react-dom', 'redux', 'react-redux', 'redux-thunk', 'classnames'], //这里可以结合智能提取公共脚本插件
      },
      output: {
        filename: '[name].bundle.js'
      },
    })))
    .pipe($.sourcemaps.init({loadMaps: true}))
    // .pipe(replaceVersion())
    // .pipe(addBanner())
    // .pipe($.rename('app.js'))
    .pipe(through.obj(function (file, enc, cb) {
      // Dont pipe through any source map files as it will be handled
      // by gulp-sourcemaps
      var isSourceMap = /\.map$/.test(file.path);
      if (!isSourceMap) this.push(file);
      cb();
    }))
    .pipe($.sourcemaps.write())
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
    'quote:styles',
    // ['styleDev', 'html:replace', 'app:webpack'],
    ['styleDev', 'html:replace', 'app:build'],
    // 'watch:webpack',
    // 'watch:quote',
    'app:server',
    callback);
});







// 编译 SCSS，添加浏览器前缀
// 要配置 autoprefixerOptions
gulp.task('quote:styles', function () {
  var s = (
    gulp.src(appPaths.quoteStyles)
    .pipe($.rename('smacss.css'))
    .pipe($.sourcemaps.init())
    //.pipe($.plumber())  //自动处理全部错误信息防止因为错误而导致 watch 不正常工作
    .pipe($.sass())
    .pipe($.autoprefixer(autoprefixerOptions))
    .pipe($.sourcemaps.write())

    .pipe(gulp.dest(appPaths.appDist + '/css'))
  );
  return !isProduction ? s : s.pipe($.csso())
    .pipe($.rename({suffix: '.min'}))
    .pipe(md5(10, appPaths.quotePage))
    .pipe(gulp.dest(appPaths.appDist + '/css'))
    .pipe($.size({title: 'styles'}));
});
gulp.task('watch:quote:styles', () => {
  // gulp.watch( appDir + '**/*.js', ['app:webpack']);
  gulp.watch( appPaths.quoteSrc + '/styles/**/*.scss', ['quote:styles']);
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
