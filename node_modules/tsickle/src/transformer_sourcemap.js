/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/transformer_sourcemap", ["require", "exports", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * Creates a TypeScript transformer based on a source->text transformation.
     *
     * TypeScript transformers operate on AST nodes. Newly created nodes must be marked as replacing an
     * older AST node. This shim allows running a transformation step that's based on emitting new text
     * as a node based transformer. It achieves that by running the transformation, collecting a source
     * mapping in the process, and then afterwards parsing the source text into a new AST and marking
     * the new nodes as representations of the old nodes based on their source map positions.
     *
     * The process marks all nodes as synthesized except for a handful of special cases (identifiers
     * etc).
     */
    function createTransformerFromSourceMap(sourceBasedTransformer) {
        return function (context) { return function (sourceFile) {
            var sourceMapper = new NodeSourceMapper();
            var transformedSourceText = sourceBasedTransformer(sourceFile, sourceMapper);
            var newFile = ts.createSourceFile(sourceFile.fileName, transformedSourceText, ts.ScriptTarget.Latest, true);
            var mappedFile = visitNode(newFile);
            return transformer_util_1.updateSourceFileNode(sourceFile, mappedFile.statements);
            function visitNode(node) {
                return transformer_util_1.visitNodeWithSynthesizedComments(context, newFile, node, visitNodeImpl);
            }
            function visitNodeImpl(node) {
                if (node.flags & ts.NodeFlags.Synthesized) {
                    return node;
                }
                var originalNode = sourceMapper.getOriginalNode(node);
                // Use the originalNode for:
                // - literals: as e.g. typescript does not support synthetic regex literals
                // - identifiers: as they don't have children and behave well
                //    regarding comment synthesization
                // - types: as they are not emited anyways
                //          and it leads to errors with `extends` cases.
                if (originalNode &&
                    (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
                        transformer_util_1.isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature)) {
                    return originalNode;
                }
                node = ts.visitEachChild(node, visitNode, context);
                node.flags |= ts.NodeFlags.Synthesized;
                node.parent = undefined;
                ts.setTextRange(node, originalNode ? originalNode : { pos: -1, end: -1 });
                ts.setOriginalNode(node, originalNode);
                // Loop over all nested ts.NodeArrays /
                // ts.Nodes that were not visited and set their
                // text range to -1 to not emit their whitespace.
                // Sadly, TypeScript does not have an API for this...
                // tslint:disable-next-line:no-any To read all properties
                var nodeAny = node;
                // tslint:disable-next-line:no-any To read all properties
                var originalNodeAny = originalNode;
                for (var prop in nodeAny) {
                    if (nodeAny.hasOwnProperty(prop)) {
                        // tslint:disable-next-line:no-any
                        var value = nodeAny[prop];
                        if (isNodeArray(value)) {
                            // reset the pos/end of all NodeArrays so that we don't emit comments
                            // from them.
                            ts.setTextRange(value, { pos: -1, end: -1 });
                        }
                        else if (isToken(value) && !(value.flags & ts.NodeFlags.Synthesized) &&
                            value.getSourceFile() !== sourceFile) {
                            // Use the original TextRange for all non visited tokens (e.g. the
                            // `BinaryExpression.operatorToken`) to preserve the formatting
                            var textRange = originalNode ? originalNodeAny[prop] : { pos: -1, end: -1 };
                            ts.setTextRange(value, textRange);
                        }
                    }
                }
                return node;
            }
        }; };
    }
    exports.createTransformerFromSourceMap = createTransformerFromSourceMap;
    /**
     * Implementation of the `SourceMapper` that stores and retrieves mappings
     * to original nodes.
     */
    var NodeSourceMapper = /** @class */ (function () {
        function NodeSourceMapper() {
            this.originalNodeByGeneratedRange = new Map();
            this.genStartPositions = new Map();
            /** Conceptual offset for all nodes in this mapping. */
            this.offset = 0;
        }
        NodeSourceMapper.prototype.addFullNodeRange = function (node, genStartPos) {
            var _this = this;
            this.originalNodeByGeneratedRange.set(this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())), node);
            node.forEachChild(function (child) { return _this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())); });
        };
        NodeSourceMapper.prototype.shiftByOffset = function (offset) {
            this.offset += offset;
        };
        NodeSourceMapper.prototype.addMapping = function (originalNode, original, generated, length) {
            var _this = this;
            var originalStartPos = original.position;
            var genStartPos = generated.position;
            if (originalStartPos >= originalNode.getFullStart() &&
                originalStartPos <= originalNode.getStart()) {
                // always use the node.getStart() for the index,
                // as comments and whitespaces might differ between the original and transformed code.
                var diffToStart = originalNode.getStart() - originalStartPos;
                originalStartPos += diffToStart;
                genStartPos += diffToStart;
                length -= diffToStart;
                this.genStartPositions.set(originalNode, genStartPos);
            }
            if (originalStartPos + length === originalNode.getEnd()) {
                this.originalNodeByGeneratedRange.set(this.nodeCacheKey(originalNode.kind, this.genStartPositions.get(originalNode), genStartPos + length), originalNode);
            }
            originalNode.forEachChild(function (child) {
                if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
                    _this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
                }
            });
        };
        /** For the newly parsed `node`, find what node corresponded to it in the original source text. */
        NodeSourceMapper.prototype.getOriginalNode = function (node) {
            // Apply the offset: if there is an offset > 0, all nodes are conceptually shifted by so many
            // characters from the start of the file.
            var start = node.getStart() - this.offset;
            if (start < 0) {
                // Special case: the source file conceptually spans all of the file, including any added
                // prefix added that causes offset to be set.
                if (node.kind !== ts.SyntaxKind.SourceFile) {
                    // Nodes within [0, offset] of the new file (start < 0) is the additional prefix that has no
                    // corresponding nodes in the original source, so return undefined.
                    return undefined;
                }
                start = 0;
            }
            var end = node.getEnd() - this.offset;
            var key = this.nodeCacheKey(node.kind, start, end);
            return this.originalNodeByGeneratedRange.get(key);
        };
        NodeSourceMapper.prototype.nodeCacheKey = function (kind, start, end) {
            return kind + "#" + start + "#" + end;
        };
        return NodeSourceMapper;
    }());
    // tslint:disable-next-line:no-any
    function isNodeArray(value) {
        var anyValue = value;
        return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
    }
    // tslint:disable-next-line:no-any
    function isToken(value) {
        return value != null && typeof value === 'object' && value.kind >= ts.SyntaxKind.FirstToken &&
            value.kind <= ts.SyntaxKind.LastToken;
    }
    // Copied from TypeScript
    function isLiteralKind(kind) {
        return ts.SyntaxKind.FirstLiteralToken <= kind && kind <= ts.SyntaxKind.LastLiteralToken;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfc291cmNlbWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RyYW5zZm9ybWVyX3NvdXJjZW1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILGlFQUEwRztJQUMxRywyQ0FBbUM7SUFFbkM7Ozs7Ozs7Ozs7O09BV0c7SUFDSCx3Q0FDSSxzQkFDVTtRQUNaLE1BQU0sQ0FBQyxVQUFDLE9BQU8sSUFBSyxPQUFBLFVBQUMsVUFBVTtZQUM3QixJQUFNLFlBQVksR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDNUMsSUFBTSxxQkFBcUIsR0FBRyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDL0UsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUMvQixVQUFVLENBQUMsUUFBUSxFQUFFLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlFLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsdUNBQW9CLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUvRCxtQkFBc0MsSUFBTztnQkFDM0MsTUFBTSxDQUFDLG1EQUFnQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBTSxDQUFDO1lBQ3RGLENBQUM7WUFFRCx1QkFBdUIsSUFBYTtnQkFDbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFDRCxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxD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LENBQUMsVUFBVSxDQUFDLFVBQVU7WUFDdkYsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztJQUM1QyxDQUFDO0lBRUQseUJBQXlCO0lBQ3pCLHVCQUF1QixJQUFtQjtRQUN4QyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7SUFDM0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTb3VyY2VNYXBwZXIsIFNvdXJjZVBvc2l0aW9ufSBmcm9tICcuL3NvdXJjZV9tYXBfdXRpbHMnO1xuaW1wb3J0IHtpc1R5cGVOb2RlS2luZCwgdXBkYXRlU291cmNlRmlsZU5vZGUsIHZpc2l0Tm9kZVdpdGhTeW50aGVzaXplZENvbW1lbnRzfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgVHlwZVNjcmlwdCB0cmFuc2Zvcm1lciBiYXNlZCBvbiBhIHNvdXJjZS0+dGV4dCB0cmFuc2Zvcm1hdGlvbi5cbiAqXG4gKiBUeXBlU2NyaXB0IHRyYW5zZm9ybWVycyBvcGVyYXRlIG9uIEFTVCBub2Rlcy4gTmV3bHkgY3JlYXRlZCBub2RlcyBtdXN0IGJlIG1hcmtlZCBhcyByZXBsYWNpbmcgYW5cbiAqIG9sZGVyIEFTVCBub2RlLiBUaGlzIHNoaW0gYWxsb3dzIHJ1bm5pbmcgYSB0cmFuc2Zvcm1hdGlvbiBzdGVwIHRoYXQncyBiYXNlZCBvbiBlbWl0dGluZyBuZXcgdGV4dFxuICogYXMgYSBub2RlIGJhc2VkIHRyYW5zZm9ybWVyLiBJdCBhY2hpZXZlcyB0aGF0IGJ5IHJ1bm5pbmcgdGhlIHRyYW5zZm9ybWF0aW9uLCBjb2xsZWN0aW5nIGEgc291cmNlXG4gKiBtYXBwaW5nIGluIHRoZSBwcm9jZXNzLCBhbmQgdGhlbiBhZnRlcndhcmRzIHBhcnNpbmcgdGhlIHNvdXJjZSB0ZXh0IGludG8gYSBuZXcgQVNUIGFuZCBtYXJraW5nXG4gKiB0aGUgbmV3IG5vZGVzIGFzIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgb2xkIG5vZGVzIGJhc2VkIG9uIHRoZWlyIHNvdXJjZSBtYXAgcG9zaXRpb25zLlxuICpcbiAqIFRoZSBwcm9jZXNzIG1hcmtzIGFsbCBub2RlcyBhcyBzeW50aGVzaXplZCBleGNlcHQgZm9yIGEgaGFuZGZ1bCBvZiBzcGVjaWFsIGNhc2VzIChpZGVudGlmaWVyc1xuICogZXRjKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYW5zZm9ybWVyRnJvbVNvdXJjZU1hcChcbiAgICBzb3VyY2VCYXNlZFRyYW5zZm9ybWVyOiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgc291cmNlTWFwcGVyOiBTb3VyY2VNYXBwZXIpID0+XG4gICAgICAgIHN0cmluZyk6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dCkgPT4gKHNvdXJjZUZpbGUpID0+IHtcbiAgICBjb25zdCBzb3VyY2VNYXBwZXIgPSBuZXcgTm9kZVNvdXJjZU1hcHBlcigpO1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkU291cmNlVGV4dCA9IHNvdXJjZUJhc2VkVHJhbnNmb3JtZXIoc291cmNlRmlsZSwgc291cmNlTWFwcGVyKTtcbiAgICBjb25zdCBuZXdGaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgICAgc291cmNlRmlsZS5maWxlTmFtZSwgdHJhbnNmb3JtZWRTb3VyY2VUZXh0LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbiAgICBjb25zdCBtYXBwZWRGaWxlID0gdmlzaXROb2RlKG5ld0ZpbGUpO1xuICAgIHJldHVybiB1cGRhdGVTb3VyY2VGaWxlTm9kZShzb3VyY2VGaWxlLCBtYXBwZWRGaWxlLnN0YXRlbWVudHMpO1xuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCB7XG4gICAgICByZXR1cm4gdmlzaXROb2RlV2l0aFN5bnRoZXNpemVkQ29tbWVudHMoY29udGV4dCwgbmV3RmlsZSwgbm9kZSwgdmlzaXROb2RlSW1wbCkgYXMgVDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGVJbXBsKG5vZGU6IHRzLk5vZGUpIHtcbiAgICAgIGlmIChub2RlLmZsYWdzICYgdHMuTm9kZUZsYWdzLlN5bnRoZXNpemVkKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3JpZ2luYWxOb2RlID0gc291cmNlTWFwcGVyLmdldE9yaWdpbmFsTm9kZShub2RlKTtcblxuICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hbE5vZGUgZm9yOlxuICAgICAgLy8gLSBsaXRlcmFsczogYXMgZS5nLiB0eXBlc2NyaXB0IGRvZXMgbm90IHN1cHBvcnQgc3ludGhldGljIHJlZ2V4IGxpdGVyYWxzXG4gICAgICAvLyAtIGlkZW50aWZpZXJzOiBhcyB0aGV5IGRvbid0IGhhdmUgY2hpbGRyZW4gYW5kIGJlaGF2ZSB3ZWxsXG4gICAgICAvLyAgICByZWdhcmRpbmcgY29tbWVudCBzeW50aGVzaXphdGlvblxuICAgICAgLy8gLSB0eXBlczogYXMgdGhleSBhcmUgbm90IGVtaXRlZCBhbnl3YXlzXG4gICAgICAvLyAgICAgICAgICBhbmQgaXQgbGVhZHMgdG8gZXJyb3JzIHdpdGggYGV4dGVuZHNgIGNhc2VzLlxuICAgICAgaWYgKG9yaWdpbmFsTm9kZSAmJlxuICAgICAgICAgIChpc0xpdGVyYWxLaW5kKG5vZGUua2luZCkgfHwgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIgfHxcbiAgICAgICAgICAgaXNUeXBlTm9kZUtpbmQobm9kZS5raW5kKSB8fCBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW5kZXhTaWduYXR1cmUpKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbE5vZGU7XG4gICAgICB9XG4gICAgICBub2RlID0gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlLCBjb250ZXh0KTtcblxuICAgICAgbm9kZS5mbGFncyB8PSB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQ7XG4gICAgICBub2RlLnBhcmVudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRzLnNldFRleHRSYW5nZShub2RlLCBvcmlnaW5hbE5vZGUgPyBvcmlnaW5hbE5vZGUgOiB7cG9zOiAtMSwgZW5kOiAtMX0pO1xuICAgICAgdHMuc2V0T3JpZ2luYWxOb2RlKG5vZGUsIG9yaWdpbmFsTm9kZSk7XG5cbiAgICAgIC8vIExvb3Agb3ZlciBhbGwgbmVzdGVkIHRzLk5vZGVBcnJheXMgL1xuICAgICAgLy8gdHMuTm9kZXMgdGhhdCB3ZXJlIG5vdCB2aXNpdGVkIGFuZCBzZXQgdGhlaXJcbiAgICAgIC8vIHRleHQgcmFuZ2UgdG8gLTEgdG8gbm90IGVtaXQgdGhlaXIgd2hpdGVzcGFjZS5cbiAgICAgIC8vIFNhZGx5LCBUeXBlU2NyaXB0IGRvZXMgbm90IGhhdmUgYW4gQVBJIGZvciB0aGlzLi4uXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55IFRvIHJlYWQgYWxsIHByb3BlcnRpZXNcbiAgICAgIGNvbnN0IG5vZGVBbnkgPSBub2RlIGFzIHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueSBUbyByZWFkIGFsbCBwcm9wZXJ0aWVzXG4gICAgICBjb25zdCBvcmlnaW5hbE5vZGVBbnkgPSBvcmlnaW5hbE5vZGUgYXMge1trZXk6IHN0cmluZ106IGFueX07XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gbm9kZUFueSkge1xuICAgICAgICBpZiAobm9kZUFueS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IG5vZGVBbnlbcHJvcF07XG4gICAgICAgICAgaWYgKGlzTm9kZUFycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgLy8gcmVzZXQgdGhlIHBvcy9lbmQgb2YgYWxsIE5vZGVBcnJheXMgc28gdGhhdCB3ZSBkb24ndCBlbWl0IGNvbW1lbnRzXG4gICAgICAgICAgICAvLyBmcm9tIHRoZW0uXG4gICAgICAgICAgICB0cy5zZXRUZXh0UmFuZ2UodmFsdWUsIHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgaXNUb2tlbih2YWx1ZSkgJiYgISh2YWx1ZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkgJiZcbiAgICAgICAgICAgICAgdmFsdWUuZ2V0U291cmNlRmlsZSgpICE9PSBzb3VyY2VGaWxlKSB7XG4gICAgICAgICAgICAvLyBVc2UgdGhlIG9yaWdpbmFsIFRleHRSYW5nZSBmb3IgYWxsIG5vbiB2aXNpdGVkIHRva2VucyAoZS5nLiB0aGVcbiAgICAgICAgICAgIC8vIGBCaW5hcnlFeHByZXNzaW9uLm9wZXJhdG9yVG9rZW5gKSB0byBwcmVzZXJ2ZSB0aGUgZm9ybWF0dGluZ1xuICAgICAgICAgICAgY29uc3QgdGV4dFJhbmdlID0gb3JpZ2luYWxOb2RlID8gb3JpZ2luYWxOb2RlQW55W3Byb3BdIDoge3BvczogLTEsIGVuZDogLTF9O1xuICAgICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKHZhbHVlLCB0ZXh0UmFuZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIGBTb3VyY2VNYXBwZXJgIHRoYXQgc3RvcmVzIGFuZCByZXRyaWV2ZXMgbWFwcGluZ3NcbiAqIHRvIG9yaWdpbmFsIG5vZGVzLlxuICovXG5jbGFzcyBOb2RlU291cmNlTWFwcGVyIGltcGxlbWVudHMgU291cmNlTWFwcGVyIHtcbiAgcHJpdmF0ZSBvcmlnaW5hbE5vZGVCeUdlbmVyYXRlZFJhbmdlID0gbmV3IE1hcDxzdHJpbmcsIHRzLk5vZGU+KCk7XG4gIHByaXZhdGUgZ2VuU3RhcnRQb3NpdGlvbnMgPSBuZXcgTWFwPHRzLk5vZGUsIG51bWJlcj4oKTtcbiAgLyoqIENvbmNlcHR1YWwgb2Zmc2V0IGZvciBhbGwgbm9kZXMgaW4gdGhpcyBtYXBwaW5nLiAqL1xuICBwcml2YXRlIG9mZnNldCA9IDA7XG5cbiAgcHJpdmF0ZSBhZGRGdWxsTm9kZVJhbmdlKG5vZGU6IHRzLk5vZGUsIGdlblN0YXJ0UG9zOiBudW1iZXIpIHtcbiAgICB0aGlzLm9yaWdpbmFsTm9kZUJ5R2VuZXJhdGVkUmFuZ2Uuc2V0KFxuICAgICAgICB0aGlzLm5vZGVDYWNoZUtleShub2RlLmtpbmQsIGdlblN0YXJ0UG9zLCBnZW5TdGFydFBvcyArIChub2RlLmdldEVuZCgpIC0gbm9kZS5nZXRTdGFydCgpKSksXG4gICAgICAgIG5vZGUpO1xuICAgIG5vZGUuZm9yRWFjaENoaWxkKFxuICAgICAgICBjaGlsZCA9PiB0aGlzLmFkZEZ1bGxOb2RlUmFuZ2UoY2hpbGQsIGdlblN0YXJ0UG9zICsgKGNoaWxkLmdldFN0YXJ0KCkgLSBub2RlLmdldFN0YXJ0KCkpKSk7XG4gIH1cblxuICBzaGlmdEJ5T2Zmc2V0KG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpcy5vZmZzZXQgKz0gb2Zmc2V0O1xuICB9XG5cbiAgYWRkTWFwcGluZyhcbiAgICAgIG9yaWdpbmFsTm9kZTogdHMuTm9kZSwgb3JpZ2luYWw6IFNvdXJjZVBvc2l0aW9uLCBnZW5lcmF0ZWQ6IFNvdXJjZVBvc2l0aW9uLCBsZW5ndGg6IG51bWJlcikge1xuICAgIGxldCBvcmlnaW5hbFN0YXJ0UG9zID0gb3JpZ2luYWwucG9zaXRpb247XG4gICAgbGV0IGdlblN0YXJ0UG9zID0gZ2VuZXJhdGVkLnBvc2l0aW9uO1xuICAgIGlmIChvcmlnaW5hbFN0YXJ0UG9zID49IG9yaWdpbmFsTm9kZS5nZXRGdWxsU3RhcnQoKSAmJlxuICAgICAgICBvcmlnaW5hbFN0YXJ0UG9zIDw9IG9yaWdpbmFsTm9kZS5nZXRTdGFydCgpKSB7XG4gICAgICAvLyBhbHdheXMgdXNlIHRoZSBub2RlLmdldFN0YXJ0KCkgZm9yIHRoZSBpbmRleCxcbiAgICAgIC8vIGFzIGNvbW1lbnRzIGFuZCB3aGl0ZXNwYWNlcyBtaWdodCBkaWZmZXIgYmV0d2VlbiB0aGUgb3JpZ2luYWwgYW5kIHRyYW5zZm9ybWVkIGNvZGUuXG4gICAgICBjb25zdCBkaWZmVG9TdGFydCA9IG9yaWdpbmFsTm9kZS5nZXRTdGFydCgpIC0gb3JpZ2luYWxTdGFydFBvcztcbiAgICAgIG9yaWdpbmFsU3RhcnRQb3MgKz0gZGlmZlRvU3RhcnQ7XG4gICAgICBnZW5TdGFydFBvcyArPSBkaWZmVG9TdGFydDtcbiAgICAgIGxlbmd0aCAtPSBkaWZmVG9TdGFydDtcbiAgICAgIHRoaXMuZ2VuU3RhcnRQb3NpdGlvbnMuc2V0KG9yaWdpbmFsTm9kZSwgZ2VuU3RhcnRQb3MpO1xuICAgIH1cbiAgICBpZiAob3JpZ2luYWxTdGFydFBvcyArIGxlbmd0aCA9PT0gb3JpZ2luYWxOb2RlLmdldEVuZCgpKSB7XG4gICAgICB0aGlzLm9yaWdpbmFsTm9kZUJ5R2VuZXJhdGVkUmFuZ2Uuc2V0KFxuICAgICAgICAgIHRoaXMubm9kZUNhY2hlS2V5KFxuICAgICAgICAgICAgICBvcmlnaW5hbE5vZGUua2luZCwgdGhpcy5nZW5TdGFydFBvc2l0aW9ucy5nZXQob3JpZ2luYWxOb2RlKSEsIGdlblN0YXJ0UG9zICsgbGVuZ3RoKSxcbiAgICAgICAgICBvcmlnaW5hbE5vZGUpO1xuICAgIH1cbiAgICBvcmlnaW5hbE5vZGUuZm9yRWFjaENoaWxkKChjaGlsZCkgPT4ge1xuICAgICAgaWYgKGNoaWxkLmdldFN0YXJ0KCkgPj0gb3JpZ2luYWxTdGFydFBvcyAmJiBjaGlsZC5nZXRFbmQoKSA8PSBvcmlnaW5hbFN0YXJ0UG9zICsgbGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuYWRkRnVsbE5vZGVSYW5nZShjaGlsZCwgZ2VuU3RhcnRQb3MgKyAoY2hpbGQuZ2V0U3RhcnQoKSAtIG9yaWdpbmFsU3RhcnRQb3MpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBGb3IgdGhlIG5ld2x5IHBhcnNlZCBgbm9kZWAsIGZpbmQgd2hhdCBub2RlIGNvcnJlc3BvbmRlZCB0byBpdCBpbiB0aGUgb3JpZ2luYWwgc291cmNlIHRleHQuICovXG4gIGdldE9yaWdpbmFsTm9kZShub2RlOiB0cy5Ob2RlKTogdHMuTm9kZXx1bmRlZmluZWQge1xuICAgIC8vIEFwcGx5IHRoZSBvZmZzZXQ6IGlmIHRoZXJlIGlzIGFuIG9mZnNldCA+IDAsIGFsbCBub2RlcyBhcmUgY29uY2VwdHVhbGx5IHNoaWZ0ZWQgYnkgc28gbWFueVxuICAgIC8vIGNoYXJhY3RlcnMgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIGZpbGUuXG4gICAgbGV0IHN0YXJ0ID0gbm9kZS5nZXRTdGFydCgpIC0gdGhpcy5vZmZzZXQ7XG4gICAgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlOiB0aGUgc291cmNlIGZpbGUgY29uY2VwdHVhbGx5IHNwYW5zIGFsbCBvZiB0aGUgZmlsZSwgaW5jbHVkaW5nIGFueSBhZGRlZFxuICAgICAgLy8gcHJlZml4IGFkZGVkIHRoYXQgY2F1c2VzIG9mZnNldCB0byBiZSBzZXQuXG4gICAgICBpZiAobm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUpIHtcbiAgICAgICAgLy8gTm9kZXMgd2l0aGluIFswLCBvZmZzZXRdIG9mIHRoZSBuZXcgZmlsZSAoc3RhcnQgPCAwKSBpcyB0aGUgYWRkaXRpb25hbCBwcmVmaXggdGhhdCBoYXMgbm9cbiAgICAgICAgLy8gY29ycmVzcG9uZGluZyBub2RlcyBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBzbyByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSBub2RlLmdldEVuZCgpIC0gdGhpcy5vZmZzZXQ7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5ub2RlQ2FjaGVLZXkobm9kZS5raW5kLCBzdGFydCwgZW5kKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW5hbE5vZGVCeUdlbmVyYXRlZFJhbmdlLmdldChrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSBub2RlQ2FjaGVLZXkoa2luZDogdHMuU3ludGF4S2luZCwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtraW5kfSMke3N0YXJ0fSMke2VuZH1gO1xuICB9XG59XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbmZ1bmN0aW9uIGlzTm9kZUFycmF5KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyB0cy5Ob2RlQXJyYXk8YW55PiB7XG4gIGNvbnN0IGFueVZhbHVlID0gdmFsdWU7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiBhbnlWYWx1ZS5wb3MgIT09IHVuZGVmaW5lZCAmJiBhbnlWYWx1ZS5lbmQgIT09IHVuZGVmaW5lZDtcbn1cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuZnVuY3Rpb24gaXNUb2tlbih2YWx1ZTogYW55KTogdmFsdWUgaXMgdHMuVG9rZW48YW55PiB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUua2luZCA+PSB0cy5TeW50YXhLaW5kLkZpcnN0VG9rZW4gJiZcbiAgICAgIHZhbHVlLmtpbmQgPD0gdHMuU3ludGF4S2luZC5MYXN0VG9rZW47XG59XG5cbi8vIENvcGllZCBmcm9tIFR5cGVTY3JpcHRcbmZ1bmN0aW9uIGlzTGl0ZXJhbEtpbmQoa2luZDogdHMuU3ludGF4S2luZCkge1xuICByZXR1cm4gdHMuU3ludGF4S2luZC5GaXJzdExpdGVyYWxUb2tlbiA8PSBraW5kICYmIGtpbmQgPD0gdHMuU3ludGF4S2luZC5MYXN0TGl0ZXJhbFRva2VuO1xufVxuIl19