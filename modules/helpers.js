'use strict';
var _ = require('lodash');
var stringify = require('json-stable-stringify');

function Helpers() {
    var service = {
        'customStringify': customStringify,
        'escapeRegExp': escapeRegExp
    };

    return service;

    //////////

    function customStringify(val, stringify_options) {
        if (stringify_options) {
            return stringify(val, _.isObject(stringify_options) ?
                stringify_options :
            {
                space: '    ',
                cmp: function (a, b) {
                    var lower = function (a) {
                        return a.toLowerCase();
                    };
                    return lower(a.key) < lower(b.key) ? -1 : 1;
                }
            });
        }
        return JSON.stringify(val, null, 4);
    }

    /**
     * Use to escape some char into regex patterns
     */
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
}

module.exports = new Helpers();
