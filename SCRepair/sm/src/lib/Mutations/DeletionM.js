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
exports.__esModule = true;
var _1 = require(".");
var RandomMutationGenerator_1 = require("./RandomMutationGenerator");
var utils_1 = require("../utils");
var assert_1 = require("assert");
var MutationSequence_1 = require("../MutationSequence");
var lodash_1 = require("lodash");
var treeify_1 = require("treeify");
var debug_1 = require("debug");
var debugLogger_space = debug_1["default"]('space');
var debugLogger_deletableSpace = debugLogger_space.extend('DeletableSpace');
/*
    Mutation that deletes a node from a list of children
*/
var DeletionM = /** @class */ (function (_super) {
    __extends(DeletionM, _super);
    function DeletionM(targetNodePath) {
        var _this = _super.call(this, targetNodePath) || this;
        _this.targetNodePath = targetNodePath;
        _this.mutationType = DeletionM.name;
        return _this;
    }
    DeletionM.prototype.apply = function (ast) {
        var targetNodeParentAttribute = utils_1.getASTNodeFromPath(ast, this.targetNodePath.slice(0, -1));
        if (Array.isArray(targetNodeParentAttribute)) {
            var idxStr = parseInt(this.targetNodePath[this.targetNodePath.length - 1]);
            assert_1["default"](Number.isInteger(idxStr));
            targetNodeParentAttribute.splice(idxStr, 1);
        }
        else {
            assert_1["default"](lodash_1.has(ast, this.targetNodePath));
            assert_1["default"](lodash_1.unset(ast, this.targetNodePath));
        }
    };
    DeletionM.prototype.updateASTPath = function (ast, path) {
        if (utils_1.arrStartsWithArr(path, this.targetNodePath)) {
            return null;
        }
        var deletedNodeParent = utils_1.getASTNodeFromPath(ast, this.targetNodePath.slice(0, -1));
        if (Array.isArray(deletedNodeParent)) {
            if (this.targetNodePath.slice(0, -1).every(function (x, idx) { return x === path[idx]; }) &&
                path.length >= this.targetNodePath.length) {
                var deletedNodePreIdx = parseInt(this.targetNodePath[this.targetNodePath.length - 1]);
                var target = path[this.targetNodePath.length - 1];
                assert_1["default"](typeof target === 'string');
                var targetNum = parseInt(target);
                if (targetNum > deletedNodePreIdx) {
                    var newPath = lodash_1.cloneDeep(path);
                    newPath[this.targetNodePath.length - 1] = (targetNum - 1).toString();
                    return newPath;
                }
            }
        }
        return path;
    };
    DeletionM.prototype.reverseUpdateASTPath = function (ast, path) {
        var deletedNodeParent = utils_1.getASTNodeFromPath(ast, this.targetNodePath.slice(0, -1));
        if (Array.isArray(deletedNodeParent)) {
            if (this.targetNodePath.slice(0, -1).every(function (x, idx) { return x === path[idx]; }) &&
                path.length >= this.targetNodePath.length) {
                var deletedNodePreIdx = parseInt(this.targetNodePath[this.targetNodePath.length - 1]);
                var target = path[this.targetNodePath.length - 1];
                assert_1["default"](typeof target === 'string');
                var targetNum = parseInt(target);
                if (targetNum + 1 > deletedNodePreIdx) {
                    var newPath = lodash_1.cloneDeep(path);
                    newPath[this.targetNodePath.length - 1] = (targetNum + 1).toString();
                    return newPath;
                }
            }
        }
        return path;
    };
    DeletionM.prototype.rebase = function (oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs) {
        var newTargetNodePath = MutationSequence_1.rebasePath(this.targetNodePath, oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs);
        return newTargetNodePath !== undefined ? new DeletionM(newTargetNodePath) : undefined;
    };
    DeletionM.randomGenerator = function (ast, faultSpace, rng) {
        return new RandomMutationGenerator_DeletionM(ast, faultSpace, rng);
    };
    DeletionM.prototype.modifiedNodePath = function (_ast) {
        return [];
    };
    return DeletionM;
}(_1.Mutation));
exports["default"] = DeletionM;
var RandomMutationGenerator_DeletionM = /** @class */ (function (_super) {
    __extends(RandomMutationGenerator_DeletionM, _super);
    function RandomMutationGenerator_DeletionM(forAST, faultSpace, rng) {
        var _this = _super.call(this) || this;
        _this.forAST = forAST;
        _this.rng = rng;
        _this.deletableNodeTypes = ['ExpressionStatement'];
        _this.deletableSpace = [];
        assert_1["default"](_this.updateFaultSpace({
            updateType: 'add',
            faultSpaces: faultSpace
        }));
        return _this;
    }
    RandomMutationGenerator_DeletionM.prototype.next = function () {
        // Note: Use Set to hopefully have performance boost
        // const disallowedNodeTypes = new Set([
        //   'range',
        //   'loc',
        //   'parameters',
        //   'arguments',
        //   'names',
        //   'modifiers',
        //   'variables',
        //   'components',
        //   'members'
        // ]);
        if (this.deletableSpace.length === 0) {
            return { done: true, value: undefined };
        }
        debugLogger_deletableSpace(treeify_1["default"].asTree(this.deletableSpace, true, true));
        var chosenFaultSpace_idx = this.rng.weighted(lodash_1.range(0, this.deletableSpace.length), this.deletableSpace.map(function (_x) { return 1; }));
        // can be done with a `this.updateFaultSpace` call
        var chosenFaultSpace = this.deletableSpace.splice(chosenFaultSpace_idx, 1)[0];
        assert_1["default"](chosenFaultSpace !== undefined);
        return { done: false, value: new DeletionM(chosenFaultSpace.nodePath) };
    };
    RandomMutationGenerator_DeletionM.prototype.updateFaultSpace = function (faultSpaceUpdateObj) {
        switch (faultSpaceUpdateObj.updateType) {
            case 'add': {
                var newDeleteableSpace = utils_1.deletableFaultSpace(this.forAST, faultSpaceUpdateObj.faultSpaces, this.deletableNodeTypes);
                this.deletableSpace = lodash_1.unionWith(this.deletableSpace, newDeleteableSpace, function (a, b) { return lodash_1.isEqual(a.nodePath, b.nodePath); });
                return true;
            }
            case 'remove': {
                lodash_1.pullAllWith(this.deletableSpace, faultSpaceUpdateObj.faultSpaces, function (a, b) { return lodash_1.isEqual(a.nodePath, b.nodePath); });
                return true;
            }
            case 'intersect': {
                // Done
                lodash_1.intersectionWith(this.deletableSpace, faultSpaceUpdateObj.faultSpaces, function (a, b) { return lodash_1.isEqual(a.nodePath, b.nodePath); });
                return true;
            }
            default: {
                throw new UnimplementedError();
            }
        }
    };
    RandomMutationGenerator_DeletionM.prototype.isMutationInRemainingSpace = function (mutation) {
        return this.deletableSpace.find(function (space) { return lodash_1.isEqual(space.nodePath, mutation.targetNodePath); }) !== undefined;
    };
    RandomMutationGenerator_DeletionM.prototype.numMutationRemaining = function () {
        throw new UnimplementedError();
    };
    return RandomMutationGenerator_DeletionM;
}(RandomMutationGenerator_1["default"]));
