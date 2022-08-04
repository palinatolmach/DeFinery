"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var lodash_1 = require("lodash");
function rebasePath(path, oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs) {
    var path_oriAST = fromMutationSequence.reverseUpdatePath(beforeMutationASTs, [path])[0];
    if (path_oriAST === null) {
        return undefined;
    }
    var newpath = afterMutationSequence.updatePath(__spreadArrays([oriAST], afterMutationASTs), [
        path_oriAST,
    ])[0];
    if (newpath === null) {
        return undefined;
    }
    return newpath;
}
exports.rebasePath = rebasePath;
var MutationSequence = /** @class */ (function (_super) {
    __extends(MutationSequence, _super);
    function MutationSequence() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MutationSequence.prototype.reverseUpdatePath_oriAST = function (oriAST, paths) {
        var prevASTs = this.slice(0, -1).reduce(function (asts, mutation, idx) {
            var newAST = lodash_1.cloneDeep(asts[idx]);
            mutation.apply(newAST);
            asts.push(newAST);
            return asts;
        }, [oriAST]);
        return this.reverseUpdatePath(prevASTs, paths);
    };
    MutationSequence.prototype.reverseUpdatePath = function (prevASTs, paths) {
        var rstPaths = [];
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var path = paths_1[_i];
            rstPaths.push(this.reduceRight(function (currPath, mutation, idx) {
                return currPath !== null ? mutation.reverseUpdateASTPath(prevASTs[idx], currPath) : currPath;
            }, path));
        }
        return rstPaths;
    };
    MutationSequence.prototype.updatePath_oriAST = function (oriAST, paths) {
        var prevASTs = this.slice(0, -1).reduce(function (asts, mutation, idx) {
            var newAST = lodash_1.cloneDeep(asts[idx]);
            mutation.apply(newAST);
            asts.push(newAST);
            return asts;
        }, [oriAST]);
        return this.updatePath(prevASTs, paths);
    };
    MutationSequence.prototype.updatePath = function (prevASTs, paths) {
        var rstPaths = [];
        for (var _i = 0, paths_2 = paths; _i < paths_2.length; _i++) {
            var path = paths_2[_i];
            rstPaths.push(this.reduce(function (currPath, mutation, idx) {
                return currPath !== null ? mutation.updateASTPath(prevASTs[idx], currPath) : currPath;
            }, path));
        }
        return rstPaths;
    };
    MutationSequence.prototype.modifiedLocations = function (originalAST) {
        var locations = [];
        var nodepathLocMap = new Map();
        this.mutateAST(originalAST, function (ast, _justAppliedMutation, nextMutation) {
            if (nextMutation !== undefined) {
                var loc = nextMutation.modifiedLocations(ast, nodepathLocMap);
                locations.push(loc);
                if (loc === 'unknown') {
                    return false;
                }
                else {
                    // Note: This is just an approximation, but good enough to generate accurate results
                    var nodePaths = nextMutation.modifiedNodePath(ast);
                    for (var _i = 0, nodePaths_1 = nodePaths; _i < nodePaths_1.length; _i++) {
                        var nodePath = nodePaths_1[_i];
                        nodepathLocMap.set(JSON.stringify(nodePath), loc);
                    }
                }
            }
            return true;
        });
        if (locations[locations.length - 1] === 'unknown') {
            return 'unknown';
        }
        return lodash_1.uniqWith(lodash_1.flatten(locations), lodash_1.isEqual);
    };
    MutationSequence.prototype.modifiedNodePaths = function (originalAST) {
        var ret = [];
        this.mutateAST(originalAST, function (ast, _justAppliedMutation, nextMutation) {
            if (nextMutation !== undefined) {
                ret = ret.map(function (p) { return nextMutation.updateASTPath(ast, p); }).filter(function (x) { return x !== null; });
                ret.push.apply(ret, nextMutation.modifiedNodePath(ast));
            }
            return true;
        });
        return ret;
    };
    MutationSequence.prototype.mutateAST = function (ast_, intermediateASTVisitor) {
        if (intermediateASTVisitor === void 0) { intermediateASTVisitor = undefined; }
        var ast = lodash_1.cloneDeep(ast_);
        if (intermediateASTVisitor !== undefined && !intermediateASTVisitor(ast, undefined, this[0], -1, this)) {
            return ast;
        }
        for (var i = 0; i < this.length; i++) {
            var mutation = this[i];
            mutation.apply(ast);
            if (intermediateASTVisitor !== undefined && !intermediateASTVisitor(ast, mutation, this[i + 1], i, this)) {
                return ast;
            }
        }
        return ast;
    };
    return MutationSequence;
}(Array));
exports["default"] = MutationSequence;
