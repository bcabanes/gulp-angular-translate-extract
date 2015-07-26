'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var stringify = require('json-stable-stringify');
var through = require('through2');

/**
 * Interns
 */
var ExtractTranslations = require('./modules/extractTranslations');
var Helpers = require('./modules/helpers');
var MergeTranslations = require('./modules/mergeTranslations');
var Translations = require('./modules/translations');

/**
 * Constants
 */
var PLUGIN_NAME = 'gulp-angular-translate-extract';

/**
 * Angular Translate
 * @param  {object} options  AngularTranslate's options
 */
function angularTranslate (options) {
    options = options || {};

    /**
     * Check lang parameter.
     */
    if (!_.isArray(options.lang) || !options.lang.length) {
        throw new gutil.PluginError(PLUGIN_NAME,
            chalk.red('Param lang required'));
    }

    /**
     * Set all needed variables
     */
    var destinationPath = options.dest || './i18nextract',
        firstFile,
        prefix = options.prefix || '',
        results = {},
        suffix = options.suffix || '.json';

    /**
     * Prepare merge process
     */
    var merge = new MergeTranslations(options);

    /**
     * Gulp Angular Translate start processing
     */
    return through.obj(function (file, enc, callback) {

        if (file.isStream()) {
            throw new gutil.PluginError(PLUGIN_NAME,
                chalk.red('Straming not supported.'));
		}

        if (file.isNull()) {
            // Return empty file.
            return callback(null, file);
        }

        if (!firstFile) {
            firstFile = file;
        }

        if (file.isBuffer()) {
            /**
             * Start extraction of translations
             */
            var content = file.contents.toString();
            var extract = new ExtractTranslations(options, content);
            _.assign(results, extract.process());
        }

        callback();
    }, function (callback) {
        var self = this;

        if (!firstFile) {
            callback();
            return;
        }

        var translations = {};
        options.lang.forEach(function (lang) {
            translations = merge.process(results, lang);
            self.push(new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(destinationPath, prefix + lang + suffix),
                contents: new Buffer(Helpers.customStringify(translations, options.stringifyOptions))
            }));
        });

        callback();
    });
}

module.exports = angularTranslate;
