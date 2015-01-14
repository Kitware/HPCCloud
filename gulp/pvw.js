var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'browser-sync', 'proxy']
    });

gulp.task('vtkweb-js', function () {
  return gulp.src(['assets/pvw/vtkweb-all.min.js', 'assets/pvw/*.js'])
    .pipe($.concat('vtk-web.js'))
    .pipe($.replace(/vtk-icon-bookmark-empty/g, 'fa-bookmark-o'))
    .pipe($.replace(/vtk-icon-bookmark/g, 'fa fa-fw fa-bookmark'))
    .pipe($.replace(/'-empty'/g, "'-o'"))
    .pipe($.replace(/<div class="pv-collapse-title pv-collapsable-action clickable"><span class="vtk-icon-plus-circled">NAME<\/span><\/div><div class="pv-no-collapse-title pv-collapsable-action clickable"><span class="vtk-icon-minus-circled pv-absolute-left">NAME<\/span>/g,
          '<div class="pv-collapse-title pv-collapsable-action clickable"><span class="fa fa-fw fa-plus-circle"></span>NAME</div><div class="pv-no-collapse-title pv-collapsable-action clickable"><span class="pv-absolute-left"><i class="fa fa-fw fa-minus-circle"></i>NAME</span>'))
    .pipe($.replace(/-circled/g, '-circle'))
    .pipe($.replace(/vtk-icon-cancel/g, 'fa fa-fw fa-close'))
    .pipe($.replace(/vtk-icon-cancel-circle/g, 'fa fa-fw fa-remove'))
    .pipe($.replace(/vtk-icon-doc/g, 'fa fa-fw fa-file-o'))
    .pipe($.replace(/vtk-icon-doc-text/g, 'fa fa-fw fa-file-text-o'))
    .pipe($.replace(/vtk-icon-folder-empty/g, 'fa fa-fw fa-folder-o'))
    .pipe($.replace(/vtk-icon-help-circle/g, 'fa fa-fw fa-info-circle'))
    .pipe($.replace(/vtk-icon-minus-circle/g, 'fa fa-fw fa-minus-circle'))
    .pipe($.replace(/vtk-icon-ok/g, 'fa fa-fw fa-check'))
    .pipe($.replace(/vtk-icon-ok-circle/g, 'fa fa-fw fa-check-circle-o'))
    .pipe($.replace(/vtk-icon-play/g, 'fa fa-fw fa-play'))
    .pipe($.replace(/vtk-icon-plus/g, 'fa fa-fw fa-plus'))
    .pipe($.replace(/vtk-icon-plus-circle/g, 'fa fa-fw fa-plus-circle'))
    .pipe($.replace(/vtk-icon-resize-horizontal-1/g, 'fa fa-fw fa-arrows-h'))
    .pipe($.replace(/vtk-icon-tools/g, 'fa fa-fw fa-plug'))
    .pipe($.replace(/vtk-icon-trash/g, 'fa fa-fw fa-trash-o'))
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(gulp.dest('dist/js'));
});
