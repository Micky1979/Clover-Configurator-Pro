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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/rewriter", ["require", "exports", "tsickle/src/source_map_utils", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var source_map_utils_1 = require("tsickle/src/source_map_utils");
    var ts = require("tsickle/src/typescript");
    /**
     * A Rewriter manages iterating through a ts.SourceFile, copying input
     * to output while letting the subclass potentially alter some nodes
     * along the way by implementing maybeProcess().
     */
    var Rewriter = /** @class */ (function () {
        function Rewriter(file, sourceMapper) {
            if (sourceMapper === void 0) { sourceMapper = source_map_utils_1.NOOP_SOURCE_MAPPER; }
            this.file = file;
            this.sourceMapper = sourceMapper;
            this.output = [];
            /** Errors found while examining the code. */
            this.diagnostics = [];
            /** Current position in the output. */
            this.position = { line: 0, column: 0, position: 0 };
            /**
             * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
             * print statements.
             */
            this.indent = 0;
            /**
             * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
             * comments twice.
             */
            this.skipCommentsUpToOffset = -1;
        }
        Rewriter.prototype.getOutput = function (prefix) {
            if (this.indent !== 0) {
                throw new Error('visit() failed to track nesting');
            }
            var out = this.output.join('');
            if (prefix) {
                // Insert prefix after any leading trivia so that @fileoverview comments do not get broken.
                var firstCode = this.file.getStart();
                out = out.substring(0, firstCode) + prefix + out.substring(firstCode);
                this.sourceMapper.shiftByOffset(prefix.length);
            }
            return {
                output: out,
                diagnostics: this.diagnostics,
            };
        };
        /**
         * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
         */
        Rewriter.prototype.visit = function (node) {
            // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
            this.indent++;
            try {
                if (!this.maybeProcess(node)) {
                    this.writeNode(node);
                }
            }
            catch (e) {
                if (!e.message)
                    e.message = 'Unhandled error in tsickle';
                e.message += "\n at " + ts.SyntaxKind[node.kind] + " in " + this.file.fileName + ":";
                var _a = this.file.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                e.message += line + 1 + ":" + (character + 1);
                throw e;
            }
            this.indent--;
        };
        /**
         * maybeProcess lets subclasses optionally processes a node.
         *
         * @return True if the node has been handled and doesn't need to be traversed;
         *    false to have the node written and its children recursively visited.
         */
        Rewriter.prototype.maybeProcess = function (node) {
            return false;
        };
        /** writeNode writes a ts.Node, calling this.visit() on its children. */
        Rewriter.prototype.writeNode = function (node, skipComments, newLineIfCommentsStripped) {
            if (skipComments === void 0) { skipComments = false; }
            if (newLineIfCommentsStripped === void 0) { newLineIfCommentsStripped = true; }
            var pos = node.getFullStart();
            if (skipComments) {
                // To skip comments, we skip all whitespace/comments preceding
                // the node.  But if there was anything skipped we should emit
                // a newline in its place so that the node remains separated
                // from the previous node.  TODO: don't skip anything here if
                // there wasn't any comment.
                if (newLineIfCommentsStripped && node.getFullStart() < node.getStart()) {
                    this.emit('\n');
                }
                pos = node.getStart();
            }
            this.writeNodeFrom(node, pos);
        };
        Rewriter.prototype.writeNodeFrom = function (node, pos, end) {
            var _this = this;
            if (end === void 0) { end = node.getEnd(); }
            if (end <= this.skipCommentsUpToOffset) {
                return;
            }
            var oldSkipCommentsUpToOffset = this.skipCommentsUpToOffset;
            this.skipCommentsUpToOffset = Math.max(this.skipCommentsUpToOffset, pos);
            ts.forEachChild(node, function (child) {
                _this.writeRange(node, pos, child.getFullStart());
                _this.visit(child);
                pos = child.getEnd();
            });
            this.writeRange(node, pos, end);
            this.skipCommentsUpToOffset = oldSkipCommentsUpToOffset;
        };
        /**
         * Writes all leading trivia (whitespace or comments) on node, or all trivia up to the given
         * position. Also marks those trivia as "already emitted" by shifting the skipCommentsUpTo marker.
         */
        Rewriter.prototype.writeLeadingTrivia = function (node, upTo) {
            if (upTo === void 0) { upTo = 0; }
            var upToOffset = upTo || node.getStart();
            this.writeRange(node, node.getFullStart(), upTo || node.getStart());
            this.skipCommentsUpToOffset = upToOffset;
        };
        Rewriter.prototype.addSourceMapping = function (node) {
            this.writeRange(node, node.getEnd(), node.getEnd());
        };
        /**
         * Write a span of the input file as expressed by absolute offsets.
         * These offsets are found in attributes like node.getFullStart() and
         * node.getEnd().
         */
        Rewriter.prototype.writeRange = function (node, from, to) {
            var fullStart = node.getFullStart();
            var textStart = node.getStart();
            if (from >= fullStart && from < textStart) {
                from = Math.max(from, this.skipCommentsUpToOffset);
            }
            // Add a source mapping. writeRange(from, to) always corresponds to
            // original source code, so add a mapping at the current location that
            // points back to the location at `from`. The additional code generated
            // by tsickle will then be considered part of the last mapped code
            // section preceding it. That's arguably incorrect (e.g. for the fake
            // methods defining properties), but is good enough for stack traces.
            var pos = this.file.getLineAndCharacterOfPosition(from);
            this.sourceMapper.addMapping(node, { line: pos.line, column: pos.character, position: from }, this.position, to - from);
            // getSourceFile().getText() is wrong here because it has the text of
            // the SourceFile node of the AST, which doesn't contain the comments
            // preceding that node.  Semantically these ranges are just offsets
            // into the original source file text, so slice from that.
            var text = this.file.text.slice(from, to);
            if (text) {
                this.emit(text);
            }
        };
        Rewriter.prototype.emit = function (str) {
            this.output.push(str);
            try {
                for (var str_1 = __values(str), str_1_1 = str_1.next(); !str_1_1.done; str_1_1 = str_1.next()) {
                    var c = str_1_1.value;
                    this.position.column++;
                    if (c === '\n') {
                        this.position.line++;
                        this.position.column = 0;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (str_1_1 && !str_1_1.done && (_a = str_1.return)) _a.call(str_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.position.position += str.length;
            var e_1, _a;
        };
        /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
        Rewriter.prototype.escapeForComment = function (str) {
            return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
        };
        /* tslint:disable: no-unused-variable */
        Rewriter.prototype.logWithIndent = function (message) {
            /* tslint:enable: no-unused-variable */
            var prefix = new Array(this.indent + 1).join('| ');
            console.log(prefix + message);
        };
        /**
         * Produces a compiler error that references the Node's kind.  This is useful for the "else"
         * branch of code that is attempting to handle all possible input Node types, to ensure all cases
         * covered.
         */
        Rewriter.prototype.errorUnimplementedKind = function (node, where) {
            this.error(node, ts.SyntaxKind[node.kind] + " not implemented in " + where);
        };
        Rewriter.prototype.error = function (node, messageText) {
            this.diagnostics.push({
                file: node.getSourceFile(),
                start: node.getStart(),
                length: node.getEnd() - node.getStart(),
                messageText: messageText,
                category: ts.DiagnosticCategory.Error,
                code: 0,
            });
        };
        return Rewriter;
    }());
    exports.Rewriter = Rewriter;
    /** Returns the string contents of a ts.Identifier. */
    function getIdentifierText(identifier) {
        // NOTE: the 'text' property on an Identifier may be escaped if it starts
        // with '__', so just use getText().
        return identifier.getText();
    }
    exports.getIdentifierText = getIdentifierText;
    /** Returns a dot-joined qualified name (foo.bar.Baz). */
    function getEntityNameText(name) {
        if (ts.isIdentifier(name)) {
            return getIdentifierText(name);
        }
        return getEntityNameText(name.left) + '.' + getIdentifierText(name.right);
    }
    exports.getEntityNameText = getEntityNameText;
    /**
     * Converts an escaped TypeScript name into the original source name.
     * Prefer getIdentifierText() instead if possible.
     */
    function unescapeName(name) {
        // See the private function unescapeIdentifier in TypeScript's utilities.ts.
        if (name.match(/^___/))
            return name.substr(1);
        return name;
    }
    exports.unescapeName = unescapeName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV3cml0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmV3cml0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsaUVBQW9GO0lBQ3BGLDJDQUFtQztJQUVuQzs7OztPQUlHO0lBQ0g7UUFpQkUsa0JBQW1CLElBQW1CLEVBQVUsWUFBK0M7WUFBL0MsNkJBQUEsRUFBQSxlQUE2QixxQ0FBa0I7WUFBNUUsU0FBSSxHQUFKLElBQUksQ0FBZTtZQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFtQztZQWhCdkYsV0FBTSxHQUFhLEVBQUUsQ0FBQztZQUM5Qiw2Q0FBNkM7WUFDbkMsZ0JBQVcsR0FBb0IsRUFBRSxDQUFDO1lBQzVDLHNDQUFzQztZQUM5QixhQUFRLEdBQW1CLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQztZQUNyRTs7O2VBR0c7WUFDSyxXQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ25COzs7ZUFHRztZQUNLLDJCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBR3BDLENBQUM7UUFFRCw0QkFBUyxHQUFULFVBQVUsTUFBZTtZQUN2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWCwyRkFBMkY7Z0JBQzNGLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3ZDLEdBQUcs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Q29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05PT1BfU09VUkNFX01BUFBFUiwgU291cmNlTWFwcGVyLCBTb3VyY2VQb3NpdGlvbn0gZnJvbSAnLi9zb3VyY2VfbWFwX3V0aWxzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogQSBSZXdyaXRlciBtYW5hZ2VzIGl0ZXJhdGluZyB0aHJvdWdoIGEgdHMuU291cmNlRmlsZSwgY29weWluZyBpbnB1dFxuICogdG8gb3V0cHV0IHdoaWxlIGxldHRpbmcgdGhlIHN1YmNsYXNzIHBvdGVudGlhbGx5IGFsdGVyIHNvbWUgbm9kZXNcbiAqIGFsb25nIHRoZSB3YXkgYnkgaW1wbGVtZW50aW5nIG1heWJlUHJvY2VzcygpLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmV3cml0ZXIge1xuICBwcml2YXRlIG91dHB1dDogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEVycm9ycyBmb3VuZCB3aGlsZSBleGFtaW5pbmcgdGhlIGNvZGUuICovXG4gIHByb3RlY3RlZCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gIC8qKiBDdXJyZW50IHBvc2l0aW9uIGluIHRoZSBvdXRwdXQuICovXG4gIHByaXZhdGUgcG9zaXRpb246IFNvdXJjZVBvc2l0aW9uID0ge2xpbmU6IDAsIGNvbHVtbjogMCwgcG9zaXRpb246IDB9O1xuICAvKipcbiAgICogVGhlIGN1cnJlbnQgbGV2ZWwgb2YgcmVjdXJzaW9uIHRocm91Z2ggVHlwZVNjcmlwdCBOb2Rlcy4gIFVzZWQgaW4gZm9ybWF0dGluZyBpbnRlcm5hbCBkZWJ1Z1xuICAgKiBwcmludCBzdGF0ZW1lbnRzLlxuICAgKi9cbiAgcHJpdmF0ZSBpbmRlbnQgPSAwO1xuICAvKipcbiAgICogU2tpcCBlbWl0dGluZyBhbnkgY29kZSBiZWZvcmUgdGhlIGdpdmVuIG9mZnNldC4gRS5nLiB1c2VkIHRvIGF2b2lkIGVtaXR0aW5nIEBmaWxlb3ZlcnZpZXdcbiAgICogY29tbWVudHMgdHdpY2UuXG4gICAqL1xuICBwcml2YXRlIHNraXBDb21tZW50c1VwVG9PZmZzZXQgPSAtMTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmlsZTogdHMuU291cmNlRmlsZSwgcHJpdmF0ZSBzb3VyY2VNYXBwZXI6IFNvdXJjZU1hcHBlciA9IE5PT1BfU09VUkNFX01BUFBFUikge1xuICB9XG5cbiAgZ2V0T3V0cHV0KHByZWZpeD86IHN0cmluZyk6IHtvdXRwdXQ6IHN0cmluZywgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXX0ge1xuICAgIGlmICh0aGlzLmluZGVudCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2aXNpdCgpIGZhaWxlZCB0byB0cmFjayBuZXN0aW5nJyk7XG4gICAgfVxuICAgIGxldCBvdXQgPSB0aGlzLm91dHB1dC5qb2luKCcnKTtcbiAgICBpZiAocHJlZml4KSB7XG4gICAgICAvLyBJbnNlcnQgcHJlZml4IGFmdGVyIGFueSBsZWFkaW5nIHRyaXZpYSBzbyB0aGF0IEBmaWxlb3ZlcnZpZXcgY29tbWVudHMgZG8gbm90IGdldCBicm9rZW4uXG4gICAgICBjb25zdCBmaXJzdENvZGUgPSB0aGlzLmZpbGUuZ2V0U3RhcnQoKTtcbiAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcoMCwgZmlyc3RDb2RlKSArIHByZWZpeCArIG91dC5zdWJzdHJpbmcoZmlyc3RDb2RlKTtcbiAgICAgIHRoaXMuc291cmNlTWFwcGVyLnNoaWZ0QnlPZmZzZXQocHJlZml4Lmxlbmd0aCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBvdXRwdXQ6IG91dCxcbiAgICAgIGRpYWdub3N0aWNzOiB0aGlzLmRpYWdub3N0aWNzLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogdmlzaXQgdHJhdmVyc2VzIGEgTm9kZSwgcmVjdXJzaXZlbHkgd3JpdGluZyBhbGwgbm9kZXMgbm90IGhhbmRsZWQgYnkgdGhpcy5tYXliZVByb2Nlc3MuXG4gICAqL1xuICB2aXNpdChub2RlOiB0cy5Ob2RlKSB7XG4gICAgLy8gdGhpcy5sb2dXaXRoSW5kZW50KCdub2RlOiAnICsgdHMuU3ludGF4S2luZFtub2RlLmtpbmRdKTtcbiAgICB0aGlzLmluZGVudCsrO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMubWF5YmVQcm9jZXNzKG5vZGUpKSB7XG4gICAgICAgIHRoaXMud3JpdGVOb2RlKG5vZGUpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICghZS5tZXNzYWdlKSBlLm1lc3NhZ2UgPSAnVW5oYW5kbGVkIGVycm9yIGluIHRzaWNrbGUnO1xuICAgICAgZS5tZXNzYWdlICs9IGBcXG4gYXQgJHt0cy5TeW50YXhLaW5kW25vZGUua2luZF19IGluICR7dGhpcy5maWxlLmZpbGVOYW1lfTpgO1xuICAgICAgY29uc3Qge2xpbmUsIGNoYXJhY3Rlcn0gPSB0aGlzLmZpbGUuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24obm9kZS5nZXRTdGFydCgpKTtcbiAgICAgIGUubWVzc2FnZSArPSBgJHtsaW5lICsgMX06JHtjaGFyYWN0ZXIgKyAxfWA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICB0aGlzLmluZGVudC0tO1xuICB9XG5cbiAgLyoqXG4gICAqIG1heWJlUHJvY2VzcyBsZXRzIHN1YmNsYXNzZXMgb3B0aW9uYWxseSBwcm9jZXNzZXMgYSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgaGFzIGJlZW4gaGFuZGxlZCBhbmQgZG9lc24ndCBuZWVkIHRvIGJlIHRyYXZlcnNlZDtcbiAgICogICAgZmFsc2UgdG8gaGF2ZSB0aGUgbm9kZSB3cml0dGVuIGFuZCBpdHMgY2hpbGRyZW4gcmVjdXJzaXZlbHkgdmlzaXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBtYXliZVByb2Nlc3Mobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiB3cml0ZU5vZGUgd3JpdGVzIGEgdHMuTm9kZSwgY2FsbGluZyB0aGlzLnZpc2l0KCkgb24gaXRzIGNoaWxkcmVuLiAqL1xuICB3cml0ZU5vZGUobm9kZTogdHMuTm9kZSwgc2tpcENvbW1lbnRzID0gZmFsc2UsIG5ld0xpbmVJZkNvbW1lbnRzU3RyaXBwZWQgPSB0cnVlKSB7XG4gICAgbGV0IHBvcyA9IG5vZGUuZ2V0RnVsbFN0YXJ0KCk7XG4gICAgaWYgKHNraXBDb21tZW50cykge1xuICAgICAgLy8gVG8gc2tpcCBjb21tZW50cywgd2Ugc2tpcCBhbGwgd2hpdGVzcGFjZS9jb21tZW50cyBwcmVjZWRpbmdcbiAgICAgIC8vIHRoZSBub2RlLiAgQnV0IGlmIHRoZXJlIHdhcyBhbnl0aGluZyBza2lwcGVkIHdlIHNob3VsZCBlbWl0XG4gICAgICAvLyBhIG5ld2xpbmUgaW4gaXRzIHBsYWNlIHNvIHRoYXQgdGhlIG5vZGUgcmVtYWlucyBzZXBhcmF0ZWRcbiAgICAgIC8vIGZyb20gdGhlIHByZXZpb3VzIG5vZGUuICBUT0RPOiBkb24ndCBza2lwIGFueXRoaW5nIGhlcmUgaWZcbiAgICAgIC8vIHRoZXJlIHdhc24ndCBhbnkgY29tbWVudC5cbiAgICAgIGlmIChuZXdMaW5lSWZDb21tZW50c1N0cmlwcGVkICYmIG5vZGUuZ2V0RnVsbFN0YXJ0KCkgPCBub2RlLmdldFN0YXJ0KCkpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHBvcyA9IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICB9XG4gICAgdGhpcy53cml0ZU5vZGVGcm9tKG5vZGUsIHBvcyk7XG4gIH1cblxuICB3cml0ZU5vZGVGcm9tKG5vZGU6IHRzLk5vZGUsIHBvczogbnVtYmVyLCBlbmQgPSBub2RlLmdldEVuZCgpKSB7XG4gICAgaWYgKGVuZCA8PSB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkU2tpcENvbW1lbnRzVXBUb09mZnNldCA9IHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldDtcbiAgICB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQgPSBNYXRoLm1heCh0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQsIHBvcyk7XG4gICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIGNoaWxkID0+IHtcbiAgICAgIHRoaXMud3JpdGVSYW5nZShub2RlLCBwb3MsIGNoaWxkLmdldEZ1bGxTdGFydCgpKTtcbiAgICAgIHRoaXMudmlzaXQoY2hpbGQpO1xuICAgICAgcG9zID0gY2hpbGQuZ2V0RW5kKCk7XG4gICAgfSk7XG4gICAgdGhpcy53cml0ZVJhbmdlKG5vZGUsIHBvcywgZW5kKTtcbiAgICB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQgPSBvbGRTa2lwQ29tbWVudHNVcFRvT2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFdyaXRlcyBhbGwgbGVhZGluZyB0cml2aWEgKHdoaXRlc3BhY2Ugb3IgY29tbWVudHMpIG9uIG5vZGUsIG9yIGFsbCB0cml2aWEgdXAgdG8gdGhlIGdpdmVuXG4gICAqIHBvc2l0aW9uLiBBbHNvIG1hcmtzIHRob3NlIHRyaXZpYSBhcyBcImFscmVhZHkgZW1pdHRlZFwiIGJ5IHNoaWZ0aW5nIHRoZSBza2lwQ29tbWVudHNVcFRvIG1hcmtlci5cbiAgICovXG4gIHdyaXRlTGVhZGluZ1RyaXZpYShub2RlOiB0cy5Ob2RlLCB1cFRvID0gMCkge1xuICAgIGNvbnN0IHVwVG9PZmZzZXQgPSB1cFRvIHx8IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICB0aGlzLndyaXRlUmFuZ2Uobm9kZSwgbm9kZS5nZXRGdWxsU3RhcnQoKSwgdXBUbyB8fCBub2RlLmdldFN0YXJ0KCkpO1xuICAgIHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCA9IHVwVG9PZmZzZXQ7XG4gIH1cblxuICBhZGRTb3VyY2VNYXBwaW5nKG5vZGU6IHRzLk5vZGUpIHtcbiAgICB0aGlzLndyaXRlUmFuZ2Uobm9kZSwgbm9kZS5nZXRFbmQoKSwgbm9kZS5nZXRFbmQoKSk7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGUgYSBzcGFuIG9mIHRoZSBpbnB1dCBmaWxlIGFzIGV4cHJlc3NlZCBieSBhYnNvbHV0ZSBvZmZzZXRzLlxuICAgKiBUaGVzZSBvZmZzZXRzIGFyZSBmb3VuZCBpbiBhdHRyaWJ1dGVzIGxpa2Ugbm9kZS5nZXRGdWxsU3RhcnQoKSBhbmRcbiAgICogbm9kZS5nZXRFbmQoKS5cbiAgICovXG4gIHdyaXRlUmFuZ2Uobm9kZTogdHMuTm9kZSwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKSB7XG4gICAgY29uc3QgZnVsbFN0YXJ0ID0gbm9kZS5nZXRGdWxsU3RhcnQoKTtcbiAgICBjb25zdCB0ZXh0U3RhcnQgPSBub2RlLmdldFN0YXJ0KCk7XG4gICAgaWYgKGZyb20gPj0gZnVsbFN0YXJ0ICYmIGZyb20gPCB0ZXh0U3RhcnQpIHtcbiAgICAgIGZyb20gPSBNYXRoLm1heChmcm9tLCB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQpO1xuICAgIH1cbiAgICAvLyBBZGQgYSBzb3VyY2UgbWFwcGluZy4gd3JpdGVSYW5nZShmcm9tLCB0bykgYWx3YXlzIGNvcnJlc3BvbmRzIHRvXG4gICAgLy8gb3JpZ2luYWwgc291cmNlIGNvZGUsIHNvIGFkZCBhIG1hcHBpbmcgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gdGhhdFxuICAgIC8vIHBvaW50cyBiYWNrIHRvIHRoZSBsb2NhdGlvbiBhdCBgZnJvbWAuIFRoZSBhZGRpdGlvbmFsIGNvZGUgZ2VuZXJhdGVkXG4gICAgLy8gYnkgdHNpY2tsZSB3aWxsIHRoZW4gYmUgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBsYXN0IG1hcHBlZCBjb2RlXG4gICAgLy8gc2VjdGlvbiBwcmVjZWRpbmcgaXQuIFRoYXQncyBhcmd1YWJseSBpbmNvcnJlY3QgKGUuZy4gZm9yIHRoZSBmYWtlXG4gICAgLy8gbWV0aG9kcyBkZWZpbmluZyBwcm9wZXJ0aWVzKSwgYnV0IGlzIGdvb2QgZW5vdWdoIGZvciBzdGFjayB0cmFjZXMuXG4gICAgY29uc3QgcG9zID0gdGhpcy5maWxlLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKGZyb20pO1xuICAgIHRoaXMuc291cmNlTWFwcGVyLmFkZE1hcHBpbmcoXG4gICAgICAgIG5vZGUsIHtsaW5lOiBwb3MubGluZSwgY29sdW1uOiBwb3MuY2hhcmFjdGVyLCBwb3NpdGlvbjogZnJvbX0sIHRoaXMucG9zaXRpb24sIHRvIC0gZnJvbSk7XG4gICAgLy8gZ2V0U291cmNlRmlsZSgpLmdldFRleHQoKSBpcyB3cm9uZyBoZXJlIGJlY2F1c2UgaXQgaGFzIHRoZSB0ZXh0IG9mXG4gICAgLy8gdGhlIFNvdXJjZUZpbGUgbm9kZSBvZiB0aGUgQVNULCB3aGljaCBkb2Vzbid0IGNvbnRhaW4gdGhlIGNvbW1lbnRzXG4gICAgLy8gcHJlY2VkaW5nIHRoYXQgbm9kZS4gIFNlbWFudGljYWxseSB0aGVzZSByYW5nZXMgYXJlIGp1c3Qgb2Zmc2V0c1xuICAgIC8vIGludG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIHRleHQsIHNvIHNsaWNlIGZyb20gdGhhdC5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5maWxlLnRleHQuc2xpY2UoZnJvbSwgdG8pO1xuICAgIGlmICh0ZXh0KSB7XG4gICAgICB0aGlzLmVtaXQodGV4dCk7XG4gICAgfVxuICB9XG5cbiAgZW1pdChzdHI6IHN0cmluZykge1xuICAgIHRoaXMub3V0cHV0LnB1c2goc3RyKTtcbiAgICBmb3IgKGNvbnN0IGMgb2Ygc3RyKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uLmNvbHVtbisrO1xuICAgICAgaWYgKGMgPT09ICdcXG4nKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24ubGluZSsrO1xuICAgICAgICB0aGlzLnBvc2l0aW9uLmNvbHVtbiA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24ucG9zaXRpb24gKz0gc3RyLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGNvbW1lbnQgbWV0YWNoYXJhY3RlcnMgZnJvbSBhIHN0cmluZywgdG8gbWFrZSBpdCBzYWZlIHRvIGVtYmVkIGluIGEgY29tbWVudC4gKi9cbiAgZXNjYXBlRm9yQ29tbWVudChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC9cXCovZywgJ19fJykucmVwbGFjZSgvXFwqXFwvL2csICdfXycpO1xuICB9XG5cbiAgLyogdHNsaW50OmRpc2FibGU6IG5vLXVudXNlZC12YXJpYWJsZSAqL1xuICBsb2dXaXRoSW5kZW50KG1lc3NhZ2U6IHN0cmluZykge1xuICAgIC8qIHRzbGludDplbmFibGU6IG5vLXVudXNlZC12YXJpYWJsZSAqL1xuICAgIGNvbnN0IHByZWZpeCA9IG5ldyBBcnJheSh0aGlzLmluZGVudCArIDEpLmpvaW4oJ3wgJyk7XG4gICAgY29uc29sZS5sb2cocHJlZml4ICsgbWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBjb21waWxlciBlcnJvciB0aGF0IHJlZmVyZW5jZXMgdGhlIE5vZGUncyBraW5kLiAgVGhpcyBpcyB1c2VmdWwgZm9yIHRoZSBcImVsc2VcIlxuICAgKiBicmFuY2ggb2YgY29kZSB0aGF0IGlzIGF0dGVtcHRpbmcgdG8gaGFuZGxlIGFsbCBwb3NzaWJsZSBpbnB1dCBOb2RlIHR5cGVzLCB0byBlbnN1cmUgYWxsIGNhc2VzXG4gICAqIGNvdmVyZWQuXG4gICAqL1xuICBlcnJvclVuaW1wbGVtZW50ZWRLaW5kKG5vZGU6IHRzLk5vZGUsIHdoZXJlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVycm9yKG5vZGUsIGAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX0gbm90IGltcGxlbWVudGVkIGluICR7d2hlcmV9YCk7XG4gIH1cblxuICBlcnJvcihub2RlOiB0cy5Ob2RlLCBtZXNzYWdlVGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgIGZpbGU6IG5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgc3RhcnQ6IG5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIGxlbmd0aDogbm9kZS5nZXRFbmQoKSAtIG5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIG1lc3NhZ2VUZXh0LFxuICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgIGNvZGU6IDAsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqIFJldHVybnMgdGhlIHN0cmluZyBjb250ZW50cyBvZiBhIHRzLklkZW50aWZpZXIuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRlbnRpZmllclRleHQoaWRlbnRpZmllcjogdHMuSWRlbnRpZmllcik6IHN0cmluZyB7XG4gIC8vIE5PVEU6IHRoZSAndGV4dCcgcHJvcGVydHkgb24gYW4gSWRlbnRpZmllciBtYXkgYmUgZXNjYXBlZCBpZiBpdCBzdGFydHNcbiAgLy8gd2l0aCAnX18nLCBzbyBqdXN0IHVzZSBnZXRUZXh0KCkuXG4gIHJldHVybiBpZGVudGlmaWVyLmdldFRleHQoKTtcbn1cblxuLyoqIFJldHVybnMgYSBkb3Qtam9pbmVkIHF1YWxpZmllZCBuYW1lIChmb28uYmFyLkJheikuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW50aXR5TmFtZVRleHQobmFtZTogdHMuRW50aXR5TmFtZSk6IHN0cmluZyB7XG4gIGlmICh0cy5pc0lkZW50aWZpZXIobmFtZSkpIHtcbiAgICByZXR1cm4gZ2V0SWRlbnRpZmllclRleHQobmFtZSk7XG4gIH1cbiAgcmV0dXJuIGdldEVudGl0eU5hbWVUZXh0KG5hbWUubGVmdCkgKyAnLicgKyBnZXRJZGVudGlmaWVyVGV4dChuYW1lLnJpZ2h0KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBlc2NhcGVkIFR5cGVTY3JpcHQgbmFtZSBpbnRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgbmFtZS5cbiAqIFByZWZlciBnZXRJZGVudGlmaWVyVGV4dCgpIGluc3RlYWQgaWYgcG9zc2libGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZU5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gU2VlIHRoZSBwcml2YXRlIGZ1bmN0aW9uIHVuZXNjYXBlSWRlbnRpZmllciBpbiBUeXBlU2NyaXB0J3MgdXRpbGl0aWVzLnRzLlxuICBpZiAobmFtZS5tYXRjaCgvXl9fXy8pKSByZXR1cm4gbmFtZS5zdWJzdHIoMSk7XG4gIHJldHVybiBuYW1lO1xufVxuIl19