(function() {
    'use strict';

    var gulp = require('gulp');
    var angularTranslate = require('./');

    function extractTranslations() {
        return gulp.src('fixtures/*.html')
            .pipe(angularTranslate({
                lang: ['fr_FR', 'en_CA']
            }))
            .pipe(gulp.dest('dest'));
    }

    gulp.task('default', extractTranslations);

})();
