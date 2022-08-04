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
var utils_1 = require("../utils");
var assert_1 = require("assert");
var util_1 = require("util");
var MutationSequence_1 = require("../MutationSequence");
var FaultSpace_1 = require("../FaultSpace");
var ASTNodeSpace_1 = require("../ASTNodeSpace");
var os_1 = require("os");
var lodash_1 = require("lodash");
var debug_1 = require("debug");
var RandomMutationGenerator_1 = require("./RandomMutationGenerator");
var debugLogger_space = debug_1["default"]('space');
var debugLogger_replaceableSpace = debugLogger_space.extend('replaceableSpace');
var ReplacementM = /** @class */ (function (_super) {
    __extends(ReplacementM, _super);
    function ReplacementM(targetNodePath, newNode) {
        var _this = _super.call(this, targetNodePath) || this;
        _this.targetNodePath = targetNodePath;
        _this.newNode = newNode;
        _this.mutationType = ReplacementM.name;
        _this.transformFunc = function (oriNode) { return ReplacementM.transformNodeFunc(oriNode, newNode); };
        return _this;
    }
    ReplacementM.prototype.apply = function (ast) {
        var _this = this;
        lodash_1.update(ast, this.targetNodePath, function (oriTargetNode) { return _this.transformFunc(oriTargetNode); });
    };
    ReplacementM.prototype.updateASTPath = function (_ast, path) {
        // Note: This could be improved
        if (utils_1.arrStartsWithArr(path, this.targetNodePath) && path.length !== this.targetNodePath.length) {
            // Since the structure of the node might even be thoroughly changed, we mark path pointing to subnodes of the original replaced node invalid
            return null;
        }
        return path;
    };
    ReplacementM.prototype.reverseUpdateASTPath = function (_ast, path) {
        // Note: This could be improved
        return this.updateASTPath(_ast, path);
    };
    ReplacementM.prototype.modifiedNodePath = function (_ast) {
        return [this.targetNodePath];
    };
    ReplacementM.transformNodeFunc = function (oriNode, newNode_) {
        assert_1["default"](utils_1.isASTNode(oriNode), "oriNode is not an ASTNode: " + os_1["default"].EOL + util_1["default"].inspect(oriNode, false, Infinity, true));
        var newNode = lodash_1.cloneDeep(newNode_);
        // const arrTypeAttributes = (Object.keys(oriNode) as Array<keyof typeof oriNode>).filter(k =>
        //   Array.isArray((oriNode as any)[k]),
        // );
        // for (const attr of arrTypeAttributes) {
        //   newNode[attr] = oriNode[attr] as any;
        // }
        return newNode;
    };
    ReplacementM.prototype.rebase = function (oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs) {
        var newTargetNodePath = MutationSequence_1.rebasePath(this.targetNodePath, oriAST, fromMutationSequence, beforeMutationASTs, afterMutationSequence, afterMutationASTs);
        return newTargetNodePath !== undefined ? new ReplacementM(newTargetNodePath, this.newNode) : undefined;
    };
    ReplacementM.prototype.toJSON = function () {
        return {
            mutationType: ReplacementM.name,
            targetNodePath: this.targetNodePath,
            newNode: this.newNode
        };
    };
    ReplacementM.randomGenerator = function (forAST, faultSpaces, astNodeSpace, replaceNodeType, newNodeTypeSpace, rng) {
        return new RandomMutationGenerator_ReplacementM(forAST, faultSpaces, astNodeSpace, replaceNodeType, newNodeTypeSpace, rng);
    };
    return ReplacementM;
}(_1.Mutation));
exports.ReplacementM = ReplacementM;
var RandomMutationGenerator_ReplacementM = /** @class */ (function (_super) {
    __extends(RandomMutationGenerator_ReplacementM, _super);
    function RandomMutationGenerator_ReplacementM(forAST, faultSpaces, astNodeSpace, replaceNodeType, newNodeTypeSpace, rng) {
        var _this = _super.call(this) || this;
        _this.forAST = forAST;
        _this.astNodeSpace = astNodeSpace;
        _this.replaceNodeType = replaceNodeType;
        _this.newNodeTypeSpace = newNodeTypeSpace;
        _this.rng = rng;
        _this.supportedReplaceableNodes = [];
        _this.chosenNodeNewNodeGen = new Map();
        assert_1["default"](_this.updateFaultSpace({
            updateType: 'add',
            faultSpaces: faultSpaces
        }));
        return _this;
    }
    RandomMutationGenerator_ReplacementM.prototype.next = function () {
        while (true) {
            if (this.supportedReplaceableNodes.length === 0) {
                return { value: undefined, done: true };
            }
            var chosenNode = this.rng.weighted(this.supportedReplaceableNodes, this.supportedReplaceableNodes.map(function (_x) { return 1; }));
            var chosenFaultSpace = chosenNode[0];
            var newNodeGenerationCtx = chosenNode[2];
            assert_1["default"](chosenNode[1].length !== 0);
            var chosenNodeType = this.rng.pickone(chosenNode[1]); // Note: likely to generate non-compilable code
            var newNodeGens = void 0;
            if ((newNodeGens = this.chosenNodeNewNodeGen.get(chosenFaultSpace)) === undefined) {
                newNodeGens = new Map();
                this.chosenNodeNewNodeGen.set(chosenFaultSpace, newNodeGens);
            }
            var newNodeGen = void 0;
            if ((newNodeGen = newNodeGens.get(chosenNodeType)) === undefined) {
                newNodeGen = this.astNodeSpace.getASTNodeGenerator(chosenNodeType, newNodeGenerationCtx, this.rng.integer());
                newNodeGens.set(chosenNodeType, newNodeGen);
            }
            var newNode = newNodeGen.next().value;
            if (newNode === undefined) {
                // For this node path, chosenNodeType can't generate any new node
                // Potentially can free some memory here
                lodash_1.pull(chosenNode[1], chosenNodeType);
                if (chosenNode[1].length === 0) {
                    lodash_1.pull(this.supportedReplaceableNodes, chosenNode);
                }
                continue;
            }
            return { value: new ReplacementM(chosenFaultSpace.nodePath, newNode), done: false };
        }
    };
    RandomMutationGenerator_ReplacementM.prototype.isMutationInRemainingSpace = function (mutation) {
        var supportedReplaceableNode = this.supportedReplaceableNodes.find(function (space) { return lodash_1.isEqual(space[0].nodePath, mutation.targetNodePath); });
        if (supportedReplaceableNode === undefined) {
            return false;
        }
        if (!supportedReplaceableNode[1].includes(mutation.newNode.type)) {
            return false;
        }
        return this.astNodeSpace.isNodeInSpace(mutation.newNode, supportedReplaceableNode[2]);
    };
    RandomMutationGenerator_ReplacementM.prototype.updateFaultSpace = function (faultSpaceUpdateObj) {
        var _this = this;
        switch (faultSpaceUpdateObj.updateType) {
            case 'add': {
                // WARNING: current design only expects add request will only be done once!
                var faultSpace_Node = FaultSpace_1.getFaultSpaceNodePair(this.forAST, faultSpaceUpdateObj.faultSpaces);
                // const ignoredAttributes = ['range', 'loc', 'comments'];
                var newSupportedReplacableNodes = faultSpace_Node.reduce(function (acc, x) {
                    if (!_this.replaceNodeType.includes(x[1].type) || utils_1.astNodeContainsNonEmptyBlock(x[1])) {
                        return acc;
                    }
                    // const arrTypeAttributes = Object.keys(x[1]).filter(
                    //     k => Array.isArray((x[1] as any)[k]) && !ignoredAttributes.includes(k),
                    // );
                    var newNodeGenerationCtx = new ASTNodeSpace_1.NewNodeGenerationContext(utils_1.getNodePathScopeInfo(_this.forAST, x[0].nodePath), x[1].loc);
                    // const nodeTypeReplaceWith = newNodeTypeSpace.filter(t => {
                    //     const space = astNodeSpace[t](newNodeGenerationCtx);
                    //     return (
                    //         typeof space !== 'undefined' &&
                    //         arrTypeAttributes.every(x => (typeof (space as any)[x] === 'function' || Array.isArray((space as any)[x])))
                    //     );
                    // });
                    var nodeTypeReplaceWith = __spreadArrays(_this.newNodeTypeSpace);
                    if (nodeTypeReplaceWith.length !== 0) {
                        acc.push([x[0], nodeTypeReplaceWith, newNodeGenerationCtx]);
                    }
                    return acc;
                }, []);
                this.supportedReplaceableNodes = lodash_1.unionWith(newSupportedReplacableNodes, this.supportedReplaceableNodes, function (a, b) { return lodash_1.isEqual(a[0].nodePath, b[0].nodePath); });
                debugLogger_replaceableSpace(this.supportedReplaceableNodes);
                return true;
            }
            case 'remove': {
                lodash_1.pullAllWith(this.supportedReplaceableNodes, faultSpaceUpdateObj.faultSpaces, function (replaceableNode, faultSpace) { return lodash_1.isEqual(replaceableNode[0].nodePath, faultSpace.nodePath); });
                return true;
            }
            case 'intersect': {
                // Done
                lodash_1.intersectionWith(this.supportedReplaceableNodes, faultSpaceUpdateObj.faultSpaces, function (replaceableNode, faultSpace) { return lodash_1.isEqual(replaceableNode[0].nodePath, faultSpace.nodePath); });
                return true;
            }
            default: {
                throw new UnimplementedError();
            }
        }
    };
    RandomMutationGenerator_ReplacementM.prototype.numMutationRemaining = function () {
        throw new UnimplementedError();
    };
    return RandomMutationGenerator_ReplacementM;
}(RandomMutationGenerator_1["default"]));
