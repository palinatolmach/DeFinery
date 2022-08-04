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
var _1 = require(".");
var RandomMutationGenerator_1 = require("./RandomMutationGenerator");
var utils_1 = require("../utils");
var assert_1 = require("assert");
var util_1 = require("util");
var MutationSequence_1 = require("../MutationSequence");
var ASTNodeSpace_1 = require("../ASTNodeSpace");
var lodash_1 = require("lodash");
var debug_1 = require("debug");
var os_1 = require("os");
var debugLogger_MovementM = debug_1["default"]('MoveMutation');
var debugLogger_MovementM_randomGenerator = debugLogger_MovementM.extend('randomGenerator');
var debugLogger_MovementM_randomGenerator_DeletionM = debugLogger_MovementM_randomGenerator.extend('DeletionM');
var MovementM = /** @class */ (function (_super) {
    __extends(MovementM, _super);
    function MovementM(ast, fromNodePath, toPropertyPath, insertIndex) {
        var _this = _super.call(this, fromNodePath) || this;
        _this.ast = ast;
        _this.fromNodePath = fromNodePath;
        _this.toPropertyPath = toPropertyPath;
        _this.insertIndex = insertIndex;
        _this.mutationType = MovementM.name;
        assert_1["default"](ast !== undefined);
        _this.ast = lodash_1.cloneDeep(ast); // Clone to avoid extenrally modified
        utils_1.ASTNodeRemoveExtraAttributesDeep(_this.ast);
        var theNode = lodash_1.cloneDeep(utils_1.getASTNodeFromPath(_this.ast, fromNodePath));
        assert_1["default"](theNode !== undefined, "fromNodePath " + util_1["default"].inspect(fromNodePath, false, Infinity, true) + " points to invalid non-existent node. AST:\n" + _this.ast);
        utils_1.ASTNodeRemoveLocDeep(theNode);
        var fstMutation = new _1.DeletionM(fromNodePath);
        var newTargetPath_ = fstMutation.updateASTPath(_this.ast, __spreadArrays(toPropertyPath, [insertIndex.toString()]));
        assert_1["default"](newTargetPath_ !== null);
        var newTargetPath = newTargetPath_;
        var newToPropertyPath = newTargetPath.slice(0, -1);
        var newInsertIndex = parseInt(newTargetPath[newTargetPath.length - 1]);
        var sndMutation = new _1.InsertionM(newToPropertyPath, newInsertIndex, theNode);
        assert_1["default"](!lodash_1.isEqual(fromNodePath, newToPropertyPath), "Ineffective MoveMutation - fromNodePath equal to newToPropertyPath");
        _this.mutations = [fstMutation, sndMutation];
        return _this;
    }
    MovementM.fromMutation = function (ast, fstMutation, sndMutation) {
        var transformed_insertNodePath = __spreadArrays(sndMutation.targetPropertyPath, [sndMutation.insertIndex.toString()]);
        var ori_insertNodePath_ = fstMutation.reverseUpdateASTPath(ast, transformed_insertNodePath);
        assert_1["default"](ori_insertNodePath_ !== null);
        var ori_insertIndex = parseInt(ori_insertNodePath_.splice(-1, 1)[0]);
        var ori_toPropertyPath = ori_insertNodePath_;
        return new MovementM(ast, fstMutation.targetNodePath, ori_toPropertyPath, ori_insertIndex);
    };
    MovementM.prototype.toString = function () {
        return JSON.stringify({
            mutationType: this.mutationType,
            fromNodePath: this.fromNodePath,
            toPropertyPath: this.toPropertyPath,
            insertIndex: this.insertIndex
        });
    };
    MovementM.prototype.toJSON = function () {
        var ast_withoutLoc = lodash_1.cloneDeep(this.ast);
        utils_1.ASTNodeRemoveLocDeep(ast_withoutLoc);
        return {
            ast: ast_withoutLoc,
            mutationType: this.mutationType,
            fromNodePath: this.fromNodePath,
            toPropertyPath: this.toPropertyPath,
            insertIndex: this.insertIndex
        };
    };
    MovementM.prototype.apply = function (ast) {
        assert_1["default"](lodash_1.isEqualWith(ast, this.ast, utils_1.ASTFunctionalEqualCompareCustomizer), "MoveMutation is applied on AST that is not intended!" + os_1["default"].EOL + "Intended AST:" + os_1["default"].EOL + util_1["default"].inspect(this.ast, true, Infinity, true) + os_1["default"].EOL + "Provided AST:" + os_1["default"].EOL + util_1["default"].inspect(ast, true, Infinity, true));
        for (var _i = 0, _a = this.mutations; _i < _a.length; _i++) {
            var mutation = _a[_i];
            mutation.apply(ast);
        }
    };
    MovementM.prototype.updateASTPath = function (ast, path) {
        var ret1 = this.mutations[0].updateASTPath(ast, path);
        if (ret1 === null) {
            if (lodash_1.isEqual(path, this.fromNodePath)) {
                return __spreadArrays(this.mutations[1].targetPropertyPath, [this.mutations[1].insertIndex.toString()]);
            }
            else {
                return null;
            }
        }
        var ret2 = this.mutations[1].updateASTPath(ast, ret1);
        return ret2;
    };
    MovementM.prototype.reverseUpdateASTPath = function (ast, path) {
        if (lodash_1.isEqual(path, __spreadArrays(this.mutations[1].targetPropertyPath, [this.mutations[1].insertIndex.toString()]))) {
            return lodash_1.cloneDeep(this.fromNodePath);
        }
        var retPath = path;
        for (var _i = 0, _a = this.mutations.slice().reverse(); _i < _a.length; _i++) {
            var mutation = _a[_i];
            var ret = mutation.reverseUpdateASTPath(ast, retPath);
            if (ret === null) {
                return null;
            }
            retPath = ret;
        }
        return retPath;
    };
    MovementM.prototype.rebase = function (oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs) {
        assert_1["default"](beforeMutationASTs.length === fromMutationSequence.length);
        assert_1["default"](afterMutationASTs.length === afterMutationSequence.length);
        assert_1["default"](beforeMutationASTs.every(function (x) { return utils_1.isASTNode(x); }));
        assert_1["default"](afterMutationASTs.every(function (x) { return utils_1.isASTNode(x); }));
        var newFstMutation = this.mutations[0].rebase(oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs);
        if (newFstMutation === undefined) {
            return undefined;
        }
        var fstMutationBaseAST = afterMutationASTs.length === 0 ? oriAST : afterMutationASTs[afterMutationSequence.length - 1];
        var newAftFstMutationAST = lodash_1.cloneDeep(fstMutationBaseAST);
        newFstMutation.apply(newAftFstMutationAST);
        var newSndMutation = this.mutations[1].rebase(oriAST, new (MutationSequence_1["default"].bind.apply(MutationSequence_1["default"], __spreadArrays([void 0], __spreadArrays(fromMutationSequence, [this.mutations[0]]))))(), __spreadArrays(beforeMutationASTs, [this.ast]), new (MutationSequence_1["default"].bind.apply(MutationSequence_1["default"], __spreadArrays([void 0], __spreadArrays(afterMutationSequence, [newFstMutation]))))(), __spreadArrays(afterMutationASTs, [newAftFstMutationAST]));
        if (newSndMutation === undefined) {
            return undefined;
        }
        return MovementM.fromMutation(fstMutationBaseAST, newFstMutation, newSndMutation);
    };
    MovementM.randomGenerator = function (ast, faultSpace, onlySameFunction, rng) {
        if (onlySameFunction === void 0) { onlySameFunction = true; }
        return new RandomMutationGenerator_MoveMutation(ast, faultSpace, onlySameFunction, rng);
    };
    MovementM.prototype.modifiedLocations = function (ast, nodepathLocMap) {
        var _this = this;
        if (nodepathLocMap === void 0) { nodepathLocMap = new Map(); }
        var fstMutationLocs = this.mutations[0].modifiedLocations(ast, nodepathLocMap);
        var astAfterFstMutation = lodash_1.cloneDeep(ast);
        this.mutations[0].apply(astAfterFstMutation);
        var nodepathLocMap_forSndMutation = new Map(__spreadArrays(nodepathLocMap.entries()).map(function (_a) {
            var k = _a[0], v = _a[1];
            var nodePath = JSON.parse(k);
            var newNodePath = _this.mutations[0].updateASTPath(ast, nodePath);
            return newNodePath === null ? null : [JSON.stringify(newNodePath), v];
        }).filter(function (x) { return x !== null; }));
        var sndMutationLocs = this.mutations[1].modifiedLocations(astAfterFstMutation, nodepathLocMap_forSndMutation);
        var mutationLocs = [fstMutationLocs, sndMutationLocs];
        assert_1["default"](mutationLocs.every(function (x) { return x.length !== 0; }));
        if (mutationLocs.includes('unknown')) {
            return 'unknown';
        }
        else {
            return lodash_1.unionWith(fstMutationLocs, sndMutationLocs, lodash_1.isEqual);
        }
    };
    MovementM.prototype.modifiedNodePath = function (ast) {
        var ret1 = this.mutations[0].modifiedNodePath(ast);
        var intermediateAST = lodash_1.cloneDeep(ast);
        this.mutations[0].apply(intermediateAST);
        var ret2 = this.mutations[1].modifiedNodePath(intermediateAST);
        return __spreadArrays(ret1, ret2);
    };
    return MovementM;
}(_1.Mutation));
exports["default"] = MovementM;
var RandomMutationGenerator_MoveMutation = /** @class */ (function (_super) {
    __extends(RandomMutationGenerator_MoveMutation, _super);
    function RandomMutationGenerator_MoveMutation(ast, faultSpace, onlySameFunction, rng) {
        if (onlySameFunction === void 0) { onlySameFunction = true; }
        var _this = _super.call(this) || this;
        _this.ast = ast;
        _this.onlySameFunction = onlySameFunction;
        _this.rng = rng;
        _this.arr_pair_deletionMInsertionMutationGen = [];
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
        assert_1["default"](_this.updateFaultSpace({
            updateType: 'add',
            faultSpaces: faultSpace
        }));
        return _this;
    }
    RandomMutationGenerator_MoveMutation.prototype.updateFaultSpace = function (faultSpaceUpdateObj) {
        var _this = this;
        switch (faultSpaceUpdateObj.updateType) {
            case 'add': {
                var faultSpace_1 = faultSpaceUpdateObj.faultSpaces;
                var allPossibleDeletionM = __spreadArrays(_1.DeletionM.randomGenerator(this.ast, faultSpace_1, this.rng));
                debugLogger_MovementM_randomGenerator_DeletionM(allPossibleDeletionM);
                var new_arr_pair_deletionMInsertionMGen = allPossibleDeletionM.map(function (deletionM) {
                    var nodeTobeDeleted = utils_1.getASTNodeFromPath(_this.ast, deletionM.targetNodePath);
                    var faultSpace_ = faultSpace_1;
                    if (_this.onlySameFunction) {
                        var info_1 = utils_1.getNodePathScopeInfo(_this.ast, deletionM.targetNodePath);
                        if (info_1.functionName !== undefined) {
                            // No need to update `faultSpace` since it's unused below
                            faultSpace_ = faultSpace_.filter(function (x) { return utils_1.isNodePathInScope(_this.ast, x.nodePath, info_1.contractName !== undefined ? [info_1.contractName] : undefined, info_1.functionName !== undefined ? [info_1.functionName] : undefined); });
                        }
                    }
                    var ASTaftDeletionM = lodash_1.cloneDeep(_this.ast);
                    deletionM.apply(ASTaftDeletionM);
                    var faultSpace_insertionMutation = faultSpace_.map(function (_a) {
                        var nodePath = _a.nodePath;
                        return { nodePath: deletionM.updateASTPath(_this.ast, nodePath) };
                    }).filter(function (_a) {
                        var nodePath = _a.nodePath;
                        return nodePath !== null;
                    });
                    return { deletionM: deletionM, insertionMutationGen: _1.InsertionM.randomGenerator(ASTaftDeletionM, faultSpace_insertionMutation, ASTNodeSpace_1.SeededASTNodeSpace.getSeededASTNodeSpace([nodeTobeDeleted]), ['ExpressionStatement'], _this.rng) };
                });
                this.arr_pair_deletionMInsertionMutationGen = lodash_1.unionWith(this.arr_pair_deletionMInsertionMutationGen, new_arr_pair_deletionMInsertionMGen, lodash_1.isEqual);
                return true;
            }
            case 'remove': {
                var DMgen_1 = _1.DeletionM.randomGenerator(this.ast, faultSpaceUpdateObj.faultSpaces, this.rng);
                lodash_1.remove(this.arr_pair_deletionMInsertionMutationGen, function (x) { return DMgen_1.isMutationInRemainingSpace(x.deletionM); });
                for (var _i = 0, _a = this.arr_pair_deletionMInsertionMutationGen; _i < _a.length; _i++) {
                    var space = _a[_i];
                    assert_1["default"](space.insertionMutationGen.updateFaultSpace(faultSpaceUpdateObj));
                }
                return true;
            }
            case 'intersect': {
                var DMgen_2 = _1.DeletionM.randomGenerator(this.ast, faultSpaceUpdateObj.faultSpaces, this.rng);
                lodash_1.remove(this.arr_pair_deletionMInsertionMutationGen, function (x) { return !DMgen_2.isMutationInRemainingSpace(x.deletionM); });
                for (var _b = 0, _c = this.arr_pair_deletionMInsertionMutationGen; _b < _c.length; _b++) {
                    var space = _c[_b];
                    assert_1["default"](space.insertionMutationGen.updateFaultSpace(faultSpaceUpdateObj));
                }
                return true;
            }
            default: {
                throw new UnimplementedError();
            }
        }
    };
    RandomMutationGenerator_MoveMutation.prototype.next = function () {
        while (this.arr_pair_deletionMInsertionMutationGen.length !== 0) {
            var chosen_idx = this.rng.integer({ min: 0, max: this.arr_pair_deletionMInsertionMutationGen.length - 1 });
            var pair_deletionMInsertionMGen = this.arr_pair_deletionMInsertionMutationGen[chosen_idx];
            var deletionM = pair_deletionMInsertionMGen.deletionM;
            var insertionM = pair_deletionMInsertionMGen.insertionMutationGen.next().value;
            if (insertionM === undefined) {
                this.arr_pair_deletionMInsertionMutationGen.splice(chosen_idx, 1);
                continue;
            }
            if (lodash_1.isEqual(deletionM.targetNodePath, __spreadArrays((insertionM.targetPropertyPath), [insertionM.insertIndex.toString()]))) {
                // Skip this, since it will create a MoveMutation that does nothing
                continue;
            }
            return { value: MovementM.fromMutation(this.ast, deletionM, insertionM), done: false };
        }
        return { value: undefined, done: true };
    };
    RandomMutationGenerator_MoveMutation.prototype.isMutationInRemainingSpace = function (_mutation) {
        throw new UnimplementedError();
    };
    RandomMutationGenerator_MoveMutation.prototype.numMutationRemaining = function () {
        throw new UnimplementedError();
    };
    return RandomMutationGenerator_MoveMutation;
}(RandomMutationGenerator_1["default"]));
