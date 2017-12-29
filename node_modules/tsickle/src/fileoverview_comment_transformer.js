/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/fileoverview_comment_transformer", ["require", "exports", "tsickle/src/jsdoc", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jsdoc = require("tsickle/src/jsdoc");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * A set of JSDoc tags that mark a comment as a fileoverview comment. These are recognized by other
     * pieces of infrastructure (Closure Compiler, module system, ...).
     */
    var FILEOVERVIEW_COMMENT_MARKERS = new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);
    /**
     * Returns true if the given comment is a \@fileoverview style comment in the Closure sense, i.e. a
     * comment that has JSDoc tags marking it as a fileoverview comment.
     * Note that this is different from TypeScript's understanding of the concept, where a file comment
     * is a comment separated from the rest of the file by a double newline.
     */
    function isClosureFileoverviewComment(text) {
        var current = jsdoc.parseContents(text);
        return current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); });
    }
    exports.isClosureFileoverviewComment = isClosureFileoverviewComment;
    /**
     * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
     * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
     */
    function transformFileoverviewComment(context) {
        return function (sf) {
            var comments = [];
            // Use trailing comments because that's what transformer_util.ts creates (i.e. by convention).
            if (sf.statements.length && sf.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
                comments = ts.getSyntheticTrailingComments(sf.statements[0]) || [];
            }
            var fileoverviewIdx = -1;
            var parsed = null;
            for (var i = comments.length - 1; i >= 0; i--) {
                var current = jsdoc.parseContents(comments[i].text);
                if (current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); })) {
                    fileoverviewIdx = i;
                    parsed = current;
                    break;
                }
            }
            // Add a @suppress {checkTypes} tag to each source file's JSDoc comment,
            // being careful to retain existing comments and their @suppress'ions.
            // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
            // that has not been attached to some other tree node to be the file overview comment, and
            // only applies @suppress tags from it.
            // AJD considers *any* comment mentioning @fileoverview.
            if (!parsed) {
                // No existing comment to merge with, just emit a new one.
                return addNewFileoverviewComment(sf);
            }
            // Add @suppress {checkTypes}, or add to the list in an existing @suppress tag.
            // Closure compiler barfs if there's a duplicated @suppress tag in a file, so the tag must
            // only appear once and be merged.
            var tags = parsed.tags;
            var suppressTag = tags.find(function (t) { return t.tagName === 'suppress'; });
            if (suppressTag) {
                var suppressions = suppressTag.type || '';
                var suppressionsList = suppressions.split(',').map(function (s) { return s.trim(); });
                if (suppressionsList.indexOf('checkTypes') === -1) {
                    suppressionsList.push('checkTypes');
                }
                suppressTag.type = suppressionsList.join(',');
            }
            else {
                tags.push({
                    tagName: 'suppress',
                    type: 'checkTypes',
                    text: 'checked by tsc',
                });
            }
            var commentText = jsdoc.toStringWithoutStartEnd(tags);
            comments[fileoverviewIdx].text = commentText;
            // sf does not need to be updated, synthesized comments are mutable.
            return sf;
        };
    }
    exports.transformFileoverviewComment = transformFileoverviewComment;
    function addNewFileoverviewComment(sf) {
        var commentText = jsdoc.toStringWithoutStartEnd([
            { tagName: 'fileoverview', text: 'added by tsickle' },
            { tagName: 'suppress', type: 'checkTypes', text: 'checked by tsc' },
        ]);
        var syntheticFirstStatement = transformer_util_1.createNotEmittedStatement(sf);
        syntheticFirstStatement = ts.addSyntheticTrailingComment(syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
        return transformer_util_1.updateSourceFileNode(sf, ts.createNodeArray(__spread([syntheticFirstStatement], sf.statements)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUFpQztJQUNqQyxpRUFBbUY7SUFDbkYsMkNBQW1DO0lBRW5DOzs7T0FHRztJQUNILElBQU0sNEJBQTRCLEdBQzlCLElBQUksR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFFM0U7Ozs7O09BS0c7SUFDSCxzQ0FBNkMsSUFBWTtRQUN2RCxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFIRCxvRUFHQztJQUVEOzs7T0FHRztJQUNILHNDQUE2QyxPQUFpQztRQUU1RSxNQUFNLENBQUMsVUFBQyxFQUFpQjtZQUN2QixJQUFJLFFBQVEsR0FBNEIsRUFBRSxDQUFDO1lBQzNDLDhGQUE4RjtZQUM5RixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQkFDeEYsUUFBUSxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsQ0FB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QUFrQixFQUFDO1lBQ25ELEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztTQUNsRSxDQUFDLENBQUM7UUFDSCxJQUFJLHVCQUF1QixHQUFHLDRDQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVELHVCQUF1QixHQUFHLEVBQUUsQ0FBQywyQkFBMkIsQ0FDcEQsdUJBQXVCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEYsTUFBTSxDQUFDLHVDQUFvQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsZUFBZSxXQUFFLHVCQUF1QixHQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ25HLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGpzZG9jIGZyb20gJy4vanNkb2MnO1xuaW1wb3J0IHtjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50LCB1cGRhdGVTb3VyY2VGaWxlTm9kZX0gZnJvbSAnLi90cmFuc2Zvcm1lcl91dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogQSBzZXQgb2YgSlNEb2MgdGFncyB0aGF0IG1hcmsgYSBjb21tZW50IGFzIGEgZmlsZW92ZXJ2aWV3IGNvbW1lbnQuIFRoZXNlIGFyZSByZWNvZ25pemVkIGJ5IG90aGVyXG4gKiBwaWVjZXMgb2YgaW5mcmFzdHJ1Y3R1cmUgKENsb3N1cmUgQ29tcGlsZXIsIG1vZHVsZSBzeXN0ZW0sIC4uLikuXG4gKi9cbmNvbnN0IEZJTEVPVkVSVklFV19DT01NRU5UX01BUktFUlM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPVxuICAgIG5ldyBTZXQoWydmaWxlb3ZlcnZpZXcnLCAnZXh0ZXJucycsICdtb2ROYW1lJywgJ21vZHMnLCAncGludG9tb2R1bGUnXSk7XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBjb21tZW50IGlzIGEgXFxAZmlsZW92ZXJ2aWV3IHN0eWxlIGNvbW1lbnQgaW4gdGhlIENsb3N1cmUgc2Vuc2UsIGkuZS4gYVxuICogY29tbWVudCB0aGF0IGhhcyBKU0RvYyB0YWdzIG1hcmtpbmcgaXQgYXMgYSBmaWxlb3ZlcnZpZXcgY29tbWVudC5cbiAqIE5vdGUgdGhhdCB0aGlzIGlzIGRpZmZlcmVudCBmcm9tIFR5cGVTY3JpcHQncyB1bmRlcnN0YW5kaW5nIG9mIHRoZSBjb25jZXB0LCB3aGVyZSBhIGZpbGUgY29tbWVudFxuICogaXMgYSBjb21tZW50IHNlcGFyYXRlZCBmcm9tIHRoZSByZXN0IG9mIHRoZSBmaWxlIGJ5IGEgZG91YmxlIG5ld2xpbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50KHRleHQ6IHN0cmluZykge1xuICBjb25zdCBjdXJyZW50ID0ganNkb2MucGFyc2VDb250ZW50cyh0ZXh0KTtcbiAgcmV0dXJuIGN1cnJlbnQgIT09IG51bGwgJiYgY3VycmVudC50YWdzLnNvbWUodCA9PiBGSUxFT1ZFUlZJRVdfQ09NTUVOVF9NQVJLRVJTLmhhcyh0LnRhZ05hbWUpKTtcbn1cblxuLyoqXG4gKiBBIHRyYW5zZm9ybWVyIHRoYXQgZW5zdXJlcyB0aGUgZW1pdHRlZCBKUyBmaWxlIGhhcyBhbiBcXEBmaWxlb3ZlcnZpZXcgY29tbWVudCB0aGF0IGNvbnRhaW5zIGFuXG4gKiBcXEBzdXBwcmVzcyB7Y2hlY2tUeXBlc30gYW5ub3RhdGlvbiBieSBlaXRoZXIgYWRkaW5nIG9yIHVwZGF0aW5nIGFuIGV4aXN0aW5nIGNvbW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1GaWxlb3ZlcnZpZXdDb21tZW50KGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6XG4gICAgKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB0cy5Tb3VyY2VGaWxlIHtcbiAgcmV0dXJuIChzZjogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGxldCBjb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W10gPSBbXTtcbiAgICAvLyBVc2UgdHJhaWxpbmcgY29tbWVudHMgYmVjYXVzZSB0aGF0J3Mgd2hhdCB0cmFuc2Zvcm1lcl91dGlsLnRzIGNyZWF0ZXMgKGkuZS4gYnkgY29udmVudGlvbikuXG4gICAgaWYgKHNmLnN0YXRlbWVudHMubGVuZ3RoICYmIHNmLnN0YXRlbWVudHNbMF0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Ob3RFbWl0dGVkU3RhdGVtZW50KSB7XG4gICAgICBjb21tZW50cyA9IHRzLmdldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMoc2Yuc3RhdGVtZW50c1swXSkgfHwgW107XG4gICAgfVxuXG4gICAgbGV0IGZpbGVvdmVydmlld0lkeCA9IC0xO1xuICAgIGxldCBwYXJzZWQ6IHt0YWdzOiBqc2RvYy5UYWdbXX18bnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IGNvbW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0ganNkb2MucGFyc2VDb250ZW50cyhjb21tZW50c1tpXS50ZXh0KTtcbiAgICAgIGlmIChjdXJyZW50ICE9PSBudWxsICYmIGN1cnJlbnQudGFncy5zb21lKHQgPT4gRklMRU9WRVJWSUVXX0NPTU1FTlRfTUFSS0VSUy5oYXModC50YWdOYW1lKSkpIHtcbiAgICAgICAgZmlsZW92ZXJ2aWV3SWR4ID0gaTtcbiAgICAgICAgcGFyc2VkID0gY3VycmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFkZCBhIEBzdXBwcmVzcyB7Y2hlY2tUeXBlc30gdGFnIHRvIGVhY2ggc291cmNlIGZpbGUncyBKU0RvYyBjb21tZW50LFxuICAgIC8vIGJlaW5nIGNhcmVmdWwgdG8gcmV0YWluIGV4aXN0aW5nIGNvbW1lbnRzIGFuZCB0aGVpciBAc3VwcHJlc3MnaW9ucy5cbiAgICAvLyBDbG9zdXJlIENvbXBpbGVyIGNvbnNpZGVycyB0aGUgKmxhc3QqIGNvbW1lbnQgd2l0aCBAZmlsZW92ZXJ2aWV3IChvciBAZXh0ZXJucyBvciBAbm9jb21waWxlKVxuICAgIC8vIHRoYXQgaGFzIG5vdCBiZWVuIGF0dGFjaGVkIHRvIHNvbWUgb3RoZXIgdHJlZSBub2RlIHRvIGJlIHRoZSBmaWxlIG92ZXJ2aWV3IGNvbW1lbnQsIGFuZFxuICAgIC8vIG9ubHkgYXBwbGllcyBAc3VwcHJlc3MgdGFncyBmcm9tIGl0LlxuICAgIC8vIEFKRCBjb25zaWRlcnMgKmFueSogY29tbWVudCBtZW50aW9uaW5nIEBmaWxlb3ZlcnZpZXcuXG4gICAgaWYgKCFwYXJzZWQpIHtcbiAgICAgIC8vIE5vIGV4aXN0aW5nIGNvbW1lbnQgdG8gbWVyZ2Ugd2l0aCwganVzdCBlbWl0IGEgbmV3IG9uZS5cbiAgICAgIHJldHVybiBhZGROZXdGaWxlb3ZlcnZpZXdDb21tZW50KHNmKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgQHN1cHByZXNzIHtjaGVja1R5cGVzfSwgb3IgYWRkIHRvIHRoZSBsaXN0IGluIGFuIGV4aXN0aW5nIEBzdXBwcmVzcyB0YWcuXG4gICAgLy8gQ2xvc3VyZSBjb21waWxlciBiYXJmcyBpZiB0aGVyZSdzIGEgZHVwbGljYXRlZCBAc3VwcHJlc3MgdGFnIGluIGEgZmlsZSwgc28gdGhlIHRhZyBtdXN0XG4gICAgLy8gb25seSBhcHBlYXIgb25jZSBhbmQgYmUgbWVyZ2VkLlxuICAgIGNvbnN0IHt0YWdzfSA9IHBhcnNlZDtcbiAgICBjb25zdCBzdXBwcmVzc1RhZyA9IHRhZ3MuZmluZCh0ID0+IHQudGFnTmFtZSA9PT0gJ3N1cHByZXNzJyk7XG4gICAgaWYgKHN1cHByZXNzVGFnKSB7XG4gICAgICBjb25zdCBzdXBwcmVzc2lvbnMgPSBzdXBwcmVzc1RhZy50eXBlIHx8ICcnO1xuICAgICAgY29uc3Qgc3VwcHJlc3Npb25zTGlzdCA9IHN1cHByZXNzaW9ucy5zcGxpdCgnLCcpLm1hcChzID0+IHMudHJpbSgpKTtcbiAgICAgIGlmIChzdXBwcmVzc2lvbnNMaXN0LmluZGV4T2YoJ2NoZWNrVHlwZXMnKSA9PT0gLTEpIHtcbiAgICAgICAgc3VwcHJlc3Npb25zTGlzdC5wdXNoKCdjaGVja1R5cGVzJyk7XG4gICAgICB9XG4gICAgICBzdXBwcmVzc1RhZy50eXBlID0gc3VwcHJlc3Npb25zTGlzdC5qb2luKCcsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhZ3MucHVzaCh7XG4gICAgICAgIHRhZ05hbWU6ICdzdXBwcmVzcycsXG4gICAgICAgIHR5cGU6ICdjaGVja1R5cGVzJyxcbiAgICAgICAgdGV4dDogJ2NoZWNrZWQgYnkgdHNjJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBjb21tZW50VGV4dCA9IGpzZG9jLnRvU3RyaW5nV2l0aG91dFN0YXJ0RW5kKHRhZ3MpO1xuICAgIGNvbW1lbnRzW2ZpbGVvdmVydmlld0lkeF0udGV4dCA9IGNvbW1lbnRUZXh0O1xuICAgIC8vIHNmIGRvZXMgbm90IG5lZWQgdG8gYmUgdXBkYXRlZCwgc3ludGhlc2l6ZWQgY29tbWVudHMgYXJlIG11dGFibGUuXG4gICAgcmV0dXJuIHNmO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGROZXdGaWxlb3ZlcnZpZXdDb21tZW50KHNmOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IGNvbW1lbnRUZXh0ID0ganNkb2MudG9TdHJpbmdXaXRob3V0U3RhcnRFbmQoW1xuICAgIHt0YWdOYW1lOiAnZmlsZW92ZXJ2aWV3JywgdGV4dDogJ2FkZGVkIGJ5IHRzaWNrbGUnfSxcbiAgICB7dGFnTmFtZTogJ3N1cHByZXNzJywgdHlwZTogJ2NoZWNrVHlwZXMnLCB0ZXh0OiAnY2hlY2tlZCBieSB0c2MnfSxcbiAgXSk7XG4gIGxldCBzeW50aGV0aWNGaXJzdFN0YXRlbWVudCA9IGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc2YpO1xuICBzeW50aGV0aWNGaXJzdFN0YXRlbWVudCA9IHRzLmFkZFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudChcbiAgICAgIHN5bnRoZXRpY0ZpcnN0U3RhdGVtZW50LCB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsIGNvbW1lbnRUZXh0LCB0cnVlKTtcbiAgcmV0dXJuIHVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNmLCB0cy5jcmVhdGVOb2RlQXJyYXkoW3N5bnRoZXRpY0ZpcnN0U3RhdGVtZW50LCAuLi5zZi5zdGF0ZW1lbnRzXSkpO1xufVxuIl19