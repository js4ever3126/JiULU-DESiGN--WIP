var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var autoprefixer = require('autoprefixer');
var minimist = require('minimist');
var browserSync = require('browser-sync').create()
var fileinclude = require('gulp-file-include')

var envOptions = {
    string: 'env',
    default: {env: 'develop'}
}

var options = minimist(process.argv.slice(2), envOptions)
console.log(options)



gulp.task('fileinclude', function() {
  gulp.src(['./source/*.html'])
      .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
      }))
      .pipe(gulp.dest('./public/'));
})

gulp.task('jade', function() {
    gulp.src('./source/**/*.jade')
      .pipe($.jade({
          pretty: true
      }))
      .pipe(gulp.dest('./public/'))
      .pipe(browserSync.stream())
})

gulp.task('sass', function() {
      return gulp.src('./source/sass/**/*.scss')
      .pipe($.sourcemaps.init())
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.postcss([autoprefixer()]))
      .pipe($.if(options.env === 'production', $.cleanCss()))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./public/css'))
      .pipe(browserSync.stream())
})

gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if(options.env === 'production', $.uglify({
            compress: {
                drop_console: true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream())
)

gulp.task('img', function() {
    gulp.src('./source/img/**/*.*').pipe(gulp.dest('./public/img'));
})

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
           baseDir: "./public",
           index: "./index.html"
        }
    })
})

gulp.task('watch', function () {
    gulp.watch('./source/sass/**/*.scss', ['sass'])
    gulp.watch('./source/**/*.jade',['jade'])
    gulp.watch('./source/js/**/*.js', ['babel'])
})

gulp.task('default', ['fileinclude', 'jade', 'sass', 'babel', 'img', 'browser-sync', 'watch'])