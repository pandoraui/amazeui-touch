/**
 * Amaze UI Touch Building Tasks
 *
 * @author Minwe <minwe@yunshipei.com>
 */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import webpack from 'webpack-stream';
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
var resetPaths = function(dir){
  appDir = dir || 'docs/_app';
  appPaths = {
    imgs: `${appDir}/i/*`,
    js: `${appDir}/js/app.js`,
    styleDir: `${appDir}/style`,
    style: [`${paths.style}`, `${appDir}/style/app.scss`],
    dist: dir ? `www/${appDir}` : 'www',

    appEntry: `${appDir}/js/app.js`,
    appIndex: `${appDir}/index.html`,
    appDist: `www/${appDir}`
  }
  return appPaths;
}
resetPaths('_app');


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
    .pipe(webpack(webpackConfig))
    .pipe(replaceVersion())
    .pipe(addBanner())
    .pipe($.rename('amazeui.touch.js'))
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
    entries: [appPaths.appEntry],
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
  let stream = gulp.src(docsPaths.style)
    .pipe($.sass({
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerOptions));

  return !isProduction ? stream.pipe(gulp.dest(docsPaths.dist)) :
    stream.pipe($.csso())
      .pipe(buildBanner())
      .pipe($.rename({suffix: '.min'}))
      .pipe(gulp.dest(docsPaths.dist));
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
    dist: docsPaths.dist,
  });
  let ks = replaceEnv({
    src: docsPaths.ksIndex,
    dist: docsPaths.ksDist,
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

// gulp.task('docs', (callback) => {
//   runSequence('docs:clean',
//     ['styleDev', 'docs:style', 'docs:js', 'docs:replace', 'ks:build'],
//     'docs:server',
//     callback);
// });

// gulp.task('default', ['docs']);

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
    ['styleDev', 'html:replace', 'app:build'],
    'app:server',
    callback);
});
