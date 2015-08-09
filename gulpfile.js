(function() {
    'use strict';

    var gulp = require('gulp');
    var angularTranslate = require('./');

    function extractTranslations() {
        return gulp.src('fixtures/*.html')
            .pipe(angularTranslate({
                lang: ['fr_FR', 'en_CA'],
                // suffix: '.json'
                // prefix: 'project_'
                // defaultLang: 'en_CA'
                // interpolation: {
                //     startDelimiter: '[[',
                //     endDelimiter: ']]'
                // }
                // namespace: true,
                // stringifyOptions: true,
                // nullEmpty: true
                // dest: './destinationTest'
            }))
            .pipe(gulp.dest('dest'));
    }

    gulp.task('default', extractTranslations);

})();
