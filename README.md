# gulp-angular-translate-extract
Gulp version of [grunt-angular-translate](https://github.com/angular-translate/grunt-angular-translate).
Simply extract all the translation keys for [angular-translate](https://github.com/PascalPrecht/angular-translate) project created by [Pascal Precht](https://github.com/PascalPrecht).

## Getting started
Install this gulp plugin next to your project. Require [gulpjs](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).

```bash
$ npm install gulp-angular-translate-extract
```

Then you can use the gulp plugin inside your gulp tasks, as follow:

```javascript
//...
    var gulp = require('gulp');
    var angularTranslate = require('./');
//...
    gulp.task('default', function () {
        return gulp.src('fixtures/*.html')
            .pipe(angularTranslate({
                lang: ['en_CA', 'fr_CA']
            }))
            //..
    });
//...
```

To know all options available, please read the documentation ([here](#Options)).

## Use Cases

### Views

#### Filters

```html
{{'TRANSLATION' | translate}}
```

```html
{{'TRANSLATION' | translate:XXXXXX}}
```

#### Directives

```html
<a href="#" translate>TRANSLATION</a>
```

#### Directives plural (custom attribute angular-plural-extract to automatize extraction)

```html
<span translate="TRANSLATION_KEY" angular-plural-extract="['TEXT FOR ONE','# TEXT FOR OTHER']" translate-values="{NB: X}" translate-interpolation="messageformat"></span>
```

### Javascript

#### Filter

```javascript
filter("translate")("TRANSLATION")
```

#### Service angular-translate

```javascript
$translate('TRANSLATION')
```

```javascript
$translate.instant('TRANSLATION')
```

```javascript
$translate(['TRANSLATION', 'TRANSLATION_1'])
```

## Configuration

### Options

This is all options supported by gulp-angular-translate:

- [nullEmpty](#nullempty)
- [namespace](#namespace)
- [interpolation](#interpolation)
- [defaultLang](#defaultLang)
- [lang](#lang)
- [prefix](#prefix)
- [suffix](#suffix)
- [dest](#dest)
- [safeMode](#safeMode)
- [stringifyOptions](#stringifyoptions)

#### nullEmpty

Type: `Boolean`
Default: `false`

Example: `true`

If set to true, it will replace all final empty translations by *null* value.

#### namespace

Type: `Boolean`
Default: `false`

Example: `true`

If set to true, it will organize output JSON like the following.
`````
{
  "MODULE": {
    "CATEGORY": {
      "TITLE": "My Title",
      "TITLE1": null
    }
  }
}
`````


#### interpolation

Type: `Object`
Default: `{ startDelimiter: '{{', endDelimiter: '}}' }`

Example: `{ startDelimiter: '[[', endDelimiter: ']]' }`

Define interpolation symbol use for your angular application.
The angular's docs about [$interpolateProvider](http://docs.angularjs.org/api/ng.$interpolateProvider) explain how you can configure the interpolation markup.

#### defaultLang

Type: `String`
Default: `undefined`

Example: `"en_CA"`

Define the default language. For default language, by default the key will be set as value.

#### customRegex

Type: `Array<String>`
Default: `[]`

Example:

```javascript
customRegex: [
  'tt-default="\'((?:\\\\.|[^\'\\\\])*)\'\\|translate"'
],
```

Will extract `MY.CUSTOM.REGEX` from the following HTML: `<article tt-default="'MY.CUSTOM.REGEX'|translate">`.

Enjoy your custom regex guys!

#### lang

Type: `Array`
Default: `undefined`

Example: `['en_CA', 'en_US']`

Define language to be extract (en__CA, en__US, xxx). xxx will be the output filename wrapped by prefix and suffix option.

#### prefix

Type: `String`
Default: `""`

Example: `"project_"`

Set prefix to output filenames (cf [angular-translate#static-files](https://github.com/PascalPrecht/angular-translate/wiki/Asynchronous-loading#using-extension-static-files-loader)).

#### suffix

Type: `String`
Default:  `""`

Example: `".json"`

Set suffix to output filenames (cf [angular-translate#static-files](https://github.com/PascalPrecht/angular-translate/wiki/Asynchronous-loading#using-extension-static-files-loader)).

#### dest

Type: `String`
Default:  `""`

Example: `"src/assets/i18n"`

Relative path to output folder.

#### safeMode

Type: `Boolean`
Default: `false`

If safeMode is set to `true` the deleted translations will stay in the output lang file.

#### stringifyOptions

Type: `Boolean` or `Object`
Default: `false`

If stringifyOptions is set to `true` the output will be sort (case insensitive).
If stringifyOptions is an `object`, you can easily check [json-stable-stringify](https://github.com/substack/json-stable-stringify) README.

## License

The MIT License (MIT)

Copyright (c) 2015 Benjamin Cabanes

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
