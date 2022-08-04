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
var Mutation_1 = require("./Mutation");
var RandomMutationGenerator_1 = require("./RandomMutationGenerator");
var utils_1 = require("../utils");
var assert_1 = require("assert");
var util_1 = require("util");
var MutationSequence_1 = require("../MutationSequence");
var FaultSpace_1 = require("../FaultSpace");
var ASTNodeSpace_1 = require("../ASTNodeSpace");
var lodash_1 = require("lodash");
var debug_1 = require("debug");
var os_1 = require("os");
var debugLogger_space = debug_1["default"]('space');
var debugLogger_insertableSpace = debugLogger_space.extend('InsertableSpace');
var debugLogger_insertableSpace_insertableLocations = debugLogger_insertableSpace.extend('insertableLocations');
/*
    Mutation that will add a new node
*/
var InsertionM = /** @class */ (function (_super) {
    __extends(InsertionM, _super);
    function InsertionM(targetPropertyPath, insertIndex, newNode) {
        var _this = 
        // NOTE: Assume the property is an immediate attribute of the target node
        _super.call(this, targetPropertyPath.slice(0, -1)) || this;
        _this.targetPropertyPath = targetPropertyPath;
        _this.insertIndex = insertIndex;
        _this.newNode = newNode;
        _this.mutationType = InsertionM.name;
        return _this;
    }
    InsertionM.prototype.apply = function (ast) {
        var children = lodash_1.get(ast, this.targetPropertyPath);
        assert_1["default"](Array.isArray(children), "Property with path " + util_1["default"].inspect(this.targetPropertyPath, false, Infinity, true) + " expected to be an array! targetNode =\n" + util_1["default"].inspect(lodash_1.get(ast, this.targetNodePath), true, Infinity, true));
        assert_1["default"](this.insertIndex <= children.length, "InsertIndex " + this.insertIndex + " is larger than AST array length " + children.length + "!" + os_1["default"].EOL + "Mutation: " + util_1["default"].inspect(this, true, Infinity, true));
        children.splice(this.insertIndex, 0, lodash_1.cloneDeep(this.newNode));
    };
    InsertionM.prototype.updateASTPath = function (_ast, path) {
        if (this.targetPropertyPath.every(function (x, idx) { return x === path[idx]; }) && path.length > this.targetPropertyPath.length) {
            var target = path[this.targetPropertyPath.length];
            assert_1["default"](typeof target === 'string');
            var targetNum = parseInt(target);
            if (targetNum >= this.insertIndex) {
                var newPath = lodash_1.cloneDeep(path);
                newPath[this.targetPropertyPath.length] = (targetNum + 1).toString();
                return newPath;
            }
        }
        return path;
    };
    InsertionM.prototype.reverseUpdateASTPath = function (_ast, path) {
        if (this.targetPropertyPath.every(function (x, idx) { return x === path[idx]; }) && path.length > this.targetPropertyPath.length) {
            // The path points to an element passing through the this.targetPropertyPath
            var target = path[this.targetPropertyPath.length];
            assert_1["default"](typeof target === 'string');
            var targetNum = parseInt(target);
            if (targetNum - 1 >= this.insertIndex) {
                // 1 was added to the targetNum
                var newPath = lodash_1.cloneDeep(path);
                newPath[this.targetPropertyPath.length] = (targetNum - 1).toString();
                return newPath;
            }
        }
        return path;
    };
    InsertionM.prototype.rebase = function (oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs) {
        var insertionLocationNodePath = __spreadArrays(this.targetPropertyPath, [this.insertIndex.toString()]);
        var newInsertionLocationNodePath_ = MutationSequence_1.rebasePath(insertionLocationNodePath, oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs);
        if (newInsertionLocationNodePath_ === undefined) {
            return undefined;
        }
        var newInsertIndex = parseInt(newInsertionLocationNodePath_.splice(-1, 1)[0]);
        var newTargetPropertyPath = newInsertionLocationNodePath_;
        return new InsertionM(newTargetPropertyPath, newInsertIndex, this.newNode);
    };
    InsertionM.randomGenerator = function (forAST, faultSpace_Node, astNodeSpace, insertionNewNodeTypeSpace, rng) {
        if (insertionNewNodeTypeSpace === void 0) { insertionNewNodeTypeSpace = ['ExpressionStatement']; }
        return new RandomMutationGenerator_InsertionM(forAST, faultSpace_Node, astNodeSpace, insertionNewNodeTypeSpace, rng);
    };
    InsertionM.prototype.modifiedLocations = function (ast, nodepathLocMap) {
        if (nodepathLocMap === void 0) { nodepathLocMap = new Map(); }
        var node = utils_1.getASTNodeFromPath(ast, utils_1.findASTParentNode(ast, this.targetPropertyPath));
        if (node.loc !== undefined) {
            return [node.loc];
        }
        else {
            var matchingLoc = nodepathLocMap.get(JSON.stringify(this.targetNodePath));
            return matchingLoc !== undefined ? matchingLoc : 'unknown';
        }
    };
    InsertionM.prototype.modifiedNodePath = function (_ast) {
        return [__spreadArrays(this.targetPropertyPath, [this.insertIndex.toString()])];
    };
    return InsertionM;
}(Mutation_1["default"]));
exports["default"] = InsertionM;
var RandomMutationGenerator_InsertionM = /** @class */ (function (_super) {
    __extends(RandomMutationGenerator_InsertionM, _super);
    function RandomMutationGenerator_InsertionM(forAST, faultSpaces, astNodeSpace, original_insertionNewNodeTypeSpace, rng) {
        if (original_insertionNewNodeTypeSpace === void 0) { original_insertionNewNodeTypeSpace = ['ExpressionStatement']; }
        var _this = _super.call(this) || this;
        _this.forAST = forAST;
        _this.astNodeSpace = astNodeSpace;
        _this.original_insertionNewNodeTypeSpace = original_insertionNewNodeTypeSpace;
        _this.rng = rng;
        _this.insertionNewNodeGens = new Map();
        _this.insertableSpaces = [];
        // We can only insert ExpressionStatement
        _this.insertionNewNodeTypeSpace = __spreadArrays(original_insertionNewNodeTypeSpace);
        assert_1["default"](_this.updateFaultSpace({
            updateType: 'add',
            faultSpaces: faultSpaces
        }));
        return _this;
    }
    RandomMutationGenerator_InsertionM.prototype.updateFaultSpace = function (faultSpaceUpdateObj) {
        var _this = this;
        switch (faultSpaceUpdateObj.updateType) {
            case 'add': {
                // WARNING: current design only expects add request will only be done once!
                var faultSpace_Node = FaultSpace_1.getFaultSpaceNodePair(this.forAST, faultSpaceUpdateObj.faultSpaces);
                var insertablePropertyPaths_ = lodash_1.flatMap(faultSpace_Node, function (x) {
                    // TODO; this is only doing for one level. Is there a need to support deeper level?
                    return Object.keys(x[1])
                        .filter(function (k) { return Array.isArray(x[1][k]) && !utils_1.disallowKeys.has(k); }) // Can only add new nodes to array type of properties
                        .map(function (k) {
                        var propertyPath = __spreadArrays((x[0].nodePath), [k]);
                        return { fromFaultSpace: x[0], propertyPath: propertyPath, property: x[1][k], newNodeGenerationCtx: new ASTNodeSpace_1.NewNodeGenerationContext(utils_1.getNodePathScopeInfo(_this.forAST, propertyPath), undefined) };
                    });
                });
                debugLogger_insertableSpace(util_1["default"].inspect(insertablePropertyPaths_.map(function (_a) {
                    var propertyPath = _a.propertyPath, property = _a.property;
                    return { propertyPath: propertyPath, property: property };
                }), true, Infinity, true));
                var new_insertableSpaces = lodash_1.flatMap(insertablePropertyPaths_, function (x) {
                    return lodash_1.range(0, x.property.length + 1).map(function (idx) {
                        var weigh = 1;
                        return { fromFaultSpace: x.fromFaultSpace, propertyPath: x.propertyPath, insertIndex: idx, weigh: weigh, newNodeGenerationCtx: x.newNodeGenerationCtx };
                    });
                });
                this.insertableSpaces = lodash_1.unionWith(this.insertableSpaces, new_insertableSpaces, function (a, b) { return lodash_1.isEqual({ propertyPath: a.propertyPath, insertIndex: a.insertIndex }, { propertyPath: b.propertyPath, insertIndex: b.insertIndex }); });
                debugLogger_insertableSpace_insertableLocations(this.insertableSpaces);
                return true;
            }
            case 'intersect': {
                this.insertableSpaces = this.insertableSpaces.filter(function (s) { return faultSpaceUpdateObj.faultSpaces.some(function (x) { return lodash_1.isEqual(s.fromFaultSpace.nodePath, x.nodePath); }); });
                return true;
            }
            case 'remove': {
                this.insertableSpaces = this.insertableSpaces.filter(function (s) { return !faultSpaceUpdateObj.faultSpaces.some(function (x) { return lodash_1.isEqual(s.fromFaultSpace.nodePath, x.nodePath); }); });
                return true;
            }
            default: {
                throw new UnimplementedError();
            }
        }
    };
    RandomMutationGenerator_InsertionM.prototype.next = function () {
        while (this.insertableSpaces.length !== 0 && this.insertionNewNodeTypeSpace.length !== 0) {
            var pair_insertablePropertyPath_insertableIndex = this.rng.weighted(this.insertableSpaces, this.insertableSpaces.map(function (x) { return x.weigh; }));
            var chosenPropertyPath = pair_insertablePropertyPath_insertableIndex.propertyPath;
            var chosenNodeType = this.rng.pickone(this.insertionNewNodeTypeSpace); // Note: likely to generate non-compilable code
            var newNodeGenerationCtx = pair_insertablePropertyPath_insertableIndex.newNodeGenerationCtx;
            var map_InsertLoc_NodeGen = void 0;
            if ((map_InsertLoc_NodeGen = this.insertionNewNodeGens.get(chosenNodeType)) === undefined) {
                map_InsertLoc_NodeGen = new Map();
                this.insertionNewNodeGens.set(chosenNodeType, map_InsertLoc_NodeGen);
            }
            var serialized_pair_insertablePropertyPath_insertableIndex = JSON.stringify(pair_insertablePropertyPath_insertableIndex);
            var nodeGen = void 0;
            if ((nodeGen = map_InsertLoc_NodeGen.get(serialized_pair_insertablePropertyPath_insertableIndex)) === undefined) {
                nodeGen = this.astNodeSpace.getASTNodeGenerator(chosenNodeType, newNodeGenerationCtx, this.rng.seed);
                map_InsertLoc_NodeGen.set(serialized_pair_insertablePropertyPath_insertableIndex, nodeGen);
            }
            var insertIndex = pair_insertablePropertyPath_insertableIndex.insertIndex;
            var newNode = nodeGen.next().value;
            // assert(newNode !== undefined, `newNode for node type ${chosenNodeType} is undefined!`);
            if (newNode === undefined) {
                // No element can be generated from this node type
                lodash_1.pull(this.insertionNewNodeTypeSpace, chosenNodeType);
                continue;
            }
            return { value: new InsertionM(chosenPropertyPath, insertIndex, newNode), done: false };
        }
        return { value: undefined, done: true };
    };
    RandomMutationGenerator_InsertionM.prototype.isMutationInRemainingSpace = function (mutation) {
        var insertableSpace = this.insertableSpaces.find(function (x) { return x.propertyPath === mutation.targetPropertyPath && x.insertIndex === mutation.insertIndex; });
        if (insertableSpace === undefined) {
            return false;
        }
        return this.astNodeSpace.isNodeInSpace(mutation.newNode, insertableSpace.newNodeGenerationCtx);
    };
    RandomMutationGenerator_InsertionM.prototype.numMutationRemaining = function () {
        throw new UnimplementedError();
    };
    return RandomMutationGenerator_InsertionM;
}(RandomMutationGenerator_1["default"]));
