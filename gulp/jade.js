var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    }),
    through = require('through2'),
    path = require('path');

function modify () {
    function transform(file, enc, callback) {
        if (!file.isBuffer()) {
            this.push(file);
            callback();
            return;
        }
        var funcName = path.basename(file.path, '.js');
        var from = 'function template(locals) {';
        var to = 'templates.' + funcName + ' = function (locals) {';
        var contents = file.contents.toString().replace(from, to);
        file.contents = new Buffer(contents);
        this.push(file);
        callback();
    }

    return through.obj(transform);
};

gulp.task('jade', function() {
  return gulp.src('./src/**/*.jade')
    .pipe($.jade({client: true}))
    .pipe(modify())
    .pipe($.header('var templates = {}, jade = { escape: function(obj) { return obj; }};'))
    .pipe($.concat('jade-templates.js'))
    .pipe(gulp.dest('./dist/js'))
});
