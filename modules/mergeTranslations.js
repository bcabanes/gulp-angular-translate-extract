'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var flatten = require('flat');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var stringify = require('json-stable-stringify');

/**
 * Interns
 */
var Translations = require('./translations');

function MergeTranslations(options) {
    /* jshint validthis: true */
    this.defaultLang = options.defaultLang || '.';
    this.destinationPath = options.dest || './i18nextract';
    this.json = {};
    this.nullEmpty = options.nullEmpty || false;
    this.prefix = options.prefix || '';
    this.safeMode = !!options.safeMode;
    this.suffix = options.suffix || '.json';
    this.translations = {};
    this.tree = options.namespace || false;
    this.verbose = options.verbose || false;
}

MergeTranslations.prototype.process = function(results, lang) {
    /**
     * Create translation object.
     */
    var _translation = new Translations({
            safeMode: this.safeMode,
            tree: this.tree,
            nullEmpty: this.nullEmpty
        }, results);

    /**
     * Default language test
     */
    this.isDefaultLang = (this.defaultLang === lang);

    try {
        var data = fs
            .readFileSync(path.join(this.destinationPath,
                                    this.prefix + lang + this.suffix), 'utf-8');
        this.json = flatten(JSON.parse(String(data).trim()));
        this.translations = _translation
            .getMergedTranslations(this.json, this.isDefaultLang);
    }
    catch (error) {
        this.translations = _translation
            .getMergedTranslations({}, this.isDefaultLang);
    }

    if (this.verbose) {
        this.logStatistics(_translation.getStats(), lang);
    }
    return this.translations;
};

MergeTranslations.prototype.logStatistics = function (statistics, lang) {
    var log = [
        lang + ' statistics: ',
        ' Updated: ' + statistics.updated,
        ' / Deleted: ' + statistics.deleted,
        ' / New: ' + statistics.new
    ];

    gutil.log(chalk.blue(log.join('')));
};

module.exports = MergeTranslations;
