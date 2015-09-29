var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    }),
    quickLogin = ''; //require('require-dir')('./dev.js').quickLogin;


gulp.task('process-js', function() {
    return gulp.src(['src/modules/**/module.js', 'src/modules/**/*.js', 'assets/workflows/*/helper.js'])
        // .pipe($.debug({verbose: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.sourcemaps.init())
        .pipe($.concat('chpc-min.js'))
        // .pipe($.ngAnnotate())
        // .pipe($.uglify())
        // .pipe($.sourcemaps.write())
        .pipe(gulp.dest('dist/js'))
        .pipe($.size({title: "JS"}));
});

gulp.task('process-css', function() {
    return gulp.src(['src/modules/**/*.css','src/modules/**/*.styl'])
        // .pipe($.debug({verbose: true}))
        .pipe($.stylus())
        .pipe($.concat('chpc-min.css'))
        .pipe($.autoprefixer())
        .pipe($.csso())
        .pipe(gulp.dest('dist/css'))
        .pipe($.size({title: "CSS"}));
});

gulp.task('partials', function () {
  return gulp.src(['src/modules/**/tpls/**/*.html', 'assets/workflows/*/help/*', 'assets/workflows/*/tpls/*'])
    .pipe($.template({ quickLogin: quickLogin }))
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({
      moduleName: 'kitware.cmb.core.tpls'
    }))
    .pipe($.concat('chpc-tpl.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe($.size({title: "Partials"}));
});

gulp.task('html', ['process-css', 'process-js', 'partials', 'json', 'workflows', 'pvw', 'vtk-web'], function () {
    return gulp.src('src/index.html')
        .pipe($.minifyHtml({
          empty: true,
          spare: true,
          quotes: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('json', function () {
    return gulp.src('src/**/*.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('assets/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/assets/images'))
    .pipe($.size({title: "Images"}));
});

gulp.task('workflows', function () {
  return gulp.src('assets/workflows/**/*')
    .pipe(gulp.dest('dist/assets/wf'));
});

gulp.task('pvw', function () {
  return gulp.src('assets/ng-pvw/**/*')
    .pipe(gulp.dest('dist/assets/ng-pvw'));
});

gulp.task('vtk-web', function () {
  return gulp.src('assets/vtk-web/**/*')
    .pipe(gulp.dest('dist/assets/vtk-web'));
});