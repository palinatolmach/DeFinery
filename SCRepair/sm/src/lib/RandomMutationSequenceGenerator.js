"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var lodash_1 = require("lodash");
var logger_1 = require("../utils/logger");
var debug_1 = require("../utils/debug");
var SRCUtils_1 = require("../utils/SRCUtils");
var MutationSequence_1 = require("./MutationSequence");
var utils_1 = require("./utils");
var FaultSpace_1 = require("./FaultSpace");
var os_1 = require("os");
var util_1 = require("util");
var global_1 = require("../utils/global");
var fs_1 = require("fs");
var assert_1 = require("assert");
var chance_1 = require("chance");
var lodash_2 = require("lodash");
var ASTNodeSpace_1 = require("./ASTNodeSpace");
var Mutations_1 = require("./Mutations");
var utils_2 = require("./utils");
var RandomMutationGenerator_addKnownAST_Result;
(function (RandomMutationGenerator_addKnownAST_Result) {
    RandomMutationGenerator_addKnownAST_Result[RandomMutationGenerator_addKnownAST_Result["SUCCESS"] = 0] = "SUCCESS";
    RandomMutationGenerator_addKnownAST_Result[RandomMutationGenerator_addKnownAST_Result["ALREADY_SEEN_AST"] = 1] = "ALREADY_SEEN_AST";
    RandomMutationGenerator_addKnownAST_Result[RandomMutationGenerator_addKnownAST_Result["ALREADY_SEEN_BIN"] = 2] = "ALREADY_SEEN_BIN";
    RandomMutationGenerator_addKnownAST_Result[RandomMutationGenerator_addKnownAST_Result["NOT_COMPILABLE"] = 3] = "NOT_COMPILABLE";
})(RandomMutationGenerator_addKnownAST_Result = exports.RandomMutationGenerator_addKnownAST_Result || (exports.RandomMutationGenerator_addKnownAST_Result = {}));
var debugLogger_newMutant = debug_1["default"]('newMutant');
var debugLogger_newMutant_newMutation = debugLogger_newMutant.extend('newMutation');
var debugLogger_newMutant_newMutation_modifiedNodes = debugLogger_newMutant_newMutation.extend('modifiedNodes');
var debugLogger_newMutant_newFaultSpace = debugLogger_newMutant.extend('faultSpace');
var debugLogger_newMutant_mutSeq = debugLogger_newMutant.extend('mutSeq');
var debugLogger_newMutant_baseSeq = debugLogger_newMutant.extend('baseSeq');
var debugLogger_newMutant_bfAST = debugLogger_newMutant.extend('bfAST');
var debugLogger_newMutant_bfAST_faultSpace = debugLogger_newMutant_bfAST.extend('faultSpace');
var debugLogger_newMutant_aftAST = debugLogger_newMutant.extend('aftAST');
var debugLogger_newMutant_status = debugLogger_newMutant.extend('status');
var debugLogger_newMutant_status_sameAST = debugLogger_newMutant_status.extend('sameAST');
var debugLogger_newMutant_status_sameBin = debugLogger_newMutant_status.extend('sameBin');
var debugLogger_newMutant_status_non_compilable = debugLogger_newMutant_status.extend('non-compilable');
var RandomMutationGenerator_Result;
(function (RandomMutationGenerator_Result) {
    RandomMutationGenerator_Result["ExhaustedForRequestedAST"] = "ExhaustedForRequestedAST";
    RandomMutationGenerator_Result["TerminateRequested"] = "TerminateRequested";
})(RandomMutationGenerator_Result = exports.RandomMutationGenerator_Result || (exports.RandomMutationGenerator_Result = {}));
function faultSpaceToFaultSpaceInfo(faultSpace, possibleMutationTypes) {
    return {
        faultSpace: faultSpace,
        remainingMutation: lodash_2.cloneDeep(possibleMutationTypes)
    };
}
exports.faultSpaceToFaultSpaceInfo = faultSpaceToFaultSpaceInfo;
var RandomMutationSequenceGenerator = /** @class */ (function () {
    function RandomMutationSequenceGenerator(oriAST, minDistance, maxDistance, faultSpace_oriAST_, possibleMutationTypes, newNodeTypeSpace, must_include_mutation_types, replaceableNodeType, only_compilable, skip_same_bin, _mutate_mutated_location, seed) {
        if (minDistance === void 0) { minDistance = 1; }
        if (maxDistance === void 0) { maxDistance = Infinity; }
        if (possibleMutationTypes === void 0) { possibleMutationTypes = Mutations_1.allMutationTypes; }
        if (newNodeTypeSpace === void 0) { newNodeTypeSpace = undefined; }
        if (must_include_mutation_types === void 0) { must_include_mutation_types = undefined; }
        if (replaceableNodeType === void 0) { replaceableNodeType = undefined; }
        if (only_compilable === void 0) { only_compilable = true; }
        if (skip_same_bin === void 0) { skip_same_bin = true; }
        if (_mutate_mutated_location === void 0) { _mutate_mutated_location = false; }
        this.oriAST = oriAST;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.possibleMutationTypes = possibleMutationTypes;
        this.newNodeTypeSpace = newNodeTypeSpace;
        this.must_include_mutation_types = must_include_mutation_types;
        this.replaceableNodeType = replaceableNodeType;
        this.only_compilable = only_compilable;
        this.skip_same_bin = skip_same_bin;
        this._mutate_mutated_location = _mutate_mutated_location;
        this.bins = new Set(); // This is unused if skip_same_bin == false
        // Note: ASTs that can't be base will be removed from this Map
        this.dist_ast_infoMap = new Map();
        // Note: All seen ASTs are here
        this.ast_DistMap = new Map();
        if (faultSpace_oriAST_.length === 0) {
            logger_1["default"].warn('The initial fault space is empty! Nothing can be further done.');
        }
        assert_1["default"](must_include_mutation_types === undefined || must_include_mutation_types.every(function (type) { return possibleMutationTypes.includes(type); }), 'Some of must include mutation types are not in possible mutation types!');
        this.rng = seed === undefined ? new chance_1["default"]() : new chance_1["default"](seed);
        this.faultSpaceInfo_oriAST = faultSpace_oriAST_.map(function (x) { return faultSpaceToFaultSpaceInfo(x, possibleMutationTypes); });
        var addOriASTRst = this.addKnownAST(oriAST, new MutationSequence_1["default"](), this.faultSpaceInfo_oriAST);
        assert_1["default"](addOriASTRst === RandomMutationGenerator_addKnownAST_Result.SUCCESS);
    }
    RandomMutationSequenceGenerator.prototype.next = function (request) {
        var _this = this;
        if (request === void 0) { request = { requestAST: undefined, overriddenFaultSpace: undefined, allowedMutationTypes: undefined }; }
        var requestAST = request.requestAST, overriddenFaultSpace = request.overriddenFaultSpace, allowedMutationTypes = request.allowedMutationTypes;
        // Can only override fault space when there's AST requested
        assert_1["default"](overriddenFaultSpace === undefined || requestAST !== undefined);
        var _loop_1 = function () {
            // await util.promisify(process.nextTick)();
            if (global_1["default"].terminateNow || fs_1["default"].existsSync("/tmp/terminate_all")) {
                return { value: { value: RandomMutationGenerator_Result.TerminateRequested, done: false } };
            }
            var specifiedAST = requestAST !== undefined;
            var serializedAST = void 0, mutationGen = void 0, baseMutationSeq = void 0;
            var infoMap = void 0;
            var ast = requestAST;
            if (ast === undefined) {
                // Base AST not specified, randomly pick one
                var pickableAst_infoMap = Array.from(this_1.dist_ast_infoMap.entries())
                    .filter(function (_a) {
                    var dist = _a[0], map = _a[1];
                    return dist < _this.maxDistance && map.size > 0;
                })
                    .map(function (_a) {
                    var map = _a[1];
                    return map;
                });
                if (pickableAst_infoMap.length === 0) {
                    return { value: {
                            value: undefined,
                            done: true
                        } };
                }
                var ast_infoMap = this_1.rng.pickone(pickableAst_infoMap);
                var pickableSerializedASTs = Array.from(ast_infoMap.keys());
                assert_1["default"](pickableSerializedASTs.length >= 1);
                serializedAST = this_1.rng.pickone(pickableSerializedASTs);
                ast = JSON.parse(serializedAST);
                var infoMap_1 = ast_infoMap.get(serializedAST);
                assert_1["default"](infoMap_1 !== undefined, "Can't get infoMap for " + serializedAST + " while it was from keys");
                infoMap = infoMap_1;
            }
            else {
                serializedAST = JSON.stringify(ast);
                var dist = this_1.ast_DistMap.get(serializedAST);
                assert_1["default"](dist !== undefined, "Requested base AST not found in this class");
                assert_1["default"](dist < this_1.maxDistance, "Requested base AST is already at max distance, can't generate more ASTs based on it.");
                // assert(this.dist_ast_infoMap.has(dist!), `dist ${dist} retrieved from ast_DistMap is not in dist_ast_infoMap! dist_ast_infoMap available keys: ${[...this.dist_ast_infoMap.keys()]}`);
                if (dist === this_1.maxDistance) {
                    return { value: {
                            value: RandomMutationGenerator_Result.ExhaustedForRequestedAST,
                            done: false
                        } };
                }
                var ast_infoMap = this_1.dist_ast_infoMap.get(dist);
                if (ast_infoMap === undefined) {
                    return { value: {
                            value: RandomMutationGenerator_Result.ExhaustedForRequestedAST,
                            done: false
                        } };
                }
                infoMap = ast_infoMap.get(serializedAST);
                if (infoMap === undefined) {
                    return { value: {
                            value: RandomMutationGenerator_Result.ExhaustedForRequestedAST,
                            done: false
                        } };
                }
            }
            var infoMap_ = infoMap;
            mutationGen = infoMap_.mutationGen;
            var original_faultSpace_Path = infoMap_.faultspaceInfo;
            baseMutationSeq = infoMap_.mutationSeq;
            assert_1["default"](serializedAST !== undefined);
            assert_1["default"](ast !== undefined);
            assert_1["default"](mutationGen !== undefined);
            assert_1["default"](baseMutationSeq !== undefined);
            // Generate one mutation
            var newMutation = mutationGen.next({ allowedMutationTypes: allowedMutationTypes, overriddenFaultSpace: overriddenFaultSpace }).value;
            if (newMutation === undefined) {
                // Search space is already exhausted for current ast
                assert_1["default"](this_1.ast_DistMap.has(serializedAST));
                var ast_infoMap = this_1.dist_ast_infoMap.get(baseMutationSeq.length);
                assert_1["default"](ast_infoMap !== undefined);
                ast_infoMap["delete"](serializedAST);
                if (specifiedAST) {
                    if (this_1.isAllASTDone()) {
                        return { value: {
                                value: undefined,
                                done: true
                            } };
                    }
                    else {
                        return { value: {
                                value: RandomMutationGenerator_Result.ExhaustedForRequestedAST,
                                done: false
                            } };
                    }
                }
                else {
                    return "continue";
                }
            }
            else if (newMutation === addNewMutation_random_Result.RequestNotFulfilled) {
                return { value: {
                        value: RandomMutationGenerator_Result.ExhaustedForRequestedAST,
                        done: false
                    } };
            }
            var beforeAST = ast;
            debugLogger_newMutant_newMutation(newMutation);
            debugLogger_newMutant_baseSeq(baseMutationSeq);
            debugLogger_newMutant_bfAST(beforeAST);
            debugLogger_newMutant_bfAST_faultSpace(original_faultSpace_Path);
            debugLogger_newMutant_newMutation_modifiedNodes(newMutation.modifiedLocations(beforeAST));
            var newAST = lodash_2.cloneDeep(beforeAST);
            // Update AST and faultSpace
            newMutation.apply(newAST);
            debugLogger_newMutant_aftAST(newAST);
            var new_faultSpace_Path_ = original_faultSpace_Path
                .map(function (x) {
                var newNodePath = newMutation.updateASTPath.bind(newMutation, beforeAST)(x.faultSpace.nodePath);
                if (newNodePath === null) {
                    return null;
                }
                else if (lodash_1.isEqual(x.faultSpace.nodePath, newMutation.targetNodePath)) {
                    var mutationType = newMutation.mutationType;
                    assert_1["default"](x.remainingMutation.includes(mutationType), "New mutation of type `" + mutationType + "`is not in original remaining mutation array!" + os_1["default"].EOL + "remainingMutation = " + util_1["default"].inspect(x.remainingMutation, false, Infinity, true));
                    var newRemainingMutation = lodash_1.without(x.remainingMutation, mutationType);
                    if (newRemainingMutation.length !== 0) {
                        return { faultSpace: { nodePath: newNodePath }, remainingMutation: newRemainingMutation };
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return { faultSpace: { nodePath: newNodePath }, remainingMutation: x.remainingMutation };
                }
            })
                .filter(function (x) { return x !== null; });
            var new_faultSpaceInfo_Path = new_faultSpace_Path_;
            debugLogger_newMutant_newFaultSpace(new_faultSpaceInfo_Path);
            var newMutationSeq = new (MutationSequence_1["default"].bind.apply(MutationSequence_1["default"], __spreadArrays([void 0], __spreadArrays(baseMutationSeq, [newMutation]))))();
            debugLogger_newMutant_mutSeq(newMutationSeq);
            var addASTRst = this_1.addKnownAST(newAST, newMutationSeq, new_faultSpaceInfo_Path);
            switch (addASTRst) {
                case RandomMutationGenerator_addKnownAST_Result.ALREADY_SEEN_AST:
                case RandomMutationGenerator_addKnownAST_Result.ALREADY_SEEN_BIN:
                case RandomMutationGenerator_addKnownAST_Result.NOT_COMPILABLE: {
                    return "continue";
                }
                case RandomMutationGenerator_addKnownAST_Result.SUCCESS: {
                    var pass_must_include_types_check = true;
                    if (this_1.must_include_mutation_types !== undefined) {
                        var types_1 = lodash_1.uniq(newMutationSeq.map(function (x) { return x.mutationType; }));
                        pass_must_include_types_check = this_1.must_include_mutation_types.every(function (x) { return types_1.includes(x); });
                    }
                    if (pass_must_include_types_check) {
                        return { value: {
                                value: newMutationSeq,
                                done: false
                            } };
                    }
                    else {
                        return "continue";
                    }
                }
            }
        };
        var this_1 = this;
        while (true) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    RandomMutationSequenceGenerator.prototype.simplifyAST = function (ast_) {
        var simplificationMutationSeqs = [];
        var visitor = {
            IfStatement: function (node, path) {
                function isBodyEmpty(body) {
                    return body === null || (body.type === 'Block' && body.statements.length === 0);
                }
                if (isBodyEmpty(node.trueBody) && isBodyEmpty(node.falseBody)) {
                    // The condition might have side-effect, can't simply remove it
                    simplificationMutationSeqs.push(new (MutationSequence_1["default"].bind.apply(MutationSequence_1["default"], __spreadArrays([void 0], [new Mutations_1.ReplacementM(path, node.condition)])))());
                }
            }
        };
        utils_1.visitWithPath(ast_, visitor);
        var simplificationMutationSeqs_dists = simplificationMutationSeqs.map(function (x) { return x.length; });
        var idxLongestSimplificationSeq = simplificationMutationSeqs_dists.indexOf(Math.max.apply(Math, simplificationMutationSeqs_dists));
        var simplifiedAST = simplificationMutationSeqs.map(function (mutationSeq) { return mutationSeq.mutateAST(lodash_2.cloneDeep(ast_)); });
        for (var _i = 0, simplifiedAST_1 = simplifiedAST; _i < simplifiedAST_1.length; _i++) {
            var dupAST = simplifiedAST_1[_i];
            var serializedDupAST = JSON.stringify(dupAST);
            this.ast_DistMap.set(serializedDupAST, Infinity);
        }
        return simplifiedAST[idxLongestSimplificationSeq];
    };
    RandomMutationSequenceGenerator.prototype.addKnownAST = function (ast_, mutationSequence, new_faultSpace__) {
        var _this = this;
        // TODO: fix typing
        var new_faultSpaceInfo_ = new_faultSpace__;
        if (new_faultSpace__ !== undefined && new_faultSpace__.length !== 0 && new_faultSpace__[0]['remainingMutation'] === undefined) {
            new_faultSpaceInfo_ = new_faultSpace__.map(function (x) { return faultSpaceToFaultSpaceInfo(x, _this.possibleMutationTypes); });
        }
        var ASTCopy_ = lodash_2.cloneDeep(ast_);
        utils_1.ASTNodeRemoveExtraAttributesDeep(ASTCopy_);
        var ASTCopy = ASTCopy_;
        var serializedNewAST = JSON.stringify(ASTCopy);
        if (this.ast_DistMap.has(serializedNewAST)) {
            // The created AST has found before, trying another one
            debugLogger_newMutant_status_sameAST('Seen AST found!');
            return RandomMutationGenerator_addKnownAST_Result.ALREADY_SEEN_AST;
        }
        // Now confirms the newAST has never seen before
        var newDist = mutationSequence.length;
        this.ast_DistMap.set(serializedNewAST, newDist);
        if (newDist < this.maxDistance) {
            var new_faultSpaceInfo_Path = void 0;
            if ((new_faultSpaceInfo_Path = new_faultSpaceInfo_) === undefined) {
                new_faultSpaceInfo_Path = lodash_1.zip(mutationSequence.updatePath_oriAST(this.oriAST, this.faultSpaceInfo_oriAST.map(function (x) { return FaultSpace_1.getFaultSpaceNodePath(x.faultSpace); })), this.faultSpaceInfo_oriAST.map(function (x) {
                    return { remainingMutation: x.remainingMutation };
                }))
                    .filter(function (x) { return x[0] !== null; }).map((function (_a) {
                    var nodePath = _a[0], x = _a[1];
                    return { faultSpace: { nodePath: nodePath }, remainingMutation: x.remainingMutation };
                }));
            }
            if (new_faultSpaceInfo_Path.length !== 0) {
                var ast_infoMap = void 0;
                if ((ast_infoMap = this.dist_ast_infoMap.get(newDist)) === undefined) {
                    ast_infoMap = new Map();
                    this.dist_ast_infoMap.set(newDist, ast_infoMap);
                }
                assert_1["default"](!ast_infoMap.has(serializedNewAST));
                ast_infoMap.set(serializedNewAST, {
                    mutationGen: new RandomMutationGenerator(ASTCopy, new_faultSpaceInfo_Path, this.possibleMutationTypes, this.newNodeTypeSpace, this.replaceableNodeType, this.rng.integer()),
                    mutationSeq: mutationSequence,
                    faultspaceInfo: new_faultSpaceInfo_Path
                });
            }
            else {
                // No space for further mutation, won't be considered as base for further mutation
            }
        }
        if (this.only_compilable) {
            var compileOut = utils_1.compile(SRCUtils_1.a2S(ASTCopy), true, this.skip_same_bin);
            if (compileOut !== false) {
                if (this.skip_same_bin) {
                    var bins_without_swarm = lodash_1.mapValues(compileOut, function (bin) { return utils_1.stripSwarmMetadata(bin); });
                    // const bins_without_swarm = compileOut;
                    // TODO: A more efficient but safe serialization
                    var serializedCompileOut = JSON.stringify(bins_without_swarm);
                    if (this.bins.has(serializedCompileOut)) {
                        debugLogger_newMutant_status_sameBin('Same bin found');
                        return RandomMutationGenerator_addKnownAST_Result.ALREADY_SEEN_BIN;
                    }
                    else {
                        this.bins.add(serializedCompileOut);
                    }
                }
            }
            else {
                // Not compilable
                debugLogger_newMutant_status_non_compilable('Not compilable');
                return RandomMutationGenerator_addKnownAST_Result.NOT_COMPILABLE;
            }
        }
        return RandomMutationGenerator_addKnownAST_Result.SUCCESS;
    };
    RandomMutationSequenceGenerator.prototype.isAllASTDone = function () {
        var _this = this;
        return !Array.from(this.dist_ast_infoMap.entries()).some(function (_a) {
            var dist = _a[0], map = _a[1];
            return dist < _this.maxDistance && map.size > 0;
        });
    };
    RandomMutationSequenceGenerator.prototype.findASTByMutationSequence = function (mutationSequence) {
        var dist = mutationSequence.length;
        var ast_infoMap = this.dist_ast_infoMap.get(dist);
        if (ast_infoMap === undefined) {
            return undefined;
        }
        for (var _i = 0, _a = ast_infoMap.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], serializedAST = _b[0], info = _b[1];
            if (lodash_1.isEqual(info.mutationSeq, mutationSequence)) {
                return JSON.parse(serializedAST);
            }
        }
        return undefined;
    };
    // public numMutantRemaining(): number {
    //   const cloneGen = lodash_cloneDeep(this);
    //   let count: number = 0;
    //   for (const _ of cloneGen) {
    //     count++;
    //   }
    //   return count;
    // }
    RandomMutationSequenceGenerator.prototype[Symbol.iterator] = function () {
        return this;
    };
    return RandomMutationSequenceGenerator;
}());
exports["default"] = RandomMutationSequenceGenerator;
function getFaultSpaceInfoNodePair(ast, faultSpace) {
    return faultSpace.map(function (x) {
        var node = utils_2.getASTNodeFromPath(ast, x.faultSpace.nodePath);
        assert_1["default"](node !== undefined, "FaultSpace " + util_1["default"].inspect(x, false, Infinity, true) + " not found in AST");
        return [x, node];
    });
}
var addNewMutation_random_Result;
(function (addNewMutation_random_Result) {
    addNewMutation_random_Result[addNewMutation_random_Result["RequestNotFulfilled"] = 0] = "RequestNotFulfilled";
})(addNewMutation_random_Result = exports.addNewMutation_random_Result || (exports.addNewMutation_random_Result = {}));
var RandomMutationGenerator = /** @class */ (function () {
    function RandomMutationGenerator(ast_, faultSpaceInfo_, possibleMutationTypes_, newNodeTypeSpace, replaceableNodeType, seed) {
        if (possibleMutationTypes_ === void 0) { possibleMutationTypes_ = Mutations_1.allMutationTypes; }
        if (newNodeTypeSpace === void 0) { newNodeTypeSpace = undefined; }
        if (replaceableNodeType === void 0) { replaceableNodeType = undefined; }
        var ast = lodash_2.cloneDeep(ast_);
        var faultSpaceInfo = lodash_2.cloneDeep(faultSpaceInfo_);
        assert_1["default"](faultSpaceInfo.length !== 0);
        assert_1["default"](possibleMutationTypes_.length !== 0);
        this.possibleMutationTypes = lodash_2.cloneDeep(possibleMutationTypes_);
        this.rng = seed === undefined ? new chance_1["default"]() : new chance_1["default"](seed);
        var astNodeSpace = new ASTNodeSpace_1.RandomASTNodeSpace(ast);
        var faultSpaceInfo_Node = getFaultSpaceInfoNodePair(ast, faultSpaceInfo);
        var faultSpaces_insertionMutation = faultSpaceInfo_Node.filter(function (x) { return x[0].remainingMutation.includes(Mutations_1.InsertionM.name); }).map(function (x) { return x[0].faultSpace; });
        this.insertionM_Gen = Mutations_1.InsertionM.randomGenerator(ast, faultSpaces_insertionMutation, astNodeSpace, ['ExpressionStatement'], this.rng);
        this.replacementM_Gen = Mutations_1.ReplacementM.randomGenerator(ast, faultSpaceInfo_Node.filter(function (x) { return x[0].remainingMutation.includes(Mutations_1.ReplacementM.name); }).map(function (x) { return x[0].faultSpace; }), astNodeSpace, replaceableNodeType === undefined ? astNodeSpace.supportedNodeTypes : replaceableNodeType, newNodeTypeSpace === undefined ? astNodeSpace.supportedNodeTypes : newNodeTypeSpace, this.rng);
        this.deletionM_Gen = Mutations_1.DeletionM.randomGenerator(ast, faultSpaceInfo.filter(function (x) { return x.remainingMutation.includes(Mutations_1.DeletionM.name); }).map(function (x) { return x.faultSpace; }), this.rng);
        this.movementM_Gen = Mutations_1.MovementM.randomGenerator(ast, faultSpaceInfo.filter(function (x) { return x.remainingMutation.includes(Mutations_1.MovementM.name); }).map(function (x) { return x.faultSpace; }), true, this.rng);
    }
    RandomMutationGenerator.prototype.next = function (request) {
        var _a;
        if (request === void 0) { request = { allowedMutationTypes: undefined, overriddenFaultSpace: undefined }; }
        while (true) {
            if (this.possibleMutationTypes.length === 0) {
                // no mutataion possible
                return { value: undefined, done: true };
            }
            var allowedMutationTypes = request.allowedMutationTypes, overriddenFaultSpace = request.overriddenFaultSpace;
            var possibleMutationTypes_ = allowedMutationTypes !== undefined ? lodash_2.intersection(this.possibleMutationTypes, allowedMutationTypes) : this.possibleMutationTypes;
            if (possibleMutationTypes_.length === 0) {
                return { value: addNewMutation_random_Result.RequestNotFulfilled, done: false };
            }
            var newMutationType = this.rng.pickone(possibleMutationTypes_);
            assert_1["default"](typeof newMutationType !== 'undefined');
            var genNameMap = (_a = {},
                _a[Mutations_1.InsertionM.name] = this.insertionM_Gen,
                _a[Mutations_1.ReplacementM.name] = this.replacementM_Gen,
                _a[Mutations_1.DeletionM.name] = this.deletionM_Gen,
                _a[Mutations_1.MovementM.name] = this.movementM_Gen,
                _a);
            var chosenMutationGen = genNameMap[newMutationType];
            if (overriddenFaultSpace !== undefined) {
                // Make this logic more generic
                assert_1["default"](chosenMutationGen.updateFaultSpace({
                    updateType: 'intersect',
                    faultSpaces: overriddenFaultSpace
                }));
            }
            var newMutation = chosenMutationGen.next().value;
            if (newMutation === undefined) {
                lodash_2.pull(this.possibleMutationTypes, newMutationType);
                continue;
            }
            return { value: newMutation, done: false };
        }
    };
    RandomMutationGenerator.prototype.isMutationInRemainingSpace = function (mutation) {
        if (!this.possibleMutationTypes.includes(mutation.mutationType)) {
            return false;
        }
        switch (mutation.mutationType) {
            case Mutations_1.InsertionM.name: {
                return this.insertionM_Gen.isMutationInRemainingSpace(mutation);
            }
            case Mutations_1.ReplacementM.name: {
                return this.replacementM_Gen.isMutationInRemainingSpace(mutation);
            }
            case Mutations_1.MovementM.name: {
                return this.movementM_Gen.isMutationInRemainingSpace(mutation);
            }
            case Mutations_1.DeletionM.name: {
                return this.deletionM_Gen.isMutationInRemainingSpace(mutation);
            }
            default: {
                throw new UnimplementedError();
            }
        }
    };
    RandomMutationGenerator.prototype[Symbol.iterator] = function () {
        return this;
    };
    return RandomMutationGenerator;
}());
exports.RandomMutationGenerator = RandomMutationGenerator;
