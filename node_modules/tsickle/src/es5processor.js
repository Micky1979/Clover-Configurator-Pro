/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        define("tsickle/src/es5processor", ["require", "exports", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/rewriter", "tsickle/src/typescript", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var rewriter_1 = require("tsickle/src/rewriter");
    var ts = require("tsickle/src/typescript");
    var util_1 = require("tsickle/src/util");
    /**
     * Extracts the namespace part of a goog: import, or returns null if the given
     * import is not a goog: import.
     */
    function extractGoogNamespaceImport(tsImport) {
        if (tsImport.match(/^goog:/))
            return tsImport.substring('goog:'.length);
        return null;
    }
    exports.extractGoogNamespaceImport = extractGoogNamespaceImport;
    /**
     * ES5Processor postprocesses TypeScript compilation output JS, to rewrite commonjs require()s into
     * goog.require(). Contrary to its name it handles converting the modules in both ES5 and ES6
     * outputs.
     */
    var ES5Processor = /** @class */ (function (_super) {
        __extends(ES5Processor, _super);
        function ES5Processor(host, file) {
            var _this = _super.call(this, file) || this;
            _this.host = host;
            /**
             * namespaceImports collects the variables for imported goog.modules.
             * If the original TS input is:
             *   import foo from 'goog:bar';
             * then TS produces:
             *   var foo = require('goog:bar');
             * and this class rewrites it to:
             *   var foo = require('goog.bar');
             * After this step, namespaceImports['foo'] is true.
             * (This is used to rewrite 'foo.default' into just 'foo'.)
             */
            _this.namespaceImports = new Set();
            /**
             * moduleVariables maps from module names to the variables they're assigned to.
             * Continuing the above example, moduleVariables['goog.bar'] = 'foo'.
             */
            _this.moduleVariables = new Map();
            /** strippedStrict is true once we've stripped a "use strict"; from the input. */
            _this.strippedStrict = false;
            /** unusedIndex is used to generate fresh symbols for unnamed imports. */
            _this.unusedIndex = 0;
            return _this;
        }
        ES5Processor.prototype.process = function () {
            this.emitFileComment();
            var moduleId = this.host.fileNameToModuleId(this.file.fileName);
            var moduleName = this.host.pathToModuleName('', this.file.fileName);
            // NB: No linebreak after module call so sourcemaps are not offset.
            this.emit("goog.module('" + moduleName + "');");
            if (this.host.prelude)
                this.emit(this.host.prelude);
            // Allow code to use `module.id` to discover its module URL, e.g. to resolve
            // a template URL against.
            // Uses 'var', as this code is inserted in ES6 and ES5 modes.
            // The following pattern ensures closure doesn't throw an error in advanced
            // optimizations mode.
            if (this.host.es5Mode) {
                this.emit("var module = module || {id: '" + moduleId + "'};");
            }
            else {
                // The `exports = {}` serves as a default export to disable Closure Compiler's error checking
                // for mutable exports. That's OK because TS compiler makes sure that consuming code always
                // accesses exports through the module object, so mutable exports work.
                // It is only inserted in ES6 because we strip `.default` accesses in ES5 mode, which breaks
                // when assigning an `exports = {}` object and then later accessing it.
                this.emit(" exports = {}; var module = {id: '" + moduleId + "'};");
            }
            var pos = 0;
            try {
                for (var _a = __values(this.file.statements), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var stmt = _b.value;
                    this.writeRange(this.file, pos, stmt.getFullStart());
                    this.visitTopLevel(stmt);
                    pos = stmt.getEnd();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.writeRange(this.file, pos, this.file.getEnd());
            var referencedModules = Array.from(this.moduleVariables.keys());
            // Note: don't sort referencedModules, as the keys are in the same order
            // they occur in the source file.
            var output = this.getOutput().output;
            return { output: output, referencedModules: referencedModules };
            var e_1, _c;
        };
        /**
         * Emits file comments for the current source file, if any.
         */
        ES5Processor.prototype.emitFileComment = function () {
            var _this = this;
            var leadingComments = ts.getLeadingCommentRanges(this.file.getFullText(), 0) || [];
            var fileComment = leadingComments.find(function (c) {
                if (c.kind !== ts.SyntaxKind.MultiLineCommentTrivia)
                    return false;
                var commentText = _this.file.getFullText().substring(c.pos, c.end);
                return fileoverview_comment_transformer_1.isClosureFileoverviewComment(commentText);
            });
            if (!fileComment)
                return;
            var end = fileComment.end;
            if (fileComment.hasTrailingNewLine)
                end++;
            this.writeLeadingTrivia(this.file, end);
        };
        /**
         * visitTopLevel processes a top-level ts.Node and emits its contents.
         *
         * It's separate from the normal Rewriter recursive traversal
         * because some top-level statements are handled specially.
         */
        ES5Processor.prototype.visitTopLevel = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.ExpressionStatement:
                    // Check for "use strict" and skip it if necessary.
                    if (!this.strippedStrict && this.isUseStrict(node)) {
                        this.emitCommentWithoutStatementBody(node);
                        this.strippedStrict = true;
                        return;
                    }
                    // Check for:
                    // - "require('foo');" (a require for its side effects)
                    // - "__export(require(...));" (an "export * from ...")
                    if (this.emitRewrittenRequires(node)) {
                        return;
                    }
                    // Check for
                    //   Object.defineProperty(exports, "__esModule", ...);
                    if (this.isEsModuleProperty(node)) {
                        this.emitCommentWithoutStatementBody(node);
                        return;
                    }
                    // Otherwise fall through to default processing.
                    break;
                case ts.SyntaxKind.VariableStatement:
                    // Check for a "var x = require('foo');".
                    if (this.emitRewrittenRequires(node))
                        return;
                    break;
                default:
                    break;
            }
            this.visit(node);
        };
        /**
         * The TypeScript AST attaches comments to statement nodes, so even if a node
         * contains code we want to skip emitting, we need to emit the attached
         * comment(s).
         */
        ES5Processor.prototype.emitCommentWithoutStatementBody = function (node) {
            this.writeLeadingTrivia(node);
        };
        /** isUseStrict returns true if node is a "use strict"; statement. */
        ES5Processor.prototype.isUseStrict = function (node) {
            if (node.kind !== ts.SyntaxKind.ExpressionStatement)
                return false;
            var exprStmt = node;
            var expr = exprStmt.expression;
            if (expr.kind !== ts.SyntaxKind.StringLiteral)
                return false;
            var literal = expr;
            return literal.text === 'use strict';
        };
        /**
         * emitRewrittenRequires rewrites require()s into goog.require() equivalents.
         *
         * @return True if the node was rewritten, false if needs ordinary processing.
         */
        ES5Processor.prototype.emitRewrittenRequires = function (node) {
            // We're looking for requires, of one of the forms:
            // - "var importName = require(...);".
            // - "require(...);".
            if (node.kind === ts.SyntaxKind.VariableStatement) {
                // It's possibly of the form "var x = require(...);".
                var varStmt = node;
                // Verify it's a single decl (and not "var x = ..., y = ...;").
                if (varStmt.declarationList.declarations.length !== 1)
                    return false;
                var decl = varStmt.declarationList.declarations[0];
                // Grab the variable name (avoiding things like destructuring binds).
                if (decl.name.kind !== ts.SyntaxKind.Identifier)
                    return false;
                var varName = rewriter_1.getIdentifierText(decl.name);
                if (!decl.initializer || decl.initializer.kind !== ts.SyntaxKind.CallExpression)
                    return false;
                var call = decl.initializer;
                var require_1 = this.isRequire(call);
                if (!require_1)
                    return false;
                this.writeLeadingTrivia(node);
                this.emitGoogRequire(varName, require_1);
                return true;
            }
            else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                // It's possibly of the form:
                // - require(...);
                // - __export(require(...));
                // - tslib_1.__exportStar(require(...));
                // All are CallExpressions.
                var exprStmt = node;
                var expr = exprStmt.expression;
                if (expr.kind !== ts.SyntaxKind.CallExpression)
                    return false;
                var call = expr;
                var require_2 = this.isRequire(call);
                var isExport = false;
                if (!require_2) {
                    // If it's an __export(require(...)), we emit:
                    //   var x = require(...);
                    //   __export(x);
                    // This extra variable is necessary in case there's a later import of the
                    // same module name.
                    var innerCall = this.isExportRequire(call);
                    if (!innerCall)
                        return false;
                    isExport = true;
                    call = innerCall; // Update call to point at the require() expression.
                    require_2 = this.isRequire(call);
                }
                if (!require_2)
                    return false;
                this.writeLeadingTrivia(node);
                var varName = this.emitGoogRequire(null, require_2);
                if (isExport) {
                    // node is a statement containing a require() in it, while
                    // requireCall is that call.  We replace the require() call
                    // with the variable we emitted.
                    var fullStatement = node.getText();
                    var requireCall = call.getText();
                    this.emit(fullStatement.replace(requireCall, varName));
                }
                return true;
            }
            else {
                // It's some other type of statement.
                return false;
            }
        };
        /**
         * Emits a goog.require() statement for a given variable name and TypeScript import.
         *
         * E.g. from:
         *   var varName = require('tsImport');
         * produces:
         *   var varName = goog.require('goog.module.name');
         *
         * If the input varName is null, generates a new variable name if necessary.
         *
         * @return The variable name for the imported module, reusing a previous import if one
         *    is available.
         */
        ES5Processor.prototype.emitGoogRequire = function (varName, tsImport) {
            var modName;
            var isNamespaceImport = false;
            var nsImport = extractGoogNamespaceImport(tsImport);
            if (nsImport !== null) {
                // This is a namespace import, of the form "goog:foo.bar".
                // Fix it to just "foo.bar".
                modName = nsImport;
                isNamespaceImport = true;
            }
            else {
                modName = this.host.pathToModuleName(this.file.fileName, tsImport);
            }
            if (!varName) {
                var mv = this.moduleVariables.get(modName);
                if (mv) {
                    // Caller didn't request a specific variable name and we've already
                    // imported the module, so just return the name we already have for this module.
                    return mv;
                }
                // Note: we always introduce a variable for any import, regardless of whether
                // the caller requested one.  This avoids a Closure error.
                varName = this.generateFreshVariableName();
            }
            if (isNamespaceImport)
                this.namespaceImports.add(varName);
            if (this.moduleVariables.has(modName)) {
                this.emit("var " + varName + " = " + this.moduleVariables.get(modName) + ";");
            }
            else {
                this.emit("var " + varName + " = goog.require('" + modName + "');");
                this.moduleVariables.set(modName, varName);
            }
            return varName;
        };
        // workaround for syntax highlighting bug in Sublime: `
        /**
         * Returns the string argument if call is of the form
         *   require('foo')
         */
        ES5Processor.prototype.isRequire = function (call) {
            // Verify that the call is a call to require(...).
            if (call.expression.kind !== ts.SyntaxKind.Identifier)
                return null;
            var ident = call.expression;
            if (rewriter_1.getIdentifierText(ident) !== 'require')
                return null;
            // Verify the call takes a single string argument and grab it.
            if (call.arguments.length !== 1)
                return null;
            var arg = call.arguments[0];
            if (arg.kind !== ts.SyntaxKind.StringLiteral)
                return null;
            return arg.text;
        };
        /**
         * Returns the require() call node if the outer call is of the forms:
         * - __export(require('foo'))
         * - tslib_1.__exportStar(require('foo'), bar)
         */
        ES5Processor.prototype.isExportRequire = function (call) {
            switch (call.expression.kind) {
                case ts.SyntaxKind.Identifier:
                    var ident = call.expression;
                    // TS_24_COMPAT: accept three leading underscores
                    if (ident.text !== '__export' && ident.text !== '___export') {
                        return null;
                    }
                    break;
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propAccess = call.expression;
                    // TS_24_COMPAT: accept three leading underscores
                    if (propAccess.name.text !== '__exportStar' && propAccess.name.text !== '___exportStar') {
                        return null;
                    }
                    break;
                default:
                    return null;
            }
            // Verify the call takes at least one argument and check it.
            if (call.arguments.length < 1)
                return null;
            var arg = call.arguments[0];
            if (arg.kind !== ts.SyntaxKind.CallExpression)
                return null;
            var innerCall = arg;
            if (!this.isRequire(innerCall))
                return null;
            return innerCall;
        };
        ES5Processor.prototype.isEsModuleProperty = function (expr) {
            // We're matching the explicit source text generated by the TS compiler.
            return expr.getText() === 'Object.defineProperty(exports, "__esModule", { value: true });';
        };
        /**
         * maybeProcess is called during the recursive traversal of the program's AST.
         *
         * @return True if the node was processed/emitted, false if it should be emitted as is.
         */
        ES5Processor.prototype.maybeProcess = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propAccess = node;
                    // We're looking for an expression of the form:
                    //   module_name_var.default
                    if (rewriter_1.getIdentifierText(propAccess.name) !== 'default')
                        break;
                    if (propAccess.expression.kind !== ts.SyntaxKind.Identifier)
                        break;
                    var lhs = rewriter_1.getIdentifierText(propAccess.expression);
                    if (!this.namespaceImports.has(lhs))
                        break;
                    // Emit the same expression, with spaces to replace the ".default" part
                    // so that source maps still line up.
                    this.writeLeadingTrivia(node);
                    this.emit(lhs + "        ");
                    return true;
                default:
                    break;
            }
            return false;
        };
        /** Generates a new variable name inside the tsickle_ namespace. */
        ES5Processor.prototype.generateFreshVariableName = function () {
            return "tsickle_module_" + this.unusedIndex++ + "_";
        };
        return ES5Processor;
    }(rewriter_1.Rewriter));
    /**
     * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
     * For use as a postprocessing step *after* TypeScript emits JavaScript.
     *
     * @param fileName The source file name.
     * @param moduleId The "module id", a module-identifying string that is
     *     the value module.id in the scope of the module.
     * @param pathToModuleName A function that maps a filesystem .ts path to a
     *     Closure module name, as found in a goog.require('...') statement.
     *     The context parameter is the referencing file, used for resolving
     *     imports with relative paths like "import * as foo from '../foo';".
     * @param prelude An additional prelude to insert after the `goog.module` call,
     *     e.g. with additional imports or requires.
     */
    function processES5(host, fileName, content) {
        var file = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5, true);
        return new ES5Processor(host, file).process();
    }
    exports.processES5 = processES5;
    function convertCommonJsToGoogModuleIfNeeded(host, modulesManifest, fileName, content) {
        if (!host.googmodule || util_1.isDtsFileName(fileName)) {
            return content;
        }
        var _a = processES5(host, fileName, content), output = _a.output, referencedModules = _a.referencedModules;
        var moduleName = host.pathToModuleName('', fileName);
        modulesManifest.addModule(fileName, moduleName);
        try {
            for (var referencedModules_1 = __values(referencedModules), referencedModules_1_1 = referencedModules_1.next(); !referencedModules_1_1.done; referencedModules_1_1 = referencedModules_1.next()) {
                var referenced = referencedModules_1_1.value;
                modulesManifest.addReferencedModule(fileName, referenced);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (referencedModules_1_1 && !referencedModules_1_1.done && (_b = referencedModules_1.return)) _b.call(referencedModules_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return output;
        var e_2, _b;
    }
    exports.convertCommonJsToGoogModuleIfNeeded = convertCommonJsToGoogModuleIfNeeded;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXM1cHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2VzNXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsaUdBQWdGO0lBRWhGLGlEQUF1RDtJQUN2RCwyQ0FBbUM7SUFDbkMseUNBQXFDO0lBd0JyQzs7O09BR0c7SUFDSCxvQ0FBMkMsUUFBZ0I7UUFDekQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUhELGdFQUdDO0lBRUQ7Ozs7T0FJRztJQUNIO1FBQTJCLGdDQUFRO1FBMEJqQyxzQkFBb0IsSUFBc0IsRUFBRSxJQUFtQjtZQUEvRCxZQUNFLGtCQUFNLElBQUksQ0FBQyxTQUNaO1lBRm1CLFVBQUksR0FBSixJQUFJLENBQWtCO1lBekIxQzs7Ozs7Ozs7OztlQVVHO1lBQ0gsc0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUVyQzs7O2VBR0c7WUFDSCxxQkFBZSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBRTVDLGlGQUFpRjtZQUNqRixvQkFBYyxHQUFHLEtBQUssQ0FBQztZQUV2Qix5RUFBeUU7WUFDekUsaUJBQVcsR0FBRyxDQUFDLENBQUM7O1FBSWhCLENBQUM7UUFFRCw4QkFBTyxHQUFQO1lBQ0UsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXZCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRSxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMs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aEQsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0ssSUFBQSx3Q0FBaUUsRUFBaEUsa0JBQU0sRUFBRSx3Q0FBaUIsQ0FBd0M7UUFFeEUsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RCxlQUFlLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzs7WUFDaEQsR0FBRyxDQUFDLENBQXFCLElBQUEsc0JBQUEsU0FBQSxpQkFBaUIsQ0FBQSxvREFBQTtnQkFBckMsSUFBTSxVQUFVLDhCQUFBO2dCQUNuQixlQUFlLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzNEOzs7Ozs7Ozs7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDOztJQUNoQixDQUFDO0lBZkQsa0ZBZUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNDbG9zdXJlRmlsZW92ZXJ2aWV3Q29tbWVudH0gZnJvbSAnLi9maWxlb3ZlcnZpZXdfY29tbWVudF90cmFuc2Zvcm1lcic7XG5pbXBvcnQge01vZHVsZXNNYW5pZmVzdH0gZnJvbSAnLi9tb2R1bGVzX21hbmlmZXN0JztcbmltcG9ydCB7Z2V0SWRlbnRpZmllclRleHQsIFJld3JpdGVyfSBmcm9tICcuL3Jld3JpdGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5pbXBvcnQge2lzRHRzRmlsZU5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXM1UHJvY2Vzc29ySG9zdCB7XG4gIC8qKlxuICAgKiBUYWtlcyBhIGNvbnRleHQgKHRoZSBjdXJyZW50IGZpbGUpIGFuZCB0aGUgcGF0aCBvZiB0aGUgZmlsZSB0byBpbXBvcnRcbiAgICogIGFuZCBnZW5lcmF0ZXMgYSBnb29nbW9kdWxlIG1vZHVsZSBuYW1lXG4gICAqL1xuICBwYXRoVG9Nb2R1bGVOYW1lKGNvbnRleHQ6IHN0cmluZywgaW1wb3J0UGF0aDogc3RyaW5nKTogc3RyaW5nO1xuICAvKipcbiAgICogSWYgd2UgZG8gZ29vZ21vZHVsZSBwcm9jZXNzaW5nLCB3ZSBwb2x5ZmlsbCBtb2R1bGUuaWQsIHNpbmNlIHRoYXQnc1xuICAgKiBwYXJ0IG9mIEVTNiBtb2R1bGVzLiAgVGhpcyBmdW5jdGlvbiBkZXRlcm1pbmVzIHdoYXQgdGhlIG1vZHVsZS5pZCB3aWxsIGJlXG4gICAqIGZvciBlYWNoIGZpbGUuXG4gICAqL1xuICBmaWxlTmFtZVRvTW9kdWxlSWQoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdG8gY29udmVydCBDb21tb25KUyBtb2R1bGUgc3ludGF4IHRvIGBnb29nLm1vZHVsZWAgQ2xvc3VyZSBpbXBvcnRzLiAqL1xuICBnb29nbW9kdWxlPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIGVtaXQgdGFyZ2V0cyBFUzUgb3IgRVM2Ky4gKi9cbiAgZXM1TW9kZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbiBhZGRpdGlvbmFsIHByZWx1ZGUgdG8gaW5zZXJ0IGluIGZyb250IG9mIHRoZSBlbWl0dGVkIGNvZGUsIGUuZy4gdG8gaW1wb3J0IGEgc2hhcmVkIGxpYnJhcnkuXG4gICAqL1xuICBwcmVsdWRlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBuYW1lc3BhY2UgcGFydCBvZiBhIGdvb2c6IGltcG9ydCwgb3IgcmV0dXJucyBudWxsIGlmIHRoZSBnaXZlblxuICogaW1wb3J0IGlzIG5vdCBhIGdvb2c6IGltcG9ydC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RHb29nTmFtZXNwYWNlSW1wb3J0KHRzSW1wb3J0OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICh0c0ltcG9ydC5tYXRjaCgvXmdvb2c6LykpIHJldHVybiB0c0ltcG9ydC5zdWJzdHJpbmcoJ2dvb2c6Jy5sZW5ndGgpO1xuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBFUzVQcm9jZXNzb3IgcG9zdHByb2Nlc3NlcyBUeXBlU2NyaXB0IGNvbXBpbGF0aW9uIG91dHB1dCBKUywgdG8gcmV3cml0ZSBjb21tb25qcyByZXF1aXJlKClzIGludG9cbiAqIGdvb2cucmVxdWlyZSgpLiBDb250cmFyeSB0byBpdHMgbmFtZSBpdCBoYW5kbGVzIGNvbnZlcnRpbmcgdGhlIG1vZHVsZXMgaW4gYm90aCBFUzUgYW5kIEVTNlxuICogb3V0cHV0cy5cbiAqL1xuY2xhc3MgRVM1UHJvY2Vzc29yIGV4dGVuZHMgUmV3cml0ZXIge1xuICAvKipcbiAgICogbmFtZXNwYWNlSW1wb3J0cyBjb2xsZWN0cyB0aGUgdmFyaWFibGVzIGZvciBpbXBvcnRlZCBnb29nLm1vZHVsZXMuXG4gICAqIElmIHRoZSBvcmlnaW5hbCBUUyBpbnB1dCBpczpcbiAgICogICBpbXBvcnQgZm9vIGZyb20gJ2dvb2c6YmFyJztcbiAgICogdGhlbiBUUyBwcm9kdWNlczpcbiAgICogICB2YXIgZm9vID0gcmVxdWlyZSgnZ29vZzpiYXInKTtcbiAgICogYW5kIHRoaXMgY2xhc3MgcmV3cml0ZXMgaXQgdG86XG4gICAqICAgdmFyIGZvbyA9IHJlcXVpcmUoJ2dvb2cuYmFyJyk7XG4gICAqIEFmdGVyIHRoaXMgc3RlcCwgbmFtZXNwYWNlSW1wb3J0c1snZm9vJ10gaXMgdHJ1ZS5cbiAgICogKFRoaXMgaXMgdXNlZCB0byByZXdyaXRlICdmb28uZGVmYXVsdCcgaW50byBqdXN0ICdmb28nLilcbiAgICovXG4gIG5hbWVzcGFjZUltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAvKipcbiAgICogbW9kdWxlVmFyaWFibGVzIG1hcHMgZnJvbSBtb2R1bGUgbmFtZXMgdG8gdGhlIHZhcmlhYmxlcyB0aGV5J3JlIGFzc2lnbmVkIHRvLlxuICAgKiBDb250aW51aW5nIHRoZSBhYm92ZSBleGFtcGxlLCBtb2R1bGVWYXJpYWJsZXNbJ2dvb2cuYmFyJ10gPSAnZm9vJy5cbiAgICovXG4gIG1vZHVsZVZhcmlhYmxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgLyoqIHN0cmlwcGVkU3RyaWN0IGlzIHRydWUgb25jZSB3ZSd2ZSBzdHJpcHBlZCBhIFwidXNlIHN0cmljdFwiOyBmcm9tIHRoZSBpbnB1dC4gKi9cbiAgc3RyaXBwZWRTdHJpY3QgPSBmYWxzZTtcblxuICAvKiogdW51c2VkSW5kZXggaXMgdXNlZCB0byBnZW5lcmF0ZSBmcmVzaCBzeW1ib2xzIGZvciB1bm5hbWVkIGltcG9ydHMuICovXG4gIHVudXNlZEluZGV4ID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IEVzNVByb2Nlc3Nvckhvc3QsIGZpbGU6IHRzLlNvdXJjZUZpbGUpIHtcbiAgICBzdXBlcihmaWxlKTtcbiAgfVxuXG4gIHByb2Nlc3MoKToge291dHB1dDogc3RyaW5nLCByZWZlcmVuY2VkTW9kdWxlczogc3RyaW5nW119IHtcbiAgICB0aGlzLmVtaXRGaWxlQ29tbWVudCgpO1xuXG4gICAgY29uc3QgbW9kdWxlSWQgPSB0aGlzLmhvc3QuZmlsZU5hbWVUb01vZHVsZUlkKHRoaXMuZmlsZS5maWxlTmFtZSk7XG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IHRoaXMuaG9zdC5wYXRoVG9Nb2R1bGVOYW1lKCcnLCB0aGlzLmZpbGUuZmlsZU5hbWUpO1xuICAgIC8vIE5COiBObyBsaW5lYnJlYWsgYWZ0ZXIgbW9kdWxlIGNhbGwgc28gc291cmNlbWFwcyBhcmUgbm90IG9mZnNldC5cbiAgICB0aGlzLmVtaXQoYGdvb2cubW9kdWxlKCcke21vZHVsZU5hbWV9Jyk7YCk7XG4gICAgaWYgKHRoaXMuaG9zdC5wcmVsdWRlKSB0aGlzLmVtaXQodGhpcy5ob3N0LnByZWx1ZGUpO1xuICAgIC8vIEFsbG93IGNvZGUgdG8gdXNlIGBtb2R1bGUuaWRgIHRvIGRpc2NvdmVyIGl0cyBtb2R1bGUgVVJMLCBlLmcuIHRvIHJlc29sdmVcbiAgICAvLyBhIHRlbXBsYXRlIFVSTCBhZ2FpbnN0LlxuICAgIC8vIFVzZXMgJ3ZhcicsIGFzIHRoaXMgY29kZSBpcyBpbnNlcnRlZCBpbiBFUzYgYW5kIEVTNSBtb2Rlcy5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHBhdHRlcm4gZW5zdXJlcyBjbG9zdXJlIGRvZXNuJ3QgdGhyb3cgYW4gZXJyb3IgaW4gYWR2YW5jZWRcbiAgICAvLyBvcHRpbWl6YXRpb25zIG1vZGUuXG4gICAgaWYgKHRoaXMuaG9zdC5lczVNb2RlKSB7XG4gICAgICB0aGlzLmVtaXQoYHZhciBtb2R1bGUgPSBtb2R1bGUgfHwge2lkOiAnJHttb2R1bGVJZH0nfTtgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGBleHBvcnRzID0ge31gIHNlcnZlcyBhcyBhIGRlZmF1bHQgZXhwb3J0IHRvIGRpc2FibGUgQ2xvc3VyZSBDb21waWxlcidzIGVycm9yIGNoZWNraW5nXG4gICAgICAvLyBmb3IgbXV0YWJsZSBleHBvcnRzLiBUaGF0J3MgT0sgYmVjYXVzZSBUUyBjb21waWxlciBtYWtlcyBzdXJlIHRoYXQgY29uc3VtaW5nIGNvZGUgYWx3YXlzXG4gICAgICAvLyBhY2Nlc3NlcyBleHBvcnRzIHRocm91Z2ggdGhlIG1vZHVsZSBvYmplY3QsIHNvIG11dGFibGUgZXhwb3J0cyB3b3JrLlxuICAgICAgLy8gSXQgaXMgb25seSBpbnNlcnRlZCBpbiBFUzYgYmVjYXVzZSB3ZSBzdHJpcCBgLmRlZmF1bHRgIGFjY2Vzc2VzIGluIEVTNSBtb2RlLCB3aGljaCBicmVha3NcbiAgICAgIC8vIHdoZW4gYXNzaWduaW5nIGFuIGBleHBvcnRzID0ge31gIG9iamVjdCBhbmQgdGhlbiBsYXRlciBhY2Nlc3NpbmcgaXQuXG4gICAgICB0aGlzLmVtaXQoYCBleHBvcnRzID0ge307IHZhciBtb2R1bGUgPSB7aWQ6ICcke21vZHVsZUlkfSd9O2ApO1xuICAgIH1cblxuICAgIGxldCBwb3MgPSAwO1xuICAgIGZvciAoY29uc3Qgc3RtdCBvZiB0aGlzLmZpbGUuc3RhdGVtZW50cykge1xuICAgICAgdGhpcy53cml0ZVJhbmdlKHRoaXMuZmlsZSwgcG9zLCBzdG10LmdldEZ1bGxTdGFydCgpKTtcbiAgICAgIHRoaXMudmlzaXRUb3BMZXZlbChzdG10KTtcbiAgICAgIHBvcyA9IHN0bXQuZ2V0RW5kKCk7XG4gICAgfVxuICAgIHRoaXMud3JpdGVSYW5nZSh0aGlzLmZpbGUsIHBvcywgdGhpcy5maWxlLmdldEVuZCgpKTtcblxuICAgIGNvbnN0IHJlZmVyZW5jZWRNb2R1bGVzID0gQXJyYXkuZnJvbSh0aGlzLm1vZHVsZVZhcmlhYmxlcy5rZXlzKCkpO1xuICAgIC8vIE5vdGU6IGRvbid0IHNvcnQgcmVmZXJlbmNlZE1vZHVsZXMsIGFzIHRoZSBrZXlzIGFyZSBpbiB0aGUgc2FtZSBvcmRlclxuICAgIC8vIHRoZXkgb2NjdXIgaW4gdGhlIHNvdXJjZSBmaWxlLlxuICAgIGNvbnN0IHtvdXRwdXR9ID0gdGhpcy5nZXRPdXRwdXQoKTtcbiAgICByZXR1cm4ge291dHB1dCwgcmVmZXJlbmNlZE1vZHVsZXN9O1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGZpbGUgY29tbWVudHMgZm9yIHRoZSBjdXJyZW50IHNvdXJjZSBmaWxlLCBpZiBhbnkuXG4gICAqL1xuICBwcml2YXRlIGVtaXRGaWxlQ29tbWVudCgpIHtcbiAgICBjb25zdCBsZWFkaW5nQ29tbWVudHMgPSB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyh0aGlzLmZpbGUuZ2V0RnVsbFRleHQoKSwgMCkgfHwgW107XG4gICAgY29uc3QgZmlsZUNvbW1lbnQgPSBsZWFkaW5nQ29tbWVudHMuZmluZChjID0+IHtcbiAgICAgIGlmIChjLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgY29tbWVudFRleHQgPSB0aGlzLmZpbGUuZ2V0RnVsbFRleHQoKS5zdWJzdHJpbmcoYy5wb3MsIGMuZW5kKTtcbiAgICAgIHJldHVybiBpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50KGNvbW1lbnRUZXh0KTtcbiAgICB9KTtcbiAgICBpZiAoIWZpbGVDb21tZW50KSByZXR1cm47XG4gICAgbGV0IGVuZCA9IGZpbGVDb21tZW50LmVuZDtcbiAgICBpZiAoZmlsZUNvbW1lbnQuaGFzVHJhaWxpbmdOZXdMaW5lKSBlbmQrKztcbiAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYSh0aGlzLmZpbGUsIGVuZCk7XG4gIH1cblxuICAvKipcbiAgICogdmlzaXRUb3BMZXZlbCBwcm9jZXNzZXMgYSB0b3AtbGV2ZWwgdHMuTm9kZSBhbmQgZW1pdHMgaXRzIGNvbnRlbnRzLlxuICAgKlxuICAgKiBJdCdzIHNlcGFyYXRlIGZyb20gdGhlIG5vcm1hbCBSZXdyaXRlciByZWN1cnNpdmUgdHJhdmVyc2FsXG4gICAqIGJlY2F1c2Ugc29tZSB0b3AtbGV2ZWwgc3RhdGVtZW50cyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAqL1xuICB2aXNpdFRvcExldmVsKG5vZGU6IHRzLk5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQ6XG4gICAgICAgIC8vIENoZWNrIGZvciBcInVzZSBzdHJpY3RcIiBhbmQgc2tpcCBpdCBpZiBuZWNlc3NhcnkuXG4gICAgICAgIGlmICghdGhpcy5zdHJpcHBlZFN0cmljdCAmJiB0aGlzLmlzVXNlU3RyaWN0KG5vZGUpKSB7XG4gICAgICAgICAgdGhpcy5lbWl0Q29tbWVudFdpdGhvdXRTdGF0ZW1lbnRCb2R5KG5vZGUpO1xuICAgICAgICAgIHRoaXMuc3RyaXBwZWRTdHJpY3QgPSB0cnVlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3I6XG4gICAgICAgIC8vIC0gXCJyZXF1aXJlKCdmb28nKTtcIiAoYSByZXF1aXJlIGZvciBpdHMgc2lkZSBlZmZlY3RzKVxuICAgICAgICAvLyAtIFwiX19leHBvcnQocmVxdWlyZSguLi4pKTtcIiAoYW4gXCJleHBvcnQgKiBmcm9tIC4uLlwiKVxuICAgICAgICBpZiAodGhpcy5lbWl0UmV3cml0dGVuUmVxdWlyZXMobm9kZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yXG4gICAgICAgIC8vICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCAuLi4pO1xuICAgICAgICBpZiAodGhpcy5pc0VzTW9kdWxlUHJvcGVydHkobm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50KSkge1xuICAgICAgICAgIHRoaXMuZW1pdENvbW1lbnRXaXRob3V0U3RhdGVtZW50Qm9keShub2RlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGZhbGwgdGhyb3VnaCB0byBkZWZhdWx0IHByb2Nlc3NpbmcuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50OlxuICAgICAgICAvLyBDaGVjayBmb3IgYSBcInZhciB4ID0gcmVxdWlyZSgnZm9vJyk7XCIuXG4gICAgICAgIGlmICh0aGlzLmVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlKSkgcmV0dXJuO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLnZpc2l0KG5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBUeXBlU2NyaXB0IEFTVCBhdHRhY2hlcyBjb21tZW50cyB0byBzdGF0ZW1lbnQgbm9kZXMsIHNvIGV2ZW4gaWYgYSBub2RlXG4gICAqIGNvbnRhaW5zIGNvZGUgd2Ugd2FudCB0byBza2lwIGVtaXR0aW5nLCB3ZSBuZWVkIHRvIGVtaXQgdGhlIGF0dGFjaGVkXG4gICAqIGNvbW1lbnQocykuXG4gICAqL1xuICBlbWl0Q29tbWVudFdpdGhvdXRTdGF0ZW1lbnRCb2R5KG5vZGU6IHRzLk5vZGUpIHtcbiAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgfVxuXG4gIC8qKiBpc1VzZVN0cmljdCByZXR1cm5zIHRydWUgaWYgbm9kZSBpcyBhIFwidXNlIHN0cmljdFwiOyBzdGF0ZW1lbnQuICovXG4gIGlzVXNlU3RyaWN0KG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICBpZiAobm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBleHByU3RtdCA9IG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICBjb25zdCBleHByID0gZXhwclN0bXQuZXhwcmVzc2lvbjtcbiAgICBpZiAoZXhwci5raW5kICE9PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsaXRlcmFsID0gZXhwciBhcyB0cy5TdHJpbmdMaXRlcmFsO1xuICAgIHJldHVybiBsaXRlcmFsLnRleHQgPT09ICd1c2Ugc3RyaWN0JztcbiAgfVxuXG4gIC8qKlxuICAgKiBlbWl0UmV3cml0dGVuUmVxdWlyZXMgcmV3cml0ZXMgcmVxdWlyZSgpcyBpbnRvIGdvb2cucmVxdWlyZSgpIGVxdWl2YWxlbnRzLlxuICAgKlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgd2FzIHJld3JpdHRlbiwgZmFsc2UgaWYgbmVlZHMgb3JkaW5hcnkgcHJvY2Vzc2luZy5cbiAgICovXG4gIGVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgLy8gV2UncmUgbG9va2luZyBmb3IgcmVxdWlyZXMsIG9mIG9uZSBvZiB0aGUgZm9ybXM6XG4gICAgLy8gLSBcInZhciBpbXBvcnROYW1lID0gcmVxdWlyZSguLi4pO1wiLlxuICAgIC8vIC0gXCJyZXF1aXJlKC4uLik7XCIuXG4gICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xuICAgICAgLy8gSXQncyBwb3NzaWJseSBvZiB0aGUgZm9ybSBcInZhciB4ID0gcmVxdWlyZSguLi4pO1wiLlxuICAgICAgY29uc3QgdmFyU3RtdCA9IG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQ7XG5cbiAgICAgIC8vIFZlcmlmeSBpdCdzIGEgc2luZ2xlIGRlY2wgKGFuZCBub3QgXCJ2YXIgeCA9IC4uLiwgeSA9IC4uLjtcIikuXG4gICAgICBpZiAodmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgZGVjbCA9IHZhclN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXTtcblxuICAgICAgLy8gR3JhYiB0aGUgdmFyaWFibGUgbmFtZSAoYXZvaWRpbmcgdGhpbmdzIGxpa2UgZGVzdHJ1Y3R1cmluZyBiaW5kcykuXG4gICAgICBpZiAoZGVjbC5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgdmFyTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KGRlY2wubmFtZSBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICAgIGlmICghZGVjbC5pbml0aWFsaXplciB8fCBkZWNsLmluaXRpYWxpemVyLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IGNhbGwgPSBkZWNsLmluaXRpYWxpemVyIGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICAgICAgY29uc3QgcmVxdWlyZSA9IHRoaXMuaXNSZXF1aXJlKGNhbGwpO1xuICAgICAgaWYgKCFyZXF1aXJlKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgIHRoaXMuZW1pdEdvb2dSZXF1aXJlKHZhck5hbWUsIHJlcXVpcmUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgLy8gSXQncyBwb3NzaWJseSBvZiB0aGUgZm9ybTpcbiAgICAgIC8vIC0gcmVxdWlyZSguLi4pO1xuICAgICAgLy8gLSBfX2V4cG9ydChyZXF1aXJlKC4uLikpO1xuICAgICAgLy8gLSB0c2xpYl8xLl9fZXhwb3J0U3RhcihyZXF1aXJlKC4uLikpO1xuICAgICAgLy8gQWxsIGFyZSBDYWxsRXhwcmVzc2lvbnMuXG4gICAgICBjb25zdCBleHByU3RtdCA9IG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICAgIGNvbnN0IGV4cHIgPSBleHByU3RtdC5leHByZXNzaW9uO1xuICAgICAgaWYgKGV4cHIua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikgcmV0dXJuIGZhbHNlO1xuICAgICAgbGV0IGNhbGwgPSBleHByIGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuXG4gICAgICBsZXQgcmVxdWlyZSA9IHRoaXMuaXNSZXF1aXJlKGNhbGwpO1xuICAgICAgbGV0IGlzRXhwb3J0ID0gZmFsc2U7XG4gICAgICBpZiAoIXJlcXVpcmUpIHtcbiAgICAgICAgLy8gSWYgaXQncyBhbiBfX2V4cG9ydChyZXF1aXJlKC4uLikpLCB3ZSBlbWl0OlxuICAgICAgICAvLyAgIHZhciB4ID0gcmVxdWlyZSguLi4pO1xuICAgICAgICAvLyAgIF9fZXhwb3J0KHgpO1xuICAgICAgICAvLyBUaGlzIGV4dHJhIHZhcmlhYmxlIGlzIG5lY2Vzc2FyeSBpbiBjYXNlIHRoZXJlJ3MgYSBsYXRlciBpbXBvcnQgb2YgdGhlXG4gICAgICAgIC8vIHNhbWUgbW9kdWxlIG5hbWUuXG4gICAgICAgIGNvbnN0IGlubmVyQ2FsbCA9IHRoaXMuaXNFeHBvcnRSZXF1aXJlKGNhbGwpO1xuICAgICAgICBpZiAoIWlubmVyQ2FsbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpc0V4cG9ydCA9IHRydWU7XG4gICAgICAgIGNhbGwgPSBpbm5lckNhbGw7ICAvLyBVcGRhdGUgY2FsbCB0byBwb2ludCBhdCB0aGUgcmVxdWlyZSgpIGV4cHJlc3Npb24uXG4gICAgICAgIHJlcXVpcmUgPSB0aGlzLmlzUmVxdWlyZShjYWxsKTtcbiAgICAgIH1cbiAgICAgIGlmICghcmVxdWlyZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgIGNvbnN0IHZhck5hbWUgPSB0aGlzLmVtaXRHb29nUmVxdWlyZShudWxsLCByZXF1aXJlKTtcblxuICAgICAgaWYgKGlzRXhwb3J0KSB7XG4gICAgICAgIC8vIG5vZGUgaXMgYSBzdGF0ZW1lbnQgY29udGFpbmluZyBhIHJlcXVpcmUoKSBpbiBpdCwgd2hpbGVcbiAgICAgICAgLy8gcmVxdWlyZUNhbGwgaXMgdGhhdCBjYWxsLiAgV2UgcmVwbGFjZSB0aGUgcmVxdWlyZSgpIGNhbGxcbiAgICAgICAgLy8gd2l0aCB0aGUgdmFyaWFibGUgd2UgZW1pdHRlZC5cbiAgICAgICAgY29uc3QgZnVsbFN0YXRlbWVudCA9IG5vZGUuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCByZXF1aXJlQ2FsbCA9IGNhbGwuZ2V0VGV4dCgpO1xuICAgICAgICB0aGlzLmVtaXQoZnVsbFN0YXRlbWVudC5yZXBsYWNlKHJlcXVpcmVDYWxsLCB2YXJOYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSXQncyBzb21lIG90aGVyIHR5cGUgb2Ygc3RhdGVtZW50LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGdvb2cucmVxdWlyZSgpIHN0YXRlbWVudCBmb3IgYSBnaXZlbiB2YXJpYWJsZSBuYW1lIGFuZCBUeXBlU2NyaXB0IGltcG9ydC5cbiAgICpcbiAgICogRS5nLiBmcm9tOlxuICAgKiAgIHZhciB2YXJOYW1lID0gcmVxdWlyZSgndHNJbXBvcnQnKTtcbiAgICogcHJvZHVjZXM6XG4gICAqICAgdmFyIHZhck5hbWUgPSBnb29nLnJlcXVpcmUoJ2dvb2cubW9kdWxlLm5hbWUnKTtcbiAgICpcbiAgICogSWYgdGhlIGlucHV0IHZhck5hbWUgaXMgbnVsbCwgZ2VuZXJhdGVzIGEgbmV3IHZhcmlhYmxlIG5hbWUgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSB2YXJpYWJsZSBuYW1lIGZvciB0aGUgaW1wb3J0ZWQgbW9kdWxlLCByZXVzaW5nIGEgcHJldmlvdXMgaW1wb3J0IGlmIG9uZVxuICAgKiAgICBpcyBhdmFpbGFibGUuXG4gICAqL1xuICBlbWl0R29vZ1JlcXVpcmUodmFyTmFtZTogc3RyaW5nfG51bGwsIHRzSW1wb3J0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBtb2ROYW1lOiBzdHJpbmc7XG4gICAgbGV0IGlzTmFtZXNwYWNlSW1wb3J0ID0gZmFsc2U7XG4gICAgY29uc3QgbnNJbXBvcnQgPSBleHRyYWN0R29vZ05hbWVzcGFjZUltcG9ydCh0c0ltcG9ydCk7XG4gICAgaWYgKG5zSW1wb3J0ICE9PSBudWxsKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgbmFtZXNwYWNlIGltcG9ydCwgb2YgdGhlIGZvcm0gXCJnb29nOmZvby5iYXJcIi5cbiAgICAgIC8vIEZpeCBpdCB0byBqdXN0IFwiZm9vLmJhclwiLlxuICAgICAgbW9kTmFtZSA9IG5zSW1wb3J0O1xuICAgICAgaXNOYW1lc3BhY2VJbXBvcnQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBtb2ROYW1lID0gdGhpcy5ob3N0LnBhdGhUb01vZHVsZU5hbWUodGhpcy5maWxlLmZpbGVOYW1lLCB0c0ltcG9ydCk7XG4gICAgfVxuXG4gICAgaWYgKCF2YXJOYW1lKSB7XG4gICAgICBjb25zdCBtdiA9IHRoaXMubW9kdWxlVmFyaWFibGVzLmdldChtb2ROYW1lKTtcbiAgICAgIGlmIChtdikge1xuICAgICAgICAvLyBDYWxsZXIgZGlkbid0IHJlcXVlc3QgYSBzcGVjaWZpYyB2YXJpYWJsZSBuYW1lIGFuZCB3ZSd2ZSBhbHJlYWR5XG4gICAgICAgIC8vIGltcG9ydGVkIHRoZSBtb2R1bGUsIHNvIGp1c3QgcmV0dXJuIHRoZSBuYW1lIHdlIGFscmVhZHkgaGF2ZSBmb3IgdGhpcyBtb2R1bGUuXG4gICAgICAgIHJldHVybiBtdjtcbiAgICAgIH1cblxuICAgICAgLy8gTm90ZTogd2UgYWx3YXlzIGludHJvZHVjZSBhIHZhcmlhYmxlIGZvciBhbnkgaW1wb3J0LCByZWdhcmRsZXNzIG9mIHdoZXRoZXJcbiAgICAgIC8vIHRoZSBjYWxsZXIgcmVxdWVzdGVkIG9uZS4gIFRoaXMgYXZvaWRzIGEgQ2xvc3VyZSBlcnJvci5cbiAgICAgIHZhck5hbWUgPSB0aGlzLmdlbmVyYXRlRnJlc2hWYXJpYWJsZU5hbWUoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYW1lc3BhY2VJbXBvcnQpIHRoaXMubmFtZXNwYWNlSW1wb3J0cy5hZGQodmFyTmFtZSk7XG4gICAgaWYgKHRoaXMubW9kdWxlVmFyaWFibGVzLmhhcyhtb2ROYW1lKSkge1xuICAgICAgdGhpcy5lbWl0KGB2YXIgJHt2YXJOYW1lfSA9ICR7dGhpcy5tb2R1bGVWYXJpYWJsZXMuZ2V0KG1vZE5hbWUpfTtgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KGB2YXIgJHt2YXJOYW1lfSA9IGdvb2cucmVxdWlyZSgnJHttb2ROYW1lfScpO2ApO1xuICAgICAgdGhpcy5tb2R1bGVWYXJpYWJsZXMuc2V0KG1vZE5hbWUsIHZhck5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFyTmFtZTtcbiAgfVxuICAvLyB3b3JrYXJvdW5kIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nIGJ1ZyBpbiBTdWJsaW1lOiBgXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyBhcmd1bWVudCBpZiBjYWxsIGlzIG9mIHRoZSBmb3JtXG4gICAqICAgcmVxdWlyZSgnZm9vJylcbiAgICovXG4gIGlzUmVxdWlyZShjYWxsOiB0cy5DYWxsRXhwcmVzc2lvbik6IHN0cmluZ3xudWxsIHtcbiAgICAvLyBWZXJpZnkgdGhhdCB0aGUgY2FsbCBpcyBhIGNhbGwgdG8gcmVxdWlyZSguLi4pLlxuICAgIGlmIChjYWxsLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpZGVudCA9IGNhbGwuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuICAgIGlmIChnZXRJZGVudGlmaWVyVGV4dChpZGVudCkgIT09ICdyZXF1aXJlJykgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBWZXJpZnkgdGhlIGNhbGwgdGFrZXMgYSBzaW5nbGUgc3RyaW5nIGFyZ3VtZW50IGFuZCBncmFiIGl0LlxuICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGFyZyA9IGNhbGwuYXJndW1lbnRzWzBdO1xuICAgIGlmIChhcmcua2luZCAhPT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKGFyZyBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlcXVpcmUoKSBjYWxsIG5vZGUgaWYgdGhlIG91dGVyIGNhbGwgaXMgb2YgdGhlIGZvcm1zOlxuICAgKiAtIF9fZXhwb3J0KHJlcXVpcmUoJ2ZvbycpKVxuICAgKiAtIHRzbGliXzEuX19leHBvcnRTdGFyKHJlcXVpcmUoJ2ZvbycpLCBiYXIpXG4gICAqL1xuICBpc0V4cG9ydFJlcXVpcmUoY2FsbDogdHMuQ2FsbEV4cHJlc3Npb24pOiB0cy5DYWxsRXhwcmVzc2lvbnxudWxsIHtcbiAgICBzd2l0Y2ggKGNhbGwuZXhwcmVzc2lvbi5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgY29uc3QgaWRlbnQgPSBjYWxsLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcjtcbiAgICAgICAgLy8gVFNfMjRfQ09NUEFUOiBhY2NlcHQgdGhyZWUgbGVhZGluZyB1bmRlcnNjb3Jlc1xuICAgICAgICBpZiAoaWRlbnQudGV4dCAhPT0gJ19fZXhwb3J0JyAmJiBpZGVudC50ZXh0ICE9PSAnX19fZXhwb3J0Jykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgcHJvcEFjY2VzcyA9IGNhbGwuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgICAgIC8vIFRTXzI0X0NPTVBBVDogYWNjZXB0IHRocmVlIGxlYWRpbmcgdW5kZXJzY29yZXNcbiAgICAgICAgaWYgKHByb3BBY2Nlc3MubmFtZS50ZXh0ICE9PSAnX19leHBvcnRTdGFyJyAmJiBwcm9wQWNjZXNzLm5hbWUudGV4dCAhPT0gJ19fX2V4cG9ydFN0YXInKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgdGhlIGNhbGwgdGFrZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50IGFuZCBjaGVjayBpdC5cbiAgICBpZiAoY2FsbC5hcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgYXJnID0gY2FsbC5hcmd1bWVudHNbMF07XG4gICAgaWYgKGFyZy5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpbm5lckNhbGwgPSBhcmcgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgaWYgKCF0aGlzLmlzUmVxdWlyZShpbm5lckNhbGwpKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gaW5uZXJDYWxsO1xuICB9XG5cbiAgaXNFc01vZHVsZVByb3BlcnR5KGV4cHI6IHRzLkV4cHJlc3Npb25TdGF0ZW1lbnQpOiBib29sZWFuIHtcbiAgICAvLyBXZSdyZSBtYXRjaGluZyB0aGUgZXhwbGljaXQgc291cmNlIHRleHQgZ2VuZXJhdGVkIGJ5IHRoZSBUUyBjb21waWxlci5cbiAgICByZXR1cm4gZXhwci5nZXRUZXh0KCkgPT09ICdPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7JztcbiAgfVxuXG4gIC8qKlxuICAgKiBtYXliZVByb2Nlc3MgaXMgY2FsbGVkIGR1cmluZyB0aGUgcmVjdXJzaXZlIHRyYXZlcnNhbCBvZiB0aGUgcHJvZ3JhbSdzIEFTVC5cbiAgICpcbiAgICogQHJldHVybiBUcnVlIGlmIHRoZSBub2RlIHdhcyBwcm9jZXNzZWQvZW1pdHRlZCwgZmFsc2UgaWYgaXQgc2hvdWxkIGJlIGVtaXR0ZWQgYXMgaXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgbWF5YmVQcm9jZXNzKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgcHJvcEFjY2VzcyA9IG5vZGUgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuICAgICAgICAvLyBXZSdyZSBsb29raW5nIGZvciBhbiBleHByZXNzaW9uIG9mIHRoZSBmb3JtOlxuICAgICAgICAvLyAgIG1vZHVsZV9uYW1lX3Zhci5kZWZhdWx0XG4gICAgICAgIGlmIChnZXRJZGVudGlmaWVyVGV4dChwcm9wQWNjZXNzLm5hbWUpICE9PSAnZGVmYXVsdCcpIGJyZWFrO1xuICAgICAgICBpZiAocHJvcEFjY2Vzcy5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikgYnJlYWs7XG4gICAgICAgIGNvbnN0IGxocyA9IGdldElkZW50aWZpZXJUZXh0KHByb3BBY2Nlc3MuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICAgICAgaWYgKCF0aGlzLm5hbWVzcGFjZUltcG9ydHMuaGFzKGxocykpIGJyZWFrO1xuICAgICAgICAvLyBFbWl0IHRoZSBzYW1lIGV4cHJlc3Npb24sIHdpdGggc3BhY2VzIHRvIHJlcGxhY2UgdGhlIFwiLmRlZmF1bHRcIiBwYXJ0XG4gICAgICAgIC8vIHNvIHRoYXQgc291cmNlIG1hcHMgc3RpbGwgbGluZSB1cC5cbiAgICAgICAgdGhpcy53cml0ZUxlYWRpbmdUcml2aWEobm9kZSk7XG4gICAgICAgIHRoaXMuZW1pdChgJHtsaHN9ICAgICAgICBgKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEdlbmVyYXRlcyBhIG5ldyB2YXJpYWJsZSBuYW1lIGluc2lkZSB0aGUgdHNpY2tsZV8gbmFtZXNwYWNlLiAqL1xuICBnZW5lcmF0ZUZyZXNoVmFyaWFibGVOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGB0c2lja2xlX21vZHVsZV8ke3RoaXMudW51c2VkSW5kZXgrK31fYDtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIFR5cGVTY3JpcHQncyBKUytDb21tb25KUyBvdXRwdXQgdG8gQ2xvc3VyZSBnb29nLm1vZHVsZSBldGMuXG4gKiBGb3IgdXNlIGFzIGEgcG9zdHByb2Nlc3Npbmcgc3RlcCAqYWZ0ZXIqIFR5cGVTY3JpcHQgZW1pdHMgSmF2YVNjcmlwdC5cbiAqXG4gKiBAcGFyYW0gZmlsZU5hbWUgVGhlIHNvdXJjZSBmaWxlIG5hbWUuXG4gKiBAcGFyYW0gbW9kdWxlSWQgVGhlIFwibW9kdWxlIGlkXCIsIGEgbW9kdWxlLWlkZW50aWZ5aW5nIHN0cmluZyB0aGF0IGlzXG4gKiAgICAgdGhlIHZhbHVlIG1vZHVsZS5pZCBpbiB0aGUgc2NvcGUgb2YgdGhlIG1vZHVsZS5cbiAqIEBwYXJhbSBwYXRoVG9Nb2R1bGVOYW1lIEEgZnVuY3Rpb24gdGhhdCBtYXBzIGEgZmlsZXN5c3RlbSAudHMgcGF0aCB0byBhXG4gKiAgICAgQ2xvc3VyZSBtb2R1bGUgbmFtZSwgYXMgZm91bmQgaW4gYSBnb29nLnJlcXVpcmUoJy4uLicpIHN0YXRlbWVudC5cbiAqICAgICBUaGUgY29udGV4dCBwYXJhbWV0ZXIgaXMgdGhlIHJlZmVyZW5jaW5nIGZpbGUsIHVzZWQgZm9yIHJlc29sdmluZ1xuICogICAgIGltcG9ydHMgd2l0aCByZWxhdGl2ZSBwYXRocyBsaWtlIFwiaW1wb3J0ICogYXMgZm9vIGZyb20gJy4uL2Zvbyc7XCIuXG4gKiBAcGFyYW0gcHJlbHVkZSBBbiBhZGRpdGlvbmFsIHByZWx1ZGUgdG8gaW5zZXJ0IGFmdGVyIHRoZSBgZ29vZy5tb2R1bGVgIGNhbGwsXG4gKiAgICAgZS5nLiB3aXRoIGFkZGl0aW9uYWwgaW1wb3J0cyBvciByZXF1aXJlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NFUzUoaG9zdDogRXM1UHJvY2Vzc29ySG9zdCwgZmlsZU5hbWU6IHN0cmluZywgY29udGVudDogc3RyaW5nKTpcbiAgICB7b3V0cHV0OiBzdHJpbmcsIHJlZmVyZW5jZWRNb2R1bGVzOiBzdHJpbmdbXX0ge1xuICBjb25zdCBmaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShmaWxlTmFtZSwgY29udGVudCwgdHMuU2NyaXB0VGFyZ2V0LkVTNSwgdHJ1ZSk7XG4gIHJldHVybiBuZXcgRVM1UHJvY2Vzc29yKGhvc3QsIGZpbGUpLnByb2Nlc3MoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRDb21tb25Kc1RvR29vZ01vZHVsZUlmTmVlZGVkKFxuICAgIGhvc3Q6IEVzNVByb2Nlc3Nvckhvc3QsIG1vZHVsZXNNYW5pZmVzdDogTW9kdWxlc01hbmlmZXN0LCBmaWxlTmFtZTogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaG9zdC5nb29nbW9kdWxlIHx8IGlzRHRzRmlsZU5hbWUoZmlsZU5hbWUpKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgY29uc3Qge291dHB1dCwgcmVmZXJlbmNlZE1vZHVsZXN9ID0gcHJvY2Vzc0VTNShob3N0LCBmaWxlTmFtZSwgY29udGVudCk7XG5cbiAgY29uc3QgbW9kdWxlTmFtZSA9IGhvc3QucGF0aFRvTW9kdWxlTmFtZSgnJywgZmlsZU5hbWUpO1xuICBtb2R1bGVzTWFuaWZlc3QuYWRkTW9kdWxlKGZpbGVOYW1lLCBtb2R1bGVOYW1lKTtcbiAgZm9yIChjb25zdCByZWZlcmVuY2VkIG9mIHJlZmVyZW5jZWRNb2R1bGVzKSB7XG4gICAgbW9kdWxlc01hbmlmZXN0LmFkZFJlZmVyZW5jZWRNb2R1bGUoZmlsZU5hbWUsIHJlZmVyZW5jZWQpO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cbiJdfQ==