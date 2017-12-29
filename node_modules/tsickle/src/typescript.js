/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview Abstraction over the TypeScript API that makes multiple
 * versions of TypeScript appear to be interoperable. Any time a breaking change
 * in TypeScript affects Tsickle code, we should extend this shim to present an
 * unbroken API.
 * All code in tsickle should import from this location, not from 'typescript'.
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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/typescript", ["require", "exports", "typescript", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:no-any We need to do various unsafe casts between TS versions
    var ts = require("typescript");
    var typescript_1 = require("typescript");
    exports.addSyntheticTrailingComment = typescript_1.addSyntheticTrailingComment;
    exports.createArrayLiteral = typescript_1.createArrayLiteral;
    exports.createArrayTypeNode = typescript_1.createArrayTypeNode;
    exports.createCompilerHost = typescript_1.createCompilerHost;
    exports.createIdentifier = typescript_1.createIdentifier;
    exports.createKeywordTypeNode = typescript_1.createKeywordTypeNode;
    exports.createNodeArray = typescript_1.createNodeArray;
    exports.createNotEmittedStatement = typescript_1.createNotEmittedStatement;
    exports.createObjectLiteral = typescript_1.createObjectLiteral;
    exports.createProgram = typescript_1.createProgram;
    exports.createProperty = typescript_1.createProperty;
    exports.createPropertyAssignment = typescript_1.createPropertyAssignment;
    exports.createPropertySignature = typescript_1.createPropertySignature;
    exports.createSourceFile = typescript_1.createSourceFile;
    exports.createToken = typescript_1.createToken;
    exports.createTypeLiteralNode = typescript_1.createTypeLiteralNode;
    exports.createTypeReferenceNode = typescript_1.createTypeReferenceNode;
    exports.DiagnosticCategory = typescript_1.DiagnosticCategory;
    exports.EmitFlags = typescript_1.EmitFlags;
    exports.flattenDiagnosticMessageText = typescript_1.flattenDiagnosticMessageText;
    exports.forEachChild = typescript_1.forEachChild;
    exports.getCombinedModifierFlags = typescript_1.getCombinedModifierFlags;
    exports.getLeadingCommentRanges = typescript_1.getLeadingCommentRanges;
    exports.getLineAndCharacterOfPosition = typescript_1.getLineAndCharacterOfPosition;
    exports.getMutableClone = typescript_1.getMutableClone;
    exports.getOriginalNode = typescript_1.getOriginalNode;
    exports.getPreEmitDiagnostics = typescript_1.getPreEmitDiagnostics;
    exports.getSyntheticLeadingComments = typescript_1.getSyntheticLeadingComments;
    exports.getSyntheticTrailingComments = typescript_1.getSyntheticTrailingComments;
    exports.getTrailingCommentRanges = typescript_1.getTrailingCommentRanges;
    exports.isIdentifier = typescript_1.isIdentifier;
    exports.ModifierFlags = typescript_1.ModifierFlags;
    exports.ModuleKind = typescript_1.ModuleKind;
    exports.NodeFlags = typescript_1.NodeFlags;
    exports.parseCommandLine = typescript_1.parseCommandLine;
    exports.parseJsonConfigFileContent = typescript_1.parseJsonConfigFileContent;
    exports.readConfigFile = typescript_1.readConfigFile;
    exports.resolveModuleName = typescript_1.resolveModuleName;
    exports.ScriptTarget = typescript_1.ScriptTarget;
    exports.setEmitFlags = typescript_1.setEmitFlags;
    exports.setOriginalNode = typescript_1.setOriginalNode;
    exports.setSourceMapRange = typescript_1.setSourceMapRange;
    exports.setSyntheticLeadingComments = typescript_1.setSyntheticLeadingComments;
    exports.setSyntheticTrailingComments = typescript_1.setSyntheticTrailingComments;
    exports.setTextRange = typescript_1.setTextRange;
    exports.SymbolFlags = typescript_1.SymbolFlags;
    exports.SyntaxKind = typescript_1.SyntaxKind;
    exports.sys = typescript_1.sys;
    exports.TypeFlags = typescript_1.TypeFlags;
    exports.updateBlock = typescript_1.updateBlock;
    exports.visitEachChild = typescript_1.visitEachChild;
    exports.visitLexicalEnvironment = typescript_1.visitLexicalEnvironment;
    // getEmitFlags is now private starting in TS 2.5.
    // So we define our own method that calls through to TypeScript to defeat the
    // visibility constraint.
    function getEmitFlags(node) {
        return ts.getEmitFlags(node);
    }
    exports.getEmitFlags = getEmitFlags;
    // Between TypeScript 2.4 and 2.5 updateProperty was modified. If called with 2.4 re-order the
    // parameters.
    exports.updateProperty = ts.updateProperty;
    var _a = __read(ts.version.split('.'), 2), major = _a[0], minor = _a[1];
    if (major === '2' && minor === '4') {
        var updateProperty24_1 = ts.updateProperty;
        exports.updateProperty = function (node, decorators, modifiers, name, questionToken, type, initializer) {
            return updateProperty24_1(node, decorators, modifiers, name, type, initializer);
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNIOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILCtFQUErRTtJQUUvRSwrQkFBaUM7SUFLakMseUNBQXl4RTtJQUF2d0UsbURBQUEsMkJBQTJCLENBQUE7SUFBNEwsMENBQUEsa0JBQWtCLENBQUE7SUFBRSwyQ0FBQSxtQkFBbUIsQ0FBQTtJQUFFLDBDQUFBLGtCQUFrQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLHVDQUFBLGVBQWUsQ0FBQTtJQUFFLGlEQUFBLHlCQUF5QixDQUFBO0lBQUUsMkNBQUEsbUJBQW1CLENBQUE7SUFBRSxxQ0FBQSxhQUFhLENBQUE7SUFBRSxzQ0FBQSxjQUFjLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxtQ0FBQSxXQUFXLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQStHLDBDQUFBLGtCQUFrQixDQUFBO0lBQTJCLGlDQUFBLFNBQVMsQ0FBQTtJQUFnSCxvREFBQSw0QkFBNEIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUF3RSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUscURBQUEsNkJBQTZCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLG1EQUFBLDJCQUEyQixDQUFBO0lBQUUsb0RBQUEsNEJBQTRCLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFpRyxvQ0FBQSxZQUFZLENBQUE7SUFBcUIscUNBQUEsYUFBYSxDQUFBO0lBQWtDLGtDQUFBLFVBQVUsQ0FBQTtJQUF5RSxpQ0FBQSxTQUFTLENBQUE7SUFBbUgsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxrREFBQSwwQkFBMEIsQ0FBQTtJQUErRyxzQ0FBQSxjQUFjLENBQUE7SUFBRSx5Q0FBQSxpQkFBaUIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUEwQixvQ0FBQSxZQUFZLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSx5Q0FBQSxpQkFBaUIsQ0FBQTtJQUFFLG1EQUFBLDJCQUEyQixDQUFBO0lBQUUsb0RBQUEsNEJBQTRCLENBQUE7SUFBRSxvQ0FBQSxZQUFZLENBQUE7SUFBc0UsbUNBQUEsV0FBVyxDQUFBO0lBQUUsa0NBQUEsVUFBVSxDQUFBO0lBQXNCLDJCQUFBLEdBQUcsQ0FBQTtJQUF1SCxpQ0FBQSxTQUFTLENBQUE7SUFBc0MsbUNBQUEsV0FBVyxDQUFBO0lBQTBDLHNDQUFBLGNBQWMsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBRXp1RSxrREFBa0Q7SUFDbEQsNkVBQTZFO0lBQzdFLHlCQUF5QjtJQUN6QixzQkFBNkIsSUFBYTtRQUN4QyxNQUFNLENBQUUsRUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRkQsb0NBRUM7SUFFRCw4RkFBOEY7SUFDOUYsY0FBYztJQUNILFFBQUEsY0FBYyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7SUFFeEMsSUFBQSxxQ0FBc0MsRUFBckMsYUFBSyxFQUFFLGFBQUssQ0FBMEI7SUFDN0MsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFNLGtCQUFnQixHQUFHLEVBQUUsQ0FBQyxjQUFtRCxDQUFDO1FBQ2hGLHNCQUFjLEdBQUcsVUFBQyxJQUE0QixFQUFFLFVBQWlELEVBQy9FLFNBQStDLEVBQUUsSUFBNEIsRUFDN0UsYUFBeUMsRUFBRSxJQUEyQixFQUN0RSxXQUFvQztZQUNwRCxNQUFNLENBQUMsa0JBQWdCLENBQ1osSUFBdUMsRUFBRSxVQUFxQyxFQUM5RSxTQUFnQixFQUFFLElBQVcsRUFBRSxJQUFXLEVBQUUsV0FBa0IsQ0FBUSxDQUFDO1FBQ3BGLENBQUMsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQWJzdHJhY3Rpb24gb3ZlciB0aGUgVHlwZVNjcmlwdCBBUEkgdGhhdCBtYWtlcyBtdWx0aXBsZVxuICogdmVyc2lvbnMgb2YgVHlwZVNjcmlwdCBhcHBlYXIgdG8gYmUgaW50ZXJvcGVyYWJsZS4gQW55IHRpbWUgYSBicmVha2luZyBjaGFuZ2VcbiAqIGluIFR5cGVTY3JpcHQgYWZmZWN0cyBUc2lja2xlIGNvZGUsIHdlIHNob3VsZCBleHRlbmQgdGhpcyBzaGltIHRvIHByZXNlbnQgYW5cbiAqIHVuYnJva2VuIEFQSS5cbiAqIEFsbCBjb2RlIGluIHRzaWNrbGUgc2hvdWxkIGltcG9ydCBmcm9tIHRoaXMgbG9jYXRpb24sIG5vdCBmcm9tICd0eXBlc2NyaXB0Jy5cbiAqL1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZTpuby1hbnkgV2UgbmVlZCB0byBkbyB2YXJpb3VzIHVuc2FmZSBjYXN0cyBiZXR3ZWVuIFRTIHZlcnNpb25zXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vLyBOb3RlLCB0aGlzIGltcG9ydCBkZXBlbmRzIG9uIGEgZ2VucnVsZSBjb3B5aW5nIHRoZSAuZC50cyBmaWxlIHRvIHRoaXMgcGFja2FnZVxuaW1wb3J0ICogYXMgdHMyNCBmcm9tICcuL3R5cGVzY3JpcHQtMi40JztcblxuZXhwb3J0IHtfX1N0cmluZywgYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50LCBBc3NlcnRpb25FeHByZXNzaW9uLCBCbG9jaywgQ2FsbEV4cHJlc3Npb24sIENhbmNlbGxhdGlvblRva2VuLCBDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc0VsZW1lbnQsIENsYXNzTGlrZURlY2xhcmF0aW9uLCBDb21tZW50UmFuZ2UsIENvbXBpbGVySG9zdCwgQ29tcGlsZXJPcHRpb25zLCBDb25zdHJ1Y3RvckRlY2xhcmF0aW9uLCBjcmVhdGVBcnJheUxpdGVyYWwsIGNyZWF0ZUFycmF5VHlwZU5vZGUsIGNyZWF0ZUNvbXBpbGVySG9zdCwgY3JlYXRlSWRlbnRpZmllciwgY3JlYXRlS2V5d29yZFR5cGVOb2RlLCBjcmVhdGVOb2RlQXJyYXksIGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQsIGNyZWF0ZU9iamVjdExpdGVyYWwsIGNyZWF0ZVByb2dyYW0sIGNyZWF0ZVByb3BlcnR5LCBjcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQsIGNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlLCBjcmVhdGVTb3VyY2VGaWxlLCBjcmVhdGVUb2tlbiwgY3JlYXRlVHlwZUxpdGVyYWxOb2RlLCBjcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSwgQ3VzdG9tVHJhbnNmb3JtZXJzLCBEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25TdGF0ZW1lbnQsIERlY2xhcmF0aW9uV2l0aFR5cGVQYXJhbWV0ZXJzLCBEZWNvcmF0b3IsIERpYWdub3N0aWMsIERpYWdub3N0aWNDYXRlZ29yeSwgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24sIEVtaXRGbGFncywgRW1pdFJlc3VsdCwgRW50aXR5TmFtZSwgRW51bURlY2xhcmF0aW9uLCBFeHBvcnREZWNsYXJhdGlvbiwgRXhwb3J0U3BlY2lmaWVyLCBFeHByZXNzaW9uLCBFeHByZXNzaW9uU3RhdGVtZW50LCBmbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VUZXh0LCBmb3JFYWNoQ2hpbGQsIEZ1bmN0aW9uRGVjbGFyYXRpb24sIEZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uLCBHZXRBY2Nlc3NvckRlY2xhcmF0aW9uLCBnZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3MsIGdldExlYWRpbmdDb21tZW50UmFuZ2VzLCBnZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbiwgZ2V0TXV0YWJsZUNsb25lLCBnZXRPcmlnaW5hbE5vZGUsIGdldFByZUVtaXREaWFnbm9zdGljcywgZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzLCBnZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzLCBnZXRUcmFpbGluZ0NvbW1lbnRSYW5nZXMsIElkZW50aWZpZXIsIEltcG9ydERlY2xhcmF0aW9uLCBJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbiwgSW1wb3J0U3BlY2lmaWVyLCBJbnRlcmZhY2VEZWNsYXJhdGlvbiwgaXNJZGVudGlmaWVyLCBNZXRob2REZWNsYXJhdGlvbiwgTW9kaWZpZXJGbGFncywgTW9kdWxlQmxvY2ssIE1vZHVsZURlY2xhcmF0aW9uLCBNb2R1bGVLaW5kLCBNb2R1bGVSZXNvbHV0aW9uSG9zdCwgTmFtZWREZWNsYXJhdGlvbiwgTmFtZWRJbXBvcnRzLCBOb2RlLCBOb2RlQXJyYXksIE5vZGVGbGFncywgTm9uTnVsbEV4cHJlc3Npb24sIE5vdEVtaXR0ZWRTdGF0ZW1lbnQsIE9iamVjdExpdGVyYWxFbGVtZW50TGlrZSwgT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24sIFBhcmFtZXRlckRlY2xhcmF0aW9uLCBwYXJzZUNvbW1hbmRMaW5lLCBwYXJzZUpzb25Db25maWdGaWxlQ29udGVudCwgUHJvZ3JhbSwgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLCBQcm9wZXJ0eUFzc2lnbm1lbnQsIFByb3BlcnR5RGVjbGFyYXRpb24sIFByb3BlcnR5TmFtZSwgUHJvcGVydHlTaWduYXR1cmUsIHJlYWRDb25maWdGaWxlLCByZXNvbHZlTW9kdWxlTmFtZSwgU2NyaXB0VGFyZ2V0LCBTZXRBY2Nlc3NvckRlY2xhcmF0aW9uLCBzZXRFbWl0RmxhZ3MsIHNldE9yaWdpbmFsTm9kZSwgc2V0U291cmNlTWFwUmFuZ2UsIHNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cywgc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cywgc2V0VGV4dFJhbmdlLCBTaWduYXR1cmVEZWNsYXJhdGlvbiwgU291cmNlRmlsZSwgU3RhdGVtZW50LCBTdHJpbmdMaXRlcmFsLCBTeW1ib2wsIFN5bWJvbEZsYWdzLCBTeW50YXhLaW5kLCBTeW50aGVzaXplZENvbW1lbnQsIHN5cywgVG9rZW4sIFRyYW5zZm9ybWF0aW9uQ29udGV4dCwgVHJhbnNmb3JtZXIsIFRyYW5zZm9ybWVyRmFjdG9yeSwgVHlwZSwgVHlwZUFsaWFzRGVjbGFyYXRpb24sIFR5cGVDaGVja2VyLCBUeXBlRWxlbWVudCwgVHlwZUZsYWdzLCBUeXBlTm9kZSwgVHlwZVJlZmVyZW5jZSwgVW5pb25UeXBlLCB1cGRhdGVCbG9jaywgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVTdGF0ZW1lbnQsIHZpc2l0RWFjaENoaWxkLCB2aXNpdExleGljYWxFbnZpcm9ubWVudCwgVmlzaXRvciwgV3JpdGVGaWxlQ2FsbGJhY2t9IGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vLyBnZXRFbWl0RmxhZ3MgaXMgbm93IHByaXZhdGUgc3RhcnRpbmcgaW4gVFMgMi41LlxuLy8gU28gd2UgZGVmaW5lIG91ciBvd24gbWV0aG9kIHRoYXQgY2FsbHMgdGhyb3VnaCB0byBUeXBlU2NyaXB0IHRvIGRlZmVhdCB0aGVcbi8vIHZpc2liaWxpdHkgY29uc3RyYWludC5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbWl0RmxhZ3Mobm9kZTogdHMuTm9kZSk6IHRzLkVtaXRGbGFnc3x1bmRlZmluZWQge1xuICByZXR1cm4gKHRzIGFzIGFueSkuZ2V0RW1pdEZsYWdzKG5vZGUpO1xufVxuXG4vLyBCZXR3ZWVuIFR5cGVTY3JpcHQgMi40IGFuZCAyLjUgdXBkYXRlUHJvcGVydHkgd2FzIG1vZGlmaWVkLiBJZiBjYWxsZWQgd2l0aCAyLjQgcmUtb3JkZXIgdGhlXG4vLyBwYXJhbWV0ZXJzLlxuZXhwb3J0IGxldCB1cGRhdGVQcm9wZXJ0eSA9IHRzLnVwZGF0ZVByb3BlcnR5O1xuXG5jb25zdCBbbWFqb3IsIG1pbm9yXSA9IHRzLnZlcnNpb24uc3BsaXQoJy4nKTtcbmlmIChtYWpvciA9PT0gJzInICYmIG1pbm9yID09PSAnNCcpIHtcbiAgY29uc3QgdXBkYXRlUHJvcGVydHkyNCA9IHRzLnVwZGF0ZVByb3BlcnR5IGFzIGFueSBhcyB0eXBlb2YgdHMyNC51cGRhdGVQcm9wZXJ0eTtcbiAgdXBkYXRlUHJvcGVydHkgPSAobm9kZTogdHMuUHJvcGVydHlEZWNsYXJhdGlvbiwgZGVjb3JhdG9yczogUmVhZG9ubHlBcnJheTx0cy5EZWNvcmF0b3I+fHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXJzOiBSZWFkb25seUFycmF5PHRzLk1vZGlmaWVyPnx1bmRlZmluZWQsIG5hbWU6IHN0cmluZ3x0cy5Qcm9wZXJ0eU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uVG9rZW46IHRzLlF1ZXN0aW9uVG9rZW58dW5kZWZpbmVkLCB0eXBlOiB0cy5UeXBlTm9kZXx1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxpemVyOiB0cy5FeHByZXNzaW9ufHVuZGVmaW5lZCk6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24gPT4ge1xuICAgIHJldHVybiB1cGRhdGVQcm9wZXJ0eTI0KFxuICAgICAgICAgICAgICAgbm9kZSBhcyBhbnkgYXMgdHMyNC5Qcm9wZXJ0eURlY2xhcmF0aW9uLCBkZWNvcmF0b3JzIGFzIGFueSBhcyB0czI0LkRlY29yYXRvcltdLFxuICAgICAgICAgICAgICAgbW9kaWZpZXJzIGFzIGFueSwgbmFtZSBhcyBhbnksIHR5cGUgYXMgYW55LMKgaW5pdGlhbGl6ZXIgYXMgYW55KSBhcyBhbnk7XG4gIH07XG59XG4iXX0=