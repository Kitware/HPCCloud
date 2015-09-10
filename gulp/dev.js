var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    });


gulp.task('watch', ['build'] ,function () {
  gulp.watch('src/**/*', ['jade','html', $.browserSync.reload]);
  gulp.watch('assets/**/*.js', ['html', $.browserSync.reload]);
  gulp.watch('assets/**/*.html', ['html', $.browserSync.reload]);
  gulp.watch('src/assets/images/**/*', ['images', $.browserSync.reload]);
  gulp.watch('bower.json', ['bower-js', 'bower-css', 'bower-fonts', $.browserSync.reload]);
});

// no browser-sync
gulp.task('watch-simple', ['build'] ,function () {
  gulp.watch('src/**/*', ['jade','html']);
  gulp.watch('assets/**/*.js', ['html']);
  gulp.watch('assets/**/*.html', ['html']);
  gulp.watch('src/assets/images/**/*', ['images']);
  gulp.watch('bower.json', ['bower-js', 'bower-css', 'bower-fonts']);
});

gulp.task('serve', ['watch'], function() {
    $.browserSync({
        server: {
            baseDir: "./dist"
        },
        notify: false
    });
});
