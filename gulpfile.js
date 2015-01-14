'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'del']
    }),
    dir = require('require-dir')('./gulp');

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('build', ['jade', 'html', 'images', 'bower-fonts', 'bower-js','ext-js', 'bower-css']);

gulp.task('clean', function (cb) {
    return $.del(['dist'], cb);
});

gulp.task('help', $.taskListing);


