/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/jsdoc", ["require", "exports", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("tsickle/src/util");
    /**
     * A list of all JSDoc tags allowed by the Closure compiler.
     * The public Closure docs don't list all the tags it allows; this list comes
     * from the compiler source itself.
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
     */
    var JSDOC_TAGS_WHITELIST = new Set([
        'abstract', 'argument',
        'author', 'consistentIdGenerator',
        'const', 'constant',
        'constructor', 'copyright',
        'define', 'deprecated',
        'desc', 'dict',
        'disposes', 'enhance',
        'enhanceable', 'enum',
        'export', 'expose',
        'extends', 'externs',
        'fileoverview', 'final',
        'hassoydelcall', 'hassoydeltemplate',
        'hidden', 'id',
        'idGenerator', 'ignore',
        'implements', 'implicitCast',
        'inheritDoc', 'interface',
        'jaggerInject', 'jaggerModule',
        'jaggerProvide', 'jaggerProvidePromise',
        'lends', 'license',
        'link', 'meaning',
        'modifies', 'modName',
        'mods', 'ngInject',
        'noalias', 'nocollapse',
        'nocompile', 'nosideeffects',
        'override', 'owner',
        'package', 'param',
        'pintomodule', 'polymerBehavior',
        'preserve', 'preserveTry',
        'private', 'protected',
        'public', 'record',
        'requirecss', 'requires',
        'return', 'returns',
        'see', 'stableIdGenerator',
        'struct', 'suppress',
        'template', 'this',
        'throws', 'type',
        'typedef', 'unrestricted',
        'version', 'wizaction',
        'wizmodule',
    ]);
    /**
     * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
     * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
     * these will cause Closure Compiler issues and should not be used.
     */
    var JSDOC_TAGS_BLACKLIST = new Set([
        'augments', 'class', 'constructs', 'constructor', 'enum', 'extends', 'field',
        'function', 'implements', 'interface', 'lends', 'namespace', 'private', 'public',
        'record', 'static', 'template', 'this', 'type', 'typedef',
    ]);
    /**
     * A list of JSDoc @tags that might include a {type} after them. Only banned when a type is passed.
     * Note that this does not include tags that carry a non-type system type, e.g. \@suppress.
     */
    var JSDOC_TAGS_WITH_TYPES = new Set([
        'const',
        'export',
        'param',
        'return',
    ]);
    /**
     * parse parses JSDoc out of a comment string.
     * Returns null if comment is not JSDoc.
     */
    // TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
    // such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
    // others (e.g. @suppress). We should introduce a proper model class with a more suitable data
    // strucure (e.g. a Map<TagName, Values[]>).
    function parse(comment) {
        // Make sure we have proper line endings before parsing on Windows.
        comment = util_1.normalizeLineEndings(comment);
        // TODO(evanm): this is a pile of hacky regexes for now, because we
        // would rather use the better TypeScript implementation of JSDoc
        // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
        var match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
        if (!match)
            return null;
        return parseContents(match[1].trim());
    }
    exports.parse = parse;
    /**
     * parseContents parses JSDoc out of a comment text.
     * Returns null if comment is not JSDoc.
     *
     * @param commentText a comment's text content, i.e. the comment w/o /* and * /.
     */
    function parseContents(commentText) {
        // Make sure we have proper line endings before parsing on Windows.
        commentText = util_1.normalizeLineEndings(commentText);
        // Strip all the " * " bits from the front of each line.
        commentText = commentText.replace(/^\s*\*? ?/gm, '');
        var lines = commentText.split('\n');
        var tags = [];
        var warnings = [];
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                var match = line.match(/^@(\S+) *(.*)/);
                if (match) {
                    var _a = __read(match, 3), _ = _a[0], tagName = _a[1], text = _a[2];
                    if (tagName === 'returns') {
                        // A synonym for 'return'.
                        tagName = 'return';
                    }
                    var type = void 0;
                    if (JSDOC_TAGS_BLACKLIST.has(tagName)) {
                        warnings.push("@" + tagName + " annotations are redundant with TypeScript equivalents");
                        continue; // Drop the tag so Closure won't process it.
                    }
                    else if (JSDOC_TAGS_WITH_TYPES.has(tagName) && text[0] === '{') {
                        warnings.push("the type annotation on @" + tagName + " is redundant with its TypeScript type, " +
                            "remove the {...} part");
                        continue;
                    }
                    else if (tagName === 'suppress') {
                        var suppressMatch = text.match(/^\{(.*)\}(.*)$/);
                        if (!suppressMatch) {
                            warnings.push("malformed @suppress tag: \"" + text + "\"");
                        }
                        else {
                            _b = __read(suppressMatch, 3), type = _b[1], text = _b[2];
                        }
                    }
                    else if (tagName === 'dict') {
                        warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
                        continue;
                    }
                    // Grab the parameter name from @param tags.
                    var parameterName = void 0;
                    if (tagName === 'param') {
                        match = text.match(/^(\S+) ?(.*)/);
                        if (match)
                            _c = __read(match, 3), _ = _c[0], parameterName = _c[1], text = _c[2];
                    }
                    var tag = { tagName: tagName };
                    if (parameterName)
                        tag.parameterName = parameterName;
                    if (text)
                        tag.text = text;
                    if (type)
                        tag.type = type;
                    tags.push(tag);
                }
                else {
                    // Text without a preceding @tag on it is either the plain text
                    // documentation or a continuation of a previous tag.
                    if (tags.length === 0) {
                        tags.push({ tagName: '', text: line });
                    }
                    else {
                        var lastTag = tags[tags.length - 1];
                        lastTag.text = (lastTag.text || '') + '\n' + line;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_d = lines_1.return)) _d.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (warnings.length > 0) {
            return { tags: tags, warnings: warnings };
        }
        return { tags: tags };
        var e_1, _d, _b, _c;
    }
    exports.parseContents = parseContents;
    /**
     * Serializes a Tag into a string usable in a comment.
     * Returns a string like " @foo {bar} baz" (note the whitespace).
     */
    function tagToString(tag, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        var out = '';
        if (tag.tagName) {
            if (!JSDOC_TAGS_WHITELIST.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
                // Escape tags we don't understand.  This is a subtle
                // compromise between multiple issues.
                // 1) If we pass through these non-Closure tags, the user will
                //    get a warning from Closure, and the point of tsickle is
                //    to insulate the user from Closure.
                // 2) The output of tsickle is for Closure but also may be read
                //    by humans, for example non-TypeScript users of Angular.
                // 3) Finally, we don't want to warn because users should be
                //    free to add whichever JSDoc they feel like.  If the user
                //    wants help ensuring they didn't typo a tag, that is the
                //    responsibility of a linter.
                out += " \\@" + tag.tagName;
            }
            else {
                out += " @" + tag.tagName;
            }
        }
        if (tag.type) {
            out += ' {';
            if (tag.restParam) {
                out += '...';
            }
            out += tag.type;
            if (tag.optional) {
                out += '=';
            }
            out += '}';
        }
        if (tag.parameterName) {
            out += ' ' + tag.parameterName;
        }
        if (tag.text) {
            out += ' ' + tag.text.replace(/@/g, '\\@');
        }
        return out;
    }
    /** Tags that must only occur onces in a comment (filtered below). */
    var SINGLETON_TAGS = new Set(['deprecated']);
    /** Serializes a Comment out to a string, but does not include the start and end comment tokens. */
    function toStringWithoutStartEnd(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, false, escapeExtraTags);
    }
    exports.toStringWithoutStartEnd = toStringWithoutStartEnd;
    /** Serializes a Comment out to a string usable in source code. */
    function toString(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, true, escapeExtraTags);
    }
    exports.toString = toString;
    function serialize(tags, includeStartEnd, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        if (tags.length === 0)
            return '';
        if (tags.length === 1) {
            var tag = tags[0];
            if ((tag.tagName === 'type' || tag.tagName === 'nocollapse') &&
                (!tag.text || !tag.text.match('\n'))) {
                // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
                //   /** @type {foo} */
                return '/**' + tagToString(tag, escapeExtraTags) + ' */\n';
            }
            // Otherwise, fall through to the multi-line output.
        }
        var out = includeStartEnd ? '/**\n' : '*\n';
        var emitted = new Set();
        try {
            for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                var tag = tags_1_1.value;
                if (emitted.has(tag.tagName) && SINGLETON_TAGS.has(tag.tagName)) {
                    continue;
                }
                emitted.add(tag.tagName);
                out += ' *';
                // If the tagToString is multi-line, insert " * " prefixes on subsequent lines.
                out += tagToString(tag, escapeExtraTags).split('\n').join('\n * ');
                out += '\n';
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        out += includeStartEnd ? ' */\n' : ' ';
        return out;
        var e_2, _a;
    }
    /** Merges multiple tags (of the same tagName type) into a single unified tag. */
    function merge(tags) {
        var tagNames = new Set();
        var parameterNames = new Set();
        var types = new Set();
        var texts = new Set();
        // If any of the tags are optional/rest, then the merged output is optional/rest.
        var optional = false;
        var restParam = false;
        try {
            for (var tags_2 = __values(tags), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
                var tag_1 = tags_2_1.value;
                if (tag_1.tagName)
                    tagNames.add(tag_1.tagName);
                if (tag_1.parameterName)
                    parameterNames.add(tag_1.parameterName);
                if (tag_1.type)
                    types.add(tag_1.type);
                if (tag_1.text)
                    texts.add(tag_1.text);
                if (tag_1.optional)
                    optional = true;
                if (tag_1.restParam)
                    restParam = true;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (tags_2_1 && !tags_2_1.done && (_a = tags_2.return)) _a.call(tags_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (tagNames.size !== 1) {
            throw new Error("cannot merge differing tags: " + JSON.stringify(tags));
        }
        var tagName = tagNames.values().next().value;
        var parameterName = parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
        var type = types.size > 0 ? Array.from(types).join('|') : undefined;
        var text = texts.size > 0 ? Array.from(texts).join(' / ') : undefined;
        var tag = { tagName: tagName, parameterName: parameterName, type: type, text: text };
        if (optional)
            tag.optional = true;
        if (restParam)
            tag.restParam = true;
        return tag;
        var e_3, _a;
    }
    exports.merge = merge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNkb2MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvanNkb2MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUE0QztJQXNDNUM7Ozs7OztPQU1HO0lBQ0gsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxVQUFVLEVBQU8sVUFBVTtRQUMzQixRQUFRLEVBQVMsdUJBQXVCO1FBQ3hDLE9BQU8sRUFBVSxVQUFVO1FBQzNCLGFBQWEsRUFBSSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxZQUFZO1FBQzdCLE1BQU0sRUFBVyxNQUFNO1FBQ3ZCLFVBQVUsRUFBTyxTQUFTO1FBQzFCLGFBQWEsRUFBSSxNQUFNO1FBQ3ZCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFNBQVMsRUFBUSxTQUFTO1FBQzFCLGNBQWMsRUFBRyxPQUFPO1FBQ3hCLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsUUFBUSxFQUFTLElBQUk7UUFDckIsYUFBYSxFQUFJLFFBQVE7UUFDekIsWUFBWSxFQUFLLGNBQWM7UUFDL0IsWUFBWSxFQUFLLFdBQVc7UUFDNUIsY0FBYyxFQUFHLGNBQWM7UUFDL0IsZUFBZSxFQUFFLHNCQUFzQjtRQUN2QyxPQUFPLEVBQVUsU0FBUztRQUMxQixNQUFNLEVBQVcsU0FBUztRQUMxQixVQUFVLEVBQU8sU0FBUztRQUMxQixNQUFNLEVBQVcsVUFBVTtRQUMzQixTQUFTLEVBQVEsWUFBWTtRQUM3QixXQUFXLEVBQU0sZUFBZTtRQUNoQyxVQUFVLEVBQU8sT0FBTztRQUN4QixTQUFTLEVBQVEsT0FBTztRQUN4QixhQUFhLEVBQUksaUJBQWlCO1FBQ2xDLFVBQVUsRUFBTyxhQUFhO1FBQzlCLFNBQVMsRUFBUSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFlBQVksRUFBSyxVQUFVO1FBQzNCLFFBQVEsRUFB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O0lBQ2IsQ0FBQztJQTdCRCxzQkE2QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplTGluZUVuZGluZ3N9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogVHlwZVNjcmlwdCBoYXMgYW4gQVBJIGZvciBKU0RvYyBhbHJlYWR5LCBidXQgaXQncyBub3QgZXhwb3NlZC5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNzM5M1xuICogRm9yIG5vdyB3ZSBjcmVhdGUgdHlwZXMgdGhhdCBhcmUgc2ltaWxhciB0byB0aGVpcnMgc28gdGhhdCBtaWdyYXRpbmdcbiAqIHRvIHRoZWlyIEFQSSB3aWxsIGJlIGVhc2llci4gIFNlZSBlLmcuIHRzLkpTRG9jVGFnIGFuZCB0cy5KU0RvY0NvbW1lbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFnIHtcbiAgLyoqXG4gICAqIHRhZ05hbWUgaXMgZS5nLiBcInBhcmFtXCIgaW4gYW4gQHBhcmFtIGRlY2xhcmF0aW9uLiAgSXQgaXMgdGhlIGVtcHR5IHN0cmluZ1xuICAgKiBmb3IgdGhlIHBsYWluIHRleHQgZG9jdW1lbnRhdGlvbiB0aGF0IG9jY3VycyBiZWZvcmUgYW55IEBmb28gbGluZXMuXG4gICAqL1xuICB0YWdOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBwYXJhbWV0ZXJOYW1lIGlzIHRoZSB0aGUgbmFtZSBvZiB0aGUgZnVuY3Rpb24gcGFyYW1ldGVyLCBlLmcuIFwiZm9vXCJcbiAgICogaW4gYFxcQHBhcmFtIGZvbyBUaGUgZm9vIHBhcmFtYFxuICAgKi9cbiAgcGFyYW1ldGVyTmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSB0eXBlIG9mIGEgSlNEb2MgXFxAcGFyYW0sIFxcQHR5cGUgZXRjIHRhZywgcmVuZGVyZWQgaW4gY3VybHkgYnJhY2VzLlxuICAgKiBDYW4gYWxzbyBob2xkIHRoZSB0eXBlIG9mIGFuIFxcQHN1cHByZXNzLlxuICAgKi9cbiAgdHlwZT86IHN0cmluZztcbiAgLyoqIG9wdGlvbmFsIGlzIHRydWUgZm9yIG9wdGlvbmFsIGZ1bmN0aW9uIHBhcmFtZXRlcnMuICovXG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgLyoqIHJlc3RQYXJhbSBpcyB0cnVlIGZvciBcIi4uLng6IGZvb1tdXCIgZnVuY3Rpb24gcGFyYW1ldGVycy4gKi9cbiAgcmVzdFBhcmFtPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIGRlc3RydWN0dXJpbmcgaXMgdHJ1ZSBmb3IgZGVzdHJ1Y3R1cmluZyBiaW5kIHBhcmFtZXRlcnMsIHdoaWNoIHJlcXVpcmVcbiAgICogbm9uLW51bGwgYXJndW1lbnRzIG9uIHRoZSBDbG9zdXJlIHNpZGUuICBDYW4gbGlrZWx5IHJlbW92ZSB0aGlzXG4gICAqIG9uY2UgVHlwZVNjcmlwdCBudWxsYWJsZSB0eXBlcyBhcmUgYXZhaWxhYmxlLlxuICAgKi9cbiAgZGVzdHJ1Y3R1cmluZz86IGJvb2xlYW47XG4gIC8qKiBBbnkgcmVtYWluaW5nIHRleHQgb24gdGhlIHRhZywgZS5nLiB0aGUgZGVzY3JpcHRpb24uICovXG4gIHRleHQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBsaXN0IG9mIGFsbCBKU0RvYyB0YWdzIGFsbG93ZWQgYnkgdGhlIENsb3N1cmUgY29tcGlsZXIuXG4gKiBUaGUgcHVibGljIENsb3N1cmUgZG9jcyBkb24ndCBsaXN0IGFsbCB0aGUgdGFncyBpdCBhbGxvd3M7IHRoaXMgbGlzdCBjb21lc1xuICogZnJvbSB0aGUgY29tcGlsZXIgc291cmNlIGl0c2VsZi5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvY2xvc3VyZS1jb21waWxlci9ibG9iL21hc3Rlci9zcmMvY29tL2dvb2dsZS9qYXZhc2NyaXB0L2pzY29tcC9wYXJzaW5nL0Fubm90YXRpb24uamF2YVxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2Jsb2IvbWFzdGVyL3NyYy9jb20vZ29vZ2xlL2phdmFzY3JpcHQvanNjb21wL3BhcnNpbmcvUGFyc2VyQ29uZmlnLnByb3BlcnRpZXNcbiAqL1xuY29uc3QgSlNET0NfVEFHU19XSElURUxJU1QgPSBuZXcgU2V0KFtcbiAgJ2Fic3RyYWN0JywgICAgICAnYXJndW1lbnQnLFxuICAnYXV0aG9yJywgICAgICAgICdjb25zaXN0ZW50SWRHZW5lcmF0b3InLFxuICAnY29uc3QnLCAgICAgICAgICdjb25zdGFudCcsXG4gICdjb25zdHJ1Y3RvcicsICAgJ2NvcHlyaWdodCcsXG4gICdkZWZpbmUnLCAgICAgICAgJ2RlcHJlY2F0ZWQnLFxuICAnZGVzYycsICAgICAgICAgICdkaWN0JyxcbiAgJ2Rpc3Bvc2VzJywgICAgICAnZW5oYW5jZScsXG4gICdlbmhhbmNlYWJsZScsICAgJ2VudW0nLFxuICAnZXhwb3J0JywgICAgICAgICdleHBvc2UnLFxuICAnZXh0ZW5kcycsICAgICAgICdleHRlcm5zJyxcbiAgJ2ZpbGVvdmVydmlldycsICAnZmluYWwnLFxuICAnaGFzc295ZGVsY2FsbCcsICdoYXNzb3lkZWx0ZW1wbGF0ZScsXG4gICdoaWRkZW4nLCAgICAgICAgJ2lkJyxcbiAgJ2lkR2VuZXJhdG9yJywgICAnaWdub3JlJyxcbiAgJ2ltcGxlbWVudHMnLCAgICAnaW1wbGljaXRDYXN0JyxcbiAgJ2luaGVyaXREb2MnLCAgICAnaW50ZXJmYWNlJyxcbiAgJ2phZ2dlckluamVjdCcsICAnamFnZ2VyTW9kdWxlJyxcbiAgJ2phZ2dlclByb3ZpZGUnLCAnamFnZ2VyUHJvdmlkZVByb21pc2UnLFxuICAnbGVuZHMnLCAgICAgICAgICdsaWNlbnNlJyxcbiAgJ2xpbmsnLCAgICAgICAgICAnbWVhbmluZycsXG4gICdtb2RpZmllcycsICAgICAgJ21vZE5hbWUnLFxuICAnbW9kcycsICAgICAgICAgICduZ0luamVjdCcsXG4gICdub2FsaWFzJywgICAgICAgJ25vY29sbGFwc2UnLFxuICAnbm9jb21waWxlJywgICAgICdub3NpZGVlZmZlY3RzJyxcbiAgJ292ZXJyaWRlJywgICAgICAnb3duZXInLFxuICAncGFja2FnZScsICAgICAgICdwYXJhbScsXG4gICdwaW50b21vZHVsZScsICAgJ3BvbHltZXJCZWhhdmlvcicsXG4gICdwcmVzZXJ2ZScsICAgICAgJ3ByZXNlcnZlVHJ5JyxcbiAgJ3ByaXZhdGUnLCAgICAgICAncHJvdGVjdGVkJyxcbiAgJ3B1YmxpYycsICAgICAgICAncmVjb3JkJyxcbiAgJ3JlcXVpcmVjc3MnLCAgICAncmVxdWlyZXMnLFxuICAncmV0dXJuJywgICAgICAgICdyZXR1cm5zJyxcbiAgJ3NlZScsICAgICAgICAgICAnc3RhYmxlSWRHZW5lcmF0b3InLFxuICAnc3RydWN0JywgICAgICAgICdzdXBwcmVzcycsXG4gICd0ZW1wbGF0ZScsICAgICAgJ3RoaXMnLFxuICAndGhyb3dzJywgICAgICAgICd0eXBlJyxcbiAgJ3R5cGVkZWYnLCAgICAgICAndW5yZXN0cmljdGVkJyxcbiAgJ3ZlcnNpb24nLCAgICAgICAnd2l6YWN0aW9uJyxcbiAgJ3dpem1vZHVsZScsXG5dKTtcblxuLyoqXG4gKiBBIGxpc3Qgb2YgSlNEb2MgQHRhZ3MgdGhhdCBhcmUgbmV2ZXIgYWxsb3dlZCBpbiBUeXBlU2NyaXB0IHNvdXJjZS4gVGhlc2UgYXJlIENsb3N1cmUgdGFncyB0aGF0XG4gKiBjYW4gYmUgZXhwcmVzc2VkIGluIHRoZSBUeXBlU2NyaXB0IHN1cmZhY2Ugc3ludGF4LiBBcyB0c2lja2xlJ3MgZW1pdCB3aWxsIG1hbmdsZSB0eXBlIG5hbWVzLFxuICogdGhlc2Ugd2lsbCBjYXVzZSBDbG9zdXJlIENvbXBpbGVyIGlzc3VlcyBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkLlxuICovXG5jb25zdCBKU0RPQ19UQUdTX0JMQUNLTElTVCA9IG5ldyBTZXQoW1xuICAnYXVnbWVudHMnLCAnY2xhc3MnLCAgICAgICdjb25zdHJ1Y3RzJywgJ2NvbnN0cnVjdG9yJywgJ2VudW0nLCAgICAgICdleHRlbmRzJywgJ2ZpZWxkJyxcbiAgJ2Z1bmN0aW9uJywgJ2ltcGxlbWVudHMnLCAnaW50ZXJmYWNlJywgICdsZW5kcycsICAgICAgICduYW1lc3BhY2UnLCAncHJpdmF0ZScsICdwdWJsaWMnLFxuICAncmVjb3JkJywgICAnc3RhdGljJywgICAgICd0ZW1wbGF0ZScsICAgJ3RoaXMnLCAgICAgICAgJ3R5cGUnLCAgICAgICd0eXBlZGVmJyxcbl0pO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBKU0RvYyBAdGFncyB0aGF0IG1pZ2h0IGluY2x1ZGUgYSB7dHlwZX0gYWZ0ZXIgdGhlbS4gT25seSBiYW5uZWQgd2hlbiBhIHR5cGUgaXMgcGFzc2VkLlxuICogTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgaW5jbHVkZSB0YWdzIHRoYXQgY2FycnkgYSBub24tdHlwZSBzeXN0ZW0gdHlwZSwgZS5nLiBcXEBzdXBwcmVzcy5cbiAqL1xuY29uc3QgSlNET0NfVEFHU19XSVRIX1RZUEVTID0gbmV3IFNldChbXG4gICdjb25zdCcsXG4gICdleHBvcnQnLFxuICAncGFyYW0nLFxuICAncmV0dXJuJyxcbl0pO1xuXG4vKipcbiAqIFJlc3VsdCBvZiBwYXJzaW5nIGEgSlNEb2MgY29tbWVudC4gU3VjaCBjb21tZW50cyBlc3NlbnRpYWxseSBhcmUgYnVpbHQgb2YgYSBsaXN0IG9mIHRhZ3MuXG4gKiBJbiBhZGRpdGlvbiB0byB0aGUgdGFncywgdGhpcyBtaWdodCBhbHNvIGNvbnRhaW4gd2FybmluZ3MgdG8gaW5kaWNhdGUgbm9uLWZhdGFsIHByb2JsZW1zXG4gKiB3aGlsZSBmaW5kaW5nIHRoZSB0YWdzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZEpTRG9jQ29tbWVudCB7XG4gIHRhZ3M6IFRhZ1tdO1xuICB3YXJuaW5ncz86IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIHBhcnNlIHBhcnNlcyBKU0RvYyBvdXQgb2YgYSBjb21tZW50IHN0cmluZy5cbiAqIFJldHVybnMgbnVsbCBpZiBjb21tZW50IGlzIG5vdCBKU0RvYy5cbiAqL1xuLy8gVE9ETyhtYXJ0aW5wcm9ic3QpOiByZXByZXNlbnRpbmcgSlNEb2MgYXMgYSBsaXN0IG9mIHRhZ3MgaXMgdG9vIHNpbXBsaXN0aWMuIFdlIG5lZWQgZnVuY3Rpb25hbGl0eVxuLy8gc3VjaCBhcyBtZXJnaW5nIChiZWxvdyksIGRlLWR1cGxpY2F0aW5nIGNlcnRhaW4gdGFncyAoQGRlcHJlY2F0ZWQpLCBhbmQgc3BlY2lhbCB0cmVhdG1lbnQgZm9yXG4vLyBvdGhlcnMgKGUuZy4gQHN1cHByZXNzKS4gV2Ugc2hvdWxkIGludHJvZHVjZSBhIHByb3BlciBtb2RlbCBjbGFzcyB3aXRoIGEgbW9yZSBzdWl0YWJsZSBkYXRhXG4vLyBzdHJ1Y3VyZSAoZS5nLiBhIE1hcDxUYWdOYW1lLCBWYWx1ZXNbXT4pLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGNvbW1lbnQ6IHN0cmluZyk6IFBhcnNlZEpTRG9jQ29tbWVudHxudWxsIHtcbiAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgcHJvcGVyIGxpbmUgZW5kaW5ncyBiZWZvcmUgcGFyc2luZyBvbiBXaW5kb3dzLlxuICBjb21tZW50ID0gbm9ybWFsaXplTGluZUVuZGluZ3MoY29tbWVudCk7XG4gIC8vIFRPRE8oZXZhbm0pOiB0aGlzIGlzIGEgcGlsZSBvZiBoYWNreSByZWdleGVzIGZvciBub3csIGJlY2F1c2Ugd2VcbiAgLy8gd291bGQgcmF0aGVyIHVzZSB0aGUgYmV0dGVyIFR5cGVTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgSlNEb2NcbiAgLy8gcGFyc2luZy4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNzM5M1xuICBjb25zdCBtYXRjaCA9IGNvbW1lbnQubWF0Y2goL15cXC9cXCpcXCooW1xcc1xcU10qPylcXCpcXC8kLyk7XG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuICByZXR1cm4gcGFyc2VDb250ZW50cyhtYXRjaFsxXS50cmltKCkpO1xufVxuXG4vKipcbiAqIHBhcnNlQ29udGVudHMgcGFyc2VzIEpTRG9jIG91dCBvZiBhIGNvbW1lbnQgdGV4dC5cbiAqIFJldHVybnMgbnVsbCBpZiBjb21tZW50IGlzIG5vdCBKU0RvYy5cbiAqXG4gKiBAcGFyYW0gY29tbWVudFRleHQgYSBjb21tZW50J3MgdGV4dCBjb250ZW50LCBpLmUuIHRoZSBjb21tZW50IHcvbyAvKiBhbmQgKiAvLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb250ZW50cyhjb21tZW50VGV4dDogc3RyaW5nKToge3RhZ3M6IFRhZ1tdLCB3YXJuaW5ncz86IHN0cmluZ1tdfXxudWxsIHtcbiAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgcHJvcGVyIGxpbmUgZW5kaW5ncyBiZWZvcmUgcGFyc2luZyBvbiBXaW5kb3dzLlxuICBjb21tZW50VGV4dCA9IG5vcm1hbGl6ZUxpbmVFbmRpbmdzKGNvbW1lbnRUZXh0KTtcbiAgLy8gU3RyaXAgYWxsIHRoZSBcIiAqIFwiIGJpdHMgZnJvbSB0aGUgZnJvbnQgb2YgZWFjaCBsaW5lLlxuICBjb21tZW50VGV4dCA9IGNvbW1lbnRUZXh0LnJlcGxhY2UoL15cXHMqXFwqPyA/L2dtLCAnJyk7XG4gIGNvbnN0IGxpbmVzID0gY29tbWVudFRleHQuc3BsaXQoJ1xcbicpO1xuICBjb25zdCB0YWdzOiBUYWdbXSA9IFtdO1xuICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IG1hdGNoID0gbGluZS5tYXRjaCgvXkAoXFxTKykgKiguKikvKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGxldCBbXywgdGFnTmFtZSwgdGV4dF0gPSBtYXRjaDtcbiAgICAgIGlmICh0YWdOYW1lID09PSAncmV0dXJucycpIHtcbiAgICAgICAgLy8gQSBzeW5vbnltIGZvciAncmV0dXJuJy5cbiAgICAgICAgdGFnTmFtZSA9ICdyZXR1cm4nO1xuICAgICAgfVxuICAgICAgbGV0IHR5cGU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBpZiAoSlNET0NfVEFHU19CTEFDS0xJU1QuaGFzKHRhZ05hbWUpKSB7XG4gICAgICAgIHdhcm5pbmdzLnB1c2goYEAke3RhZ05hbWV9IGFubm90YXRpb25zIGFyZSByZWR1bmRhbnQgd2l0aCBUeXBlU2NyaXB0IGVxdWl2YWxlbnRzYCk7XG4gICAgICAgIGNvbnRpbnVlOyAgLy8gRHJvcCB0aGUgdGFnIHNvIENsb3N1cmUgd29uJ3QgcHJvY2VzcyBpdC5cbiAgICAgIH0gZWxzZSBpZiAoSlNET0NfVEFHU19XSVRIX1RZUEVTLmhhcyh0YWdOYW1lKSAmJiB0ZXh0WzBdID09PSAneycpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaChcbiAgICAgICAgICAgIGB0aGUgdHlwZSBhbm5vdGF0aW9uIG9uIEAke3RhZ05hbWV9IGlzIHJlZHVuZGFudCB3aXRoIGl0cyBUeXBlU2NyaXB0IHR5cGUsIGAgK1xuICAgICAgICAgICAgYHJlbW92ZSB0aGUgey4uLn0gcGFydGApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ3N1cHByZXNzJykge1xuICAgICAgICBjb25zdCBzdXBwcmVzc01hdGNoID0gdGV4dC5tYXRjaCgvXlxceyguKilcXH0oLiopJC8pO1xuICAgICAgICBpZiAoIXN1cHByZXNzTWF0Y2gpIHtcbiAgICAgICAgICB3YXJuaW5ncy5wdXNoKGBtYWxmb3JtZWQgQHN1cHByZXNzIHRhZzogXCIke3RleHR9XCJgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBbLCB0eXBlLCB0ZXh0XSA9IHN1cHByZXNzTWF0Y2g7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ2RpY3QnKSB7XG4gICAgICAgIHdhcm5pbmdzLnB1c2goJ3VzZSBpbmRleCBzaWduYXR1cmVzIChgW2s6IHN0cmluZ106IHR5cGVgKSBpbnN0ZWFkIG9mIEBkaWN0Jyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBHcmFiIHRoZSBwYXJhbWV0ZXIgbmFtZSBmcm9tIEBwYXJhbSB0YWdzLlxuICAgICAgbGV0IHBhcmFtZXRlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ3BhcmFtJykge1xuICAgICAgICBtYXRjaCA9IHRleHQubWF0Y2goL14oXFxTKykgPyguKikvKTtcbiAgICAgICAgaWYgKG1hdGNoKSBbXywgcGFyYW1ldGVyTmFtZSwgdGV4dF0gPSBtYXRjaDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFnOiBUYWcgPSB7dGFnTmFtZX07XG4gICAgICBpZiAocGFyYW1ldGVyTmFtZSkgdGFnLnBhcmFtZXRlck5hbWUgPSBwYXJhbWV0ZXJOYW1lO1xuICAgICAgaWYgKHRleHQpIHRhZy50ZXh0ID0gdGV4dDtcbiAgICAgIGlmICh0eXBlKSB0YWcudHlwZSA9IHR5cGU7XG4gICAgICB0YWdzLnB1c2godGFnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGV4dCB3aXRob3V0IGEgcHJlY2VkaW5nIEB0YWcgb24gaXQgaXMgZWl0aGVyIHRoZSBwbGFpbiB0ZXh0XG4gICAgICAvLyBkb2N1bWVudGF0aW9uIG9yIGEgY29udGludWF0aW9uIG9mIGEgcHJldmlvdXMgdGFnLlxuICAgICAgaWYgKHRhZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRhZ3MucHVzaCh7dGFnTmFtZTogJycsIHRleHQ6IGxpbmV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxhc3RUYWcgPSB0YWdzW3RhZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIGxhc3RUYWcudGV4dCA9IChsYXN0VGFnLnRleHQgfHwgJycpICsgJ1xcbicgKyBsaW5lO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7dGFncywgd2FybmluZ3N9O1xuICB9XG4gIHJldHVybiB7dGFnc307XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIFRhZyBpbnRvIGEgc3RyaW5nIHVzYWJsZSBpbiBhIGNvbW1lbnQuXG4gKiBSZXR1cm5zIGEgc3RyaW5nIGxpa2UgXCIgQGZvbyB7YmFyfSBiYXpcIiAobm90ZSB0aGUgd2hpdGVzcGFjZSkuXG4gKi9cbmZ1bmN0aW9uIHRhZ1RvU3RyaW5nKHRhZzogVGFnLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIGxldCBvdXQgPSAnJztcbiAgaWYgKHRhZy50YWdOYW1lKSB7XG4gICAgaWYgKCFKU0RPQ19UQUdTX1dISVRFTElTVC5oYXModGFnLnRhZ05hbWUpIHx8IGVzY2FwZUV4dHJhVGFncy5oYXModGFnLnRhZ05hbWUpKSB7XG4gICAgICAvLyBFc2NhcGUgdGFncyB3ZSBkb24ndCB1bmRlcnN0YW5kLiAgVGhpcyBpcyBhIHN1YnRsZVxuICAgICAgLy8gY29tcHJvbWlzZSBiZXR3ZWVuIG11bHRpcGxlIGlzc3Vlcy5cbiAgICAgIC8vIDEpIElmIHdlIHBhc3MgdGhyb3VnaCB0aGVzZSBub24tQ2xvc3VyZSB0YWdzLCB0aGUgdXNlciB3aWxsXG4gICAgICAvLyAgICBnZXQgYSB3YXJuaW5nIGZyb20gQ2xvc3VyZSwgYW5kIHRoZSBwb2ludCBvZiB0c2lja2xlIGlzXG4gICAgICAvLyAgICB0byBpbnN1bGF0ZSB0aGUgdXNlciBmcm9tIENsb3N1cmUuXG4gICAgICAvLyAyKSBUaGUgb3V0cHV0IG9mIHRzaWNrbGUgaXMgZm9yIENsb3N1cmUgYnV0IGFsc28gbWF5IGJlIHJlYWRcbiAgICAgIC8vICAgIGJ5IGh1bWFucywgZm9yIGV4YW1wbGUgbm9uLVR5cGVTY3JpcHQgdXNlcnMgb2YgQW5ndWxhci5cbiAgICAgIC8vIDMpIEZpbmFsbHksIHdlIGRvbid0IHdhbnQgdG8gd2FybiBiZWNhdXNlIHVzZXJzIHNob3VsZCBiZVxuICAgICAgLy8gICAgZnJlZSB0byBhZGQgd2hpY2hldmVyIEpTRG9jIHRoZXkgZmVlbCBsaWtlLiAgSWYgdGhlIHVzZXJcbiAgICAgIC8vICAgIHdhbnRzIGhlbHAgZW5zdXJpbmcgdGhleSBkaWRuJ3QgdHlwbyBhIHRhZywgdGhhdCBpcyB0aGVcbiAgICAgIC8vICAgIHJlc3BvbnNpYmlsaXR5IG9mIGEgbGludGVyLlxuICAgICAgb3V0ICs9IGAgXFxcXEAke3RhZy50YWdOYW1lfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBgIEAke3RhZy50YWdOYW1lfWA7XG4gICAgfVxuICB9XG4gIGlmICh0YWcudHlwZSkge1xuICAgIG91dCArPSAnIHsnO1xuICAgIGlmICh0YWcucmVzdFBhcmFtKSB7XG4gICAgICBvdXQgKz0gJy4uLic7XG4gICAgfVxuICAgIG91dCArPSB0YWcudHlwZTtcbiAgICBpZiAodGFnLm9wdGlvbmFsKSB7XG4gICAgICBvdXQgKz0gJz0nO1xuICAgIH1cbiAgICBvdXQgKz0gJ30nO1xuICB9XG4gIGlmICh0YWcucGFyYW1ldGVyTmFtZSkge1xuICAgIG91dCArPSAnICcgKyB0YWcucGFyYW1ldGVyTmFtZTtcbiAgfVxuICBpZiAodGFnLnRleHQpIHtcbiAgICBvdXQgKz0gJyAnICsgdGFnLnRleHQucmVwbGFjZSgvQC9nLCAnXFxcXEAnKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKiogVGFncyB0aGF0IG11c3Qgb25seSBvY2N1ciBvbmNlcyBpbiBhIGNvbW1lbnQgKGZpbHRlcmVkIGJlbG93KS4gKi9cbmNvbnN0IFNJTkdMRVRPTl9UQUdTID0gbmV3IFNldChbJ2RlcHJlY2F0ZWQnXSk7XG5cbi8qKiBTZXJpYWxpemVzIGEgQ29tbWVudCBvdXQgdG8gYSBzdHJpbmcsIGJ1dCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBzdGFydCBhbmQgZW5kIGNvbW1lbnQgdG9rZW5zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU3RyaW5nV2l0aG91dFN0YXJ0RW5kKHRhZ3M6IFRhZ1tdLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIHJldHVybiBzZXJpYWxpemUodGFncywgZmFsc2UsIGVzY2FwZUV4dHJhVGFncyk7XG59XG5cbi8qKiBTZXJpYWxpemVzIGEgQ29tbWVudCBvdXQgdG8gYSBzdHJpbmcgdXNhYmxlIGluIHNvdXJjZSBjb2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU3RyaW5nKHRhZ3M6IFRhZ1tdLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIHJldHVybiBzZXJpYWxpemUodGFncywgdHJ1ZSwgZXNjYXBlRXh0cmFUYWdzKTtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplKFxuICAgIHRhZ3M6IFRhZ1tdLCBpbmNsdWRlU3RhcnRFbmQ6IGJvb2xlYW4sIGVzY2FwZUV4dHJhVGFncyA9IG5ldyBTZXQ8c3RyaW5nPigpKTogc3RyaW5nIHtcbiAgaWYgKHRhZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gIGlmICh0YWdzLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbnN0IHRhZyA9IHRhZ3NbMF07XG4gICAgaWYgKCh0YWcudGFnTmFtZSA9PT0gJ3R5cGUnIHx8IHRhZy50YWdOYW1lID09PSAnbm9jb2xsYXBzZScpICYmXG4gICAgICAgICghdGFnLnRleHQgfHwgIXRhZy50ZXh0Lm1hdGNoKCdcXG4nKSkpIHtcbiAgICAgIC8vIFNwZWNpYWwtY2FzZSBvbmUtbGluZXIgXCJ0eXBlXCIgYW5kIFwibm9jb2xsYXBzZVwiIHRhZ3MgdG8gZml0IG9uIG9uZSBsaW5lLCBlLmcuXG4gICAgICAvLyAgIC8qKiBAdHlwZSB7Zm9vfSAqL1xuICAgICAgcmV0dXJuICcvKionICsgdGFnVG9TdHJpbmcodGFnLCBlc2NhcGVFeHRyYVRhZ3MpICsgJyAqL1xcbic7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgZmFsbCB0aHJvdWdoIHRvIHRoZSBtdWx0aS1saW5lIG91dHB1dC5cbiAgfVxuXG4gIGxldCBvdXQgPSBpbmNsdWRlU3RhcnRFbmQgPyAnLyoqXFxuJyA6ICcqXFxuJztcbiAgY29uc3QgZW1pdHRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgaWYgKGVtaXR0ZWQuaGFzKHRhZy50YWdOYW1lKSAmJiBTSU5HTEVUT05fVEFHUy5oYXModGFnLnRhZ05hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZW1pdHRlZC5hZGQodGFnLnRhZ05hbWUpO1xuICAgIG91dCArPSAnIConO1xuICAgIC8vIElmIHRoZSB0YWdUb1N0cmluZyBpcyBtdWx0aS1saW5lLCBpbnNlcnQgXCIgKiBcIiBwcmVmaXhlcyBvbiBzdWJzZXF1ZW50IGxpbmVzLlxuICAgIG91dCArPSB0YWdUb1N0cmluZyh0YWcsIGVzY2FwZUV4dHJhVGFncykuc3BsaXQoJ1xcbicpLmpvaW4oJ1xcbiAqICcpO1xuICAgIG91dCArPSAnXFxuJztcbiAgfVxuICBvdXQgKz0gaW5jbHVkZVN0YXJ0RW5kID8gJyAqL1xcbicgOiAnICc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKiBNZXJnZXMgbXVsdGlwbGUgdGFncyAob2YgdGhlIHNhbWUgdGFnTmFtZSB0eXBlKSBpbnRvIGEgc2luZ2xlIHVuaWZpZWQgdGFnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKHRhZ3M6IFRhZ1tdKTogVGFnIHtcbiAgY29uc3QgdGFnTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcGFyYW1ldGVyTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgdGV4dHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gSWYgYW55IG9mIHRoZSB0YWdzIGFyZSBvcHRpb25hbC9yZXN0LCB0aGVuIHRoZSBtZXJnZWQgb3V0cHV0IGlzIG9wdGlvbmFsL3Jlc3QuXG4gIGxldCBvcHRpb25hbCA9IGZhbHNlO1xuICBsZXQgcmVzdFBhcmFtID0gZmFsc2U7XG4gIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICBpZiAodGFnLnRhZ05hbWUpIHRhZ05hbWVzLmFkZCh0YWcudGFnTmFtZSk7XG4gICAgaWYgKHRhZy5wYXJhbWV0ZXJOYW1lKSBwYXJhbWV0ZXJOYW1lcy5hZGQodGFnLnBhcmFtZXRlck5hbWUpO1xuICAgIGlmICh0YWcudHlwZSkgdHlwZXMuYWRkKHRhZy50eXBlKTtcbiAgICBpZiAodGFnLnRleHQpIHRleHRzLmFkZCh0YWcudGV4dCk7XG4gICAgaWYgKHRhZy5vcHRpb25hbCkgb3B0aW9uYWwgPSB0cnVlO1xuICAgIGlmICh0YWcucmVzdFBhcmFtKSByZXN0UGFyYW0gPSB0cnVlO1xuICB9XG5cbiAgaWYgKHRhZ05hbWVzLnNpemUgIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBtZXJnZSBkaWZmZXJpbmcgdGFnczogJHtKU09OLnN0cmluZ2lmeSh0YWdzKX1gKTtcbiAgfVxuICBjb25zdCB0YWdOYW1lID0gdGFnTmFtZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICBjb25zdCBwYXJhbWV0ZXJOYW1lID1cbiAgICAgIHBhcmFtZXRlck5hbWVzLnNpemUgPiAwID8gQXJyYXkuZnJvbShwYXJhbWV0ZXJOYW1lcykuam9pbignX29yXycpIDogdW5kZWZpbmVkO1xuICBjb25zdCB0eXBlID0gdHlwZXMuc2l6ZSA+IDAgPyBBcnJheS5mcm9tKHR5cGVzKS5qb2luKCd8JykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHRleHQgPSB0ZXh0cy5zaXplID4gMCA/IEFycmF5LmZyb20odGV4dHMpLmpvaW4oJyAvICcpIDogdW5kZWZpbmVkO1xuICBjb25zdCB0YWc6IFRhZyA9IHt0YWdOYW1lLCBwYXJhbWV0ZXJOYW1lLCB0eXBlLCB0ZXh0fTtcbiAgaWYgKG9wdGlvbmFsKSB0YWcub3B0aW9uYWwgPSB0cnVlO1xuICBpZiAocmVzdFBhcmFtKSB0YWcucmVzdFBhcmFtID0gdHJ1ZTtcbiAgcmV0dXJuIHRhZztcbn1cbiJdfQ==