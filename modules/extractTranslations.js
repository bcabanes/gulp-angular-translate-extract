'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var gutil = require('gulp-util');

/**
 * Interns
 */
var Helpers = require('./helpers.js');

/**
 * Constants
 */
var PLUGIN_NAME = 'gulp-angular-translate-extract';

function ExtractTranslations (options, content) {
    /* jshint validthis: true */
    var self = this;
    this.content = content;
    this.customRegex = options.customRegex || {};
    this.interpolation = options.interpolation || {
        startDelimiter: '{{',
        endDelimiter: '}}'
    };
    this.namespace = (options.namespace) ? options.namespace : false;
    this.verbose = (options.verbose) ? options.verbose : false;

    // Regexs that will be executed on files
    this.regexs = {
        commentSimpleQuote: '\\/\\*\\s*i18nextract\\s*\\*\\/\'((?:\\\\.|[^\'\\\\])*)\'',
        commentDoubleQuote: '\\/\\*\\s*i18nextract\\s*\\*\\/"((?:\\\\.|[^"\\\\])*)"',
        HtmlFilterSimpleQuote: Helpers.escapeRegExp(this.interpolation.startDelimiter) + '\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate\\s*(:.*?)?\\s*' + Helpers.escapeRegExp(this.interpolation.endDelimiter),
        HtmlFilterDoubleQuote: Helpers.escapeRegExp(this.interpolation.startDelimiter) + '\\s*"((?:\\\\.|[^"\\\\\])*)"\\s*\\|\\s*translate\\s*(:.*?)?\\s*' + Helpers.escapeRegExp(this.interpolation.endDelimiter),
        HtmlFilterSimpleQuoteOneTimeBinding: Helpers.escapeRegExp(this.interpolation.startDelimiter) + '::\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate\\s*(:.*?)?\\s*\\)' + Helpers.escapeRegExp(this.interpolation.endDelimiter),
        HtmlFilterDoubleQuoteOneTimeBinding: Helpers.escapeRegExp(this.interpolation.startDelimiter) + '::\\(\\s*"((?:\\\\.|[^"\\\\])*)"\\s*\\|\\s*translate\\s*(:.*?)?\\s*\\)' + Helpers.escapeRegExp(this.interpolation.endDelimiter),
        HtmlDirective: '<[^>]*translate[^{>]*>([^<]*)<\/[^>]*>',
        HtmlDirectiveStandalone: 'translate="((?:\\\\.|[^"\\\\])*)"',
        HtmlDirectivePluralLast: 'translate="((?:\\\\.|[^"\\\\])*)".*angular-plural-extract="((?:\\\\.|[^"\\\\])*)"',
        HtmlDirectivePluralFirst: 'angular-plural-extract="((?:\\\\.|[^"\\\\])*)".*translate="((?:\\\\.|[^"\\\\])*)"',
        HtmlNgBindHtml: 'ng-bind-html="\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate\\s*(:.*?)?\\s*"',
        JavascriptServiceSimpleQuote: '\\$translate\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*.*\\)',
        JavascriptServiceDoubleQuote: '\\$translate\\(\\s*"((?:\\\\.|[^"\\\\])*)"[^\\)]*.*\\)',
        JavascriptServiceArraySimpleQuote: '\\$translate\\((?:\\s*(\\[\\s*(?:(?:\'(?:(?:\\.|[^.*\'\\\\])*)\')\\s*,*\\s*)+\\s*\\])\\s*).*\\)',
        JavascriptServiceArrayDoubleQuote: '\\$translate\\((?:\\s*(\\[\\s*(?:(?:"(?:(?:\\.|[^.*\'\\\\])*)")\\s*,*\\s*)+\\s*\\])\\s*).*\\)',
        JavascriptServiceInstantSimpleQuote: '\\$translate\\.instant\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*.*\\)',
        JavascriptServiceInstantDoubleQuote: '\\$translate\\.instant\\(\\s*"((?:\\\\.|[^"\\\\])*)"[^\\)]*.*\\)',
        JavascriptFilterSimpleQuote: '\\$filter\\(\\s*\'translate\'\\s*\\)\\s*\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
        JavascriptFilterDoubleQuote: '\\$filter\\(\\s*"translate"\\s*\\)\\s*\\(\\s*"((?:\\\\.|[^"\\\\\])*)"[^\\)]*\\)'
    };
    _.extend(this.regexs, this.customRegex);

    this.results = {};
}

ExtractTranslations.prototype.process = function () {
    var _regex;
    // Execute all regex defined at the top of this file
    for (var i in this.regexs) {
        _regex = new RegExp(this.regexs[i], "gi");
        switch (i) {
            // Case filter HTML simple/double quoted
            case "HtmlFilterSimpleQuote":
            case "HtmlFilterSimpleQuoteOneTimeBinding":
            case "HtmlFilterDoubleQuote":
            case "HtmlFilterDoubleQuoteOneTimeBinding":
            case "HtmlDirective":
            case "HtmlDirectivePluralLast":
            case "HtmlDirectivePluralFirst":
            case "JavascriptFilterSimpleQuote":
            case "JavascriptFilterDoubleQuote":
                // Match all occurences
                var matches = this.content.match(_regex);
                if (_.isArray(matches) && matches.length) {
                    // Through each matches, we'll execute regex to get translation key
                    for (var index in matches) {
                        if (matches[index] !== "") {
                            this.extract(i, _regex, matches[index]);
                        }
                    }
                }
                break;
            // Others regex
            default:
            this.extract(i, _regex, this.content);

        }
    }

    return this.results;
};

// Extract regex strings from content and feed results object
ExtractTranslations.prototype.extract = function (regexName, regex, content) {
    var self = this;
    var r;
    if (this.verbose) {
        gutil.log('----------------------------------------------');
        gutil.log('Process extraction with regex : "' + regexName + '"');
        gutil.log(regex);
    }

    regex.lastIndex = 0;

    while ((r = regex.exec(content)) !== null) {
        if (r.length < 2) {
            return;
        }

        // Result expected [STRING, KEY, SOME_REGEX_STUF]
        // Except for plural hack [STRING, KEY, ARRAY_IN_STRING]

        var translationKey,
            evalString,
            translationDefaultValue = "";

        switch (regexName) {
            case 'HtmlDirectivePluralFirst':
                var tmp = r[1];
                r[1] = r[2];
                r[2] = tmp;
                break;
            case 'HtmlDirectivePluralLast':
                evalString = eval(r[2]);
                if (_.isArray(evalString) &&
                    evalString.length >= 2) {
                    translationDefaultValue = "{NB, plural, one{" + evalString[0] + "} other{" + evalString[1] + "}" + (evalString[2] ? ' ' + evalString[2] : '');
                }
                translationKey = r[1].trim();
                break;
            default:
            translationKey = r[1].trim();
        }

        // Avoid empty translation
        if (translationKey === "" || translationKey === undefined) {
            return;
        }

        if (this.namespace && translationKey.split('.').length < 2) {
            throw new Error(chalk.red(
                'Namespace option need tokens with "." delimiter.' +
                '\n Your token conflicts with namespaces: ') +
                translationKey + chalk.red('.\n'));
        }

        switch (regexName) {
            case "commentSimpleQuote":
            case "HtmlFilterSimpleQuote":
            case "HtmlFilterSimpleQuoteOneTimeBinding":
            case "JavascriptServiceSimpleQuote":
            case "JavascriptServiceInstantSimpleQuote":
            case "JavascriptFilterSimpleQuote":
            case "HtmlNgBindHtml":
                translationKey = translationKey.replace(/\\\'/g, "'");
                break;
            case "commentDoubleQuote":
            case "HtmlFilterDoubleQuote":
            case "HtmlFilterDoubleQuoteOneTimeBinding":
            case "JavascriptServiceDoubleQuote":
            case "JavascriptServiceInstantDoubleQuote":
            case "JavascriptFilterDoubleQuote":
                translationKey = translationKey.replace(/\\\"/g, '"');
                break;
            case "JavascriptServiceArraySimpleQuote":
            case "JavascriptServiceArrayDoubleQuote":
                var key;

                if(regexName === "JavascriptServiceArraySimpleQuote") {
                    key = translationKey.replace(/'/g, '');
                } else {
                    key = translationKey.replace(/"/g, '');
                }
                key = key.replace(/[\][]/g, '');
                key = key.split(',');

                key.forEach(function(item){
                    item = item.replace(/\\\"/g, '"').trim();
                    self.results[item] = item;
                });
                break;
        }

        if( regexName !== "JavascriptServiceArraySimpleQuote" &&
        regexName !== "JavascriptServiceArrayDoubleQuote") {
            self.results[translationKey] = translationKey;
        }

    }
};

module.exports = ExtractTranslations;
