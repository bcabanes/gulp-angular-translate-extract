(function() {
    'use strict';

    var gulp = require('gulp');
    var angularTranslate = require('./');

    function extractTranslations() {
        return gulp.src('fixtures/fixture1.html')
            .pipe(angularTranslate('test.json', {
                lang: ['fr_FR', 'en_CA']
            }))
            .pipe(gulp.dest('dest'));
    }

    gulp.task('default', extractTranslations);

})();
