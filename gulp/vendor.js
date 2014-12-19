var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    });

gulp.task('bower-fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: "Bower fonts"}));
});

gulp.task('bower-css', function () {
  return gulp.src($.mainBowerFiles())
    // .pipe($.debug({verbose: true}))
    .pipe($.filter('**/*.css'))
    // .pipe($.flatten())
    .pipe($.autoprefixer())
    .pipe($.csso())
    .pipe($.concat('vendors.css'))
    // .pipe($.rev())
    .pipe(gulp.dest('dist/css'))
    .pipe($.size({title: "Bower css"}));
});

gulp.task('bower-js', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.js'))
    // .pipe($.debug({verbose: true}))
    // .pipe($.flatten())
    .pipe($.concat('vendors.js'))
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    // .pipe($.rev())
    .pipe($.size({title: "Bower js"}))
    .pipe(gulp.dest('dist/js'))
    // .pipe(assetMapping = $.rev.manifest())
    ;
});
