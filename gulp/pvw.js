var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    });

gulp.task('vtkweb-js', function () {
  return gulp.src(['assets/pvw/vtkweb-all.min.js', 'assets/pvw/*.js'])
    .pipe($.concat('vtk-web.js'))
    .pipe($.replace(/vtk-icon-bookmark-empty/g, 'fa-bookmark-o'))
    .pipe($.replace(/vtk-icon-bookmark/g, 'fa fa-bookmark'))
    .pipe($.replace(/'-empty'/g, "'-o'"))
    .pipe($.replace(/<div class="pv-collapse-title pv-collapsable-action clickable"><span class="vtk-icon-plus-circled">NAME<\/span><\/div><div class="pv-no-collapse-title pv-collapsable-action clickable"><span class="vtk-icon-minus-circled pv-absolute-left">NAME<\/span>/g,
          '<div class="pv-collapse-title pv-collapsable-action clickable"><span class="fa fa-fw fa-plus-circle"></span>NAME</div><div class="pv-no-collapse-title pv-collapsable-action clickable"><span class="pv-absolute-left"><i class="fa fa-fw fa-minus-circle"></i>NAME</span>'))
    .pipe($.replace(/-circled/g, '-circle'))
    .pipe($.replace(/vtk-icon-cancel/g, 'fa fa-close'))
    .pipe($.replace(/vtk-icon-cancel-circle/g, 'fa fa-remove'))
    .pipe($.replace(/vtk-icon-doc/g, 'fa fa-file-o'))
    .pipe($.replace(/vtk-icon-doc-text/g, 'fa fa-file-text-o'))
    .pipe($.replace(/vtk-icon-folder-empty/g, 'fa fa-folder-o'))
    .pipe($.replace(/vtk-icon-help-circle/g, 'fa fa-info-circle'))
    .pipe($.replace(/vtk-icon-minus-circle/g, 'fa fa-minus-circle'))
    .pipe($.replace(/vtk-icon-ok/g, 'fa fa-check'))
    .pipe($.replace(/vtk-icon-ok-circle/g, 'fa fa-check-circle-o'))
    .pipe($.replace(/vtk-icon-play/g, 'fa fa-play'))
    .pipe($.replace(/vtk-icon-plus/g, 'fa fa-plus'))
    .pipe($.replace(/vtk-icon-plus-circle/g, 'fa fa-plus-circle'))
    .pipe($.replace(/vtk-icon-resize-horizontal-1/g, 'fa fa-arrows-h'))
    .pipe($.replace(/vtk-icon-tools/g, 'fa fa-plug'))
    .pipe($.replace(/vtk-icon-trash/g, 'fa fa-trash-o'))
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(gulp.dest('dist/js'));
});
