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
        nullEmpty = options.nullEmpty || false,
        namespace = options.namespace || false,
        prefix = options.prefix || '',
        safeMode = options.safeMode ? true : false,
        suffix = options.suffix || '.json',
        customRegex = _.isArray(options.customRegex) ? options.customRegex : [],
        stringify_options = options.stringifyOptions || null;

    var firstFile,
        results = {};


    function mergeTranslations(results, lang, target) {
        /**
         * Create translation object
         */
        var _translation = new Translations({
                "safeMode": safeMode,
                "tree": namespace,
                "nullEmpty": nullEmpty
            }, results),
            isDefaultLang = (defaultLang === lang),
            translations = {},
            json = {},
            stats, statsString;

            try {
                var data = fs.readFileSync(path.join(target, lang + '.json'));
                json = JSON.parse(data);
                translations = _translation.getMergedTranslations(Translations.flatten(json), isDefaultLang);
            }
            catch (err) {
                translations = _translation.getMergedTranslations({}, isDefaultLang);
            }

            stats = _translation.getStats();
            statsString = lang + " statistics: " +
                " Updated: " + stats.updated +
                " / Deleted: " + stats.deleted +
                " / New: " + stats.new;
            gutil.log(statsString);

            return translations;
    }

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
            translations = mergeTranslations(results, lang, firstFile.base);
            self.push(new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(firstFile.base, lang + '.json'),
                contents: new Buffer(Helpers.customStringify(translations))
            }));
        });

        callback();
    });
}

module.exports = angularTranslate;
