/// <binding ProjectOpened='sass-watch' />

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cssMin = require('gulp-cssmin'),
    templateCache = require('gulp-angular-templatecache'),
    preprocess = require('gulp-preprocess'),
    include = require('gulp-include'),
    jscs = require('gulp-jscs'),
    jshint = require("gulp-jshint");

var options = {
    sass: {
        src: 'src/twrDatetimePicker.scss',
        output: 'twrDatetimePicker.css',
        outputMin: 'twrDatetimePicker.min.css',
        dest: 'dist'
    },
    js: {
        files: ['src/twrDatetimePicker.js'],
        output: 'twrDatetimePicker.js',
        outputMin: 'twrDatetimePicker.min.js',
        dest: 'dist'
    },
    template: {
        files: ['src/twrDatetimePicker.html'],
        options: {
            module: 'twrDatetimePicker'
        },
        dest: 'src'
    }
}


gulp.task('default', ['sass', 'build-javaScript']);

gulp.task('_jscsReport', function () {
    return gulp.src(options.js.files)
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('_jsHintReport', function () {
    return gulp.src(options.js.files)
        .pipe(jshint())
        .pipe(jshint.reporter());
})

gulp.task('templateCache', function () {
    return gulp.src(options.template.files)
        .pipe(templateCache(options.template.options))
        .pipe(gulp.dest(options.template.dest));
});

gulp.task('build-javaScript', ['templateCache'], function () {
    return gulp.src(options.js.files)
        .pipe(include())
        .pipe(preprocess())
        .pipe(concat(options.js.output))
        .pipe(gulp.dest(options.js.dest))
        .pipe(uglify())
        .pipe(concat(options.js.outputMin))
        .pipe(gulp.dest(options.js.dest));
});

gulp.task('sass', function () {
    return gulp.src(options.sass.src)
        .pipe(sass({
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(concat(options.sass.output))
        .pipe(gulp.dest(options.sass.dest))
        .pipe(concat(options.sass.outputMin))
        .pipe(cssMin({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest(options.sass.dest));
});


gulp.task("sass-watch", function () {
    gulp.watch(options.sass.src, ['sass']);
});