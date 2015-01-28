var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    }),
    // through = require('through2'),
    // path = require('path'),
    templatizer = require('templatizer');

// function modify () {
//     function transform(file, enc, callback) {
//         if (!file.isBuffer()) {
//             this.push(file);
//             callback();
//             return;
//         }
//         var funcName = path.basename(file.path, '.js');
//         var from = 'function template(locals) {';
//         var to = 'templates.' + funcName + ' = function (locals) {';
//         var contents = file.contents.toString().replace(from, to);
//         file.contents = new Buffer(contents);
//         this.push(file);
//         callback();
//     }

//     return through.obj(transform);
// };

gulp.task('jade', function() {
    templatizer('./assets/workflows', './bower_components/jade-templates.js', { namespace: 'tpls' });
    return gulp.src('./bower_components/jade-templates.js')
        .pipe($.header('var tpls = {};'))
        .pipe($.concat('jade-templates.js'))
        .pipe(gulp.dest('./dist/js'))
});

// gulp.task('jade', function() {
//   return gulp.src('./assets/workflows/**/*.jade')
//     .pipe($.jade({client: true}))
//     .pipe($.browserify())
//     .pipe(modify())
//     .pipe($.header('var templates = {};'))
//     .pipe($.concat('jade-templates.js'))
//     .pipe(gulp.dest('./dist/js'))
// });
