var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var merge = require('merge-stream');

gulp.task('templates:watch', ['scripts:concat'], function () {
    gulp.watch('./src/**/*.html', ['scripts:concat']);
});

gulp.task('scripts:concat', function() {
    var stream1 = gulp.src([
        './src/index.js',
        './src/services/**/*.js',
        './src/directives/**/*.js'
    ]);
    
    var stream2 = gulp.src('./src/**/*.html')
        .pipe(templateCache({
            module: 'cd'
        }));
        
    merge(stream1, stream2)
        .pipe(concat('cd.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('scripts:watch', ['scripts:concat'], function () {
    gulp.watch('./src/**/*.js', ['scripts:concat']);
});

gulp.task('sass:build', function () {
    return gulp.src('./src/sass/cd.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/'));
});

gulp.task('sass:watch', ['sass:build'], function () {
    gulp.watch('./src/sass/**/*.scss', ['sass:build']);
});

gulp.task('build', [
    'sass:build',
    'scripts:concat'
]);

gulp.task('watch', [
    'sass:watch',
    'scripts:watch'
]);