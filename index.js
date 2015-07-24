'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var gutil = require('gulp-util');
var path = require('path');
var stringify = require('json-stable-stringify');
var through = require('through2');

/**
 * Interns
 */
var ExtractTranslations = require('./modules/extractTranslations.js');
var Helpers = require('./modules/helpers');
var Translations = require('./modules/translations');

/**
 * Constants
 */
const PLUGIN_NAME = 'gulp-angular-translate';

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
    var defaultLang = options.defaultLang || '.',
        // interpolation = options.interpolation || {startDelimiter: '{{', endDelimiter: '}}'},
        nullEmpty = options.nullEmpty || false,
        namespace = options.namespace || false,
        prefix = options.prefix || '',
        safeMode = options.safeMode ? true : false,
        suffix = options.suffix || '.json',
        customRegex = _.isArray(options.customRegex) ? options.customRegex : [],
        stringify_options = options.stringifyOptions || null;

    var firstFile,
        results = {};

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
            var extract = new ExtractTranslations(options.interpolation, customRegex, content);
            results = extract.process();

            /**
             * Create translation object
             */
            var _translation = new Translations({
                "safeMode": safeMode,
                "tree": namespace,
                "nullEmpty": nullEmpty
                }, results);

            /**
             * Gather translations
             */
            results = _translation;
        }

        callback(null, file);
    }, function (cb) {
        var self = this;

        if (!firstFile) {
            cb();
            return;
        }

        options.lang.forEach(function (lang) {
            self.push(new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(firstFile.base, lang + '.json'),
                contents: new Buffer(JSON.stringify(results, null, 4))
            }));
        });

        cb();
    });
}

module.exports = angularTranslate;
