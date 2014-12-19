var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    }),
    quickLogin = '';

gulp.task('build-dev', ['dev', 'build']);

function fillQuickLogin(user, passwd) {
    quickLogin += '<i class="fa fa-child clickable green" ng-click="login(USER, PASS)"></i>'
        .replace(/USER/g, "'" + user + "'")
        .replace(/PASS/g, "'" + passwd + "'");
}

gulp.task('dev', function() {
    quickLogin = '';
    fillQuickLogin('user001', 'user001001');
    fillQuickLogin('user002', 'user002002');
    fillQuickLogin('user003', 'user003003');
});

gulp.task('watch', ['build'] ,function () {
  gulp.watch('src/**/*', ['jade','html', $.browserSync.reload]);
  gulp.watch('src/assets/images/**/*', ['images', $.browserSync.reload]);
  gulp.watch('bower.json', ['bower-js', 'bower-css', 'bower-fonts', $.browserSync.reload]);
});

gulp.task('watch-dev', ['dev', 'build'] ,function () {
  gulp.watch('src/**/*', ['jade', 'html', $.browserSync.reload]);
  gulp.watch('src/assets/images/**/*', ['images', $.browserSync.reload]);
  gulp.watch('bower.json', ['bower-js', 'bower-css', 'bower-fonts', $.browserSync.reload]);
});

gulp.task('serve', ['watch'], function() {
    $.browserSync({
        server: {
            baseDir: "./dist"
        },
        notify: false
    });
});

gulp.task('serve-dev', ['watch-dev'], function() {
    $.browserSync({
        server: {
            baseDir: "./dist"
        },
        notify: false
    });
});
