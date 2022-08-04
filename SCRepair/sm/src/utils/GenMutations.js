"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var assert_1 = require("assert");
var debug_1 = require("../utils/debug");
var fs_1 = require("fs");
var mkdirp_1 = require("mkdirp");
var path_1 = require("path");
var parser_1 = require("prettier-plugin-solidity/src/parser");
var readline_1 = require("readline");
var treeify_1 = require("treeify");
var ts_essentials_1 = require("ts-essentials");
var util_1 = require("util");
var Mutations_1 = require("../lib/Mutations");
var MutationSequence_1 = require("../lib/MutationSequence");
var RandomMutationSequenceGenerator_1 = require("../lib/RandomMutationSequenceGenerator");
var utils_1 = require("../lib/utils");
var logger_1 = require("./logger");
var SRCUtils_1 = require("./SRCUtils");
var InterestedSpaceSpecifierParser_1 = require("../lib/InterestedSpaceSpecifierParser");
var utils_2 = require("../lib/utils");
var global_1 = require("./global");
var lodash_1 = require("lodash");
var debugLogger_interaction = debug_1["default"]('inter');
var debugLogger_interaction_in = debugLogger_interaction.extend('in');
var debugLogger_interaction_out = debugLogger_interaction.extend('out');
var debugLogger_space = debug_1["default"]('space');
var debugLogger_faultSpace = debugLogger_space.extend('FaultSpace');
var debugLogger_ast = debug_1["default"]('ast');
var debugLogger_oriAST = debugLogger_ast.extend('oriAST');
function genMutations(x, max_num_seq, maxMutationDistance, patched_src_dir, seed, skip_same_bin, interested_space_specifier, ASTNewNodeTypes, must_include_mutation_types, replaceableNodeType, simplify, output_mutation, mutate_mutated_location) {
    var _this = this;
    if (maxMutationDistance === void 0) { maxMutationDistance = Infinity; }
    logger_1["default"].info("Using seed \"" + seed + "\" as type " + typeof seed);
    if (patched_src_dir !== undefined) {
        mkdirp_1["default"].sync(patched_src_dir);
        assert_1["default"](fs_1["default"].lstatSync(patched_src_dir).isDirectory(), patched_src_dir + " is not a directory");
    }
    var oriAST = parser_1["default"](fs_1["default"].readFileSync(x.path_to_contract_source, 'utf8'));
    debugLogger_oriAST(oriAST);
    var interestedSpace = InterestedSpaceSpecifierParser_1["default"](oriAST, interested_space_specifier);
    debugLogger_faultSpace("InterestedSpace: " + util_1["default"].inspect(interestedSpace, true, Infinity, true));
    var faultSpace = utils_2.generateFaultSpace(oriAST, interestedSpace);
    debugLogger_faultSpace(faultSpace);
    var mutationSeqGen = new RandomMutationSequenceGenerator_1["default"](oriAST, 1, maxMutationDistance, faultSpace, x.mutation_types, ASTNewNodeTypes, must_include_mutation_types, replaceableNodeType, x['only-compilable'], skip_same_bin, mutate_mutated_location, seed);
    var numProcessed = 0;
    if (max_num_seq === 'iter-json') {
        // On Iter mode
        // Support mutate or crossover operations
        function respond(responseObj) {
            debugLogger_interaction_out("\n" + treeify_1["default"].asTree(responseObj, true, true));
            console.log(JSON.stringify(responseObj));
        }
        var rl_1 = readline_1["default"].createInterface({
            input: process.stdin
        });
        var debugLogger_interaction_in_parsed_1 = debugLogger_interaction_in.extend('parsed');
        process.on('SIGUSR2', function () {
            logger_1["default"].info('Rececived terminate signal');
            global_1["default"].terminateNow = true;
        });
        rl_1.on('line', function (line) { return __awaiter(_this, void 0, void 0, function () {
            var _a, requestObj_, requestObj, newMutationSequences, _b, rstMutationSequences, response, baseMutationSeqObj, overridenFaultSpaceSpecifier, baseMutationSeq, baseAST, possibleMutationTypes_1, original_faultSpace_Path_1, rstMutationSequences, response, response, outPaths, len_newMutationSequences, i, num, outPath, newAST, finalNewAST, newSRC, newMutationSeq, outPath_mutation, response, response;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (line === 'q') {
                            logger_1["default"].info('Received exit command, exiting.');
                            rl_1.close();
                            return [2 /*return*/];
                        }
                        global_1["default"].terminateNow = false;
                        return [4 /*yield*/, util_1["default"].promisify(fs_1["default"].exists)("/tmp/terminate_" + process.pid)];
                    case 1:
                        _a = (_c.sent());
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, util_1["default"].promisify(fs_1["default"].unlink)("/tmp/terminate_" + process.pid)];
                    case 2:
                        _a = (_c.sent());
                        _c.label = 3;
                    case 3:
                        _a;
                        requestObj_ = JSON.parse(line);
                        debugLogger_interaction_in_parsed_1("\n" + treeify_1["default"].asTree(requestObj_, true, true));
                        assert_1["default"](typeof requestObj_.type === 'string', "Unexpected request type: " + requestObj_.type + "\n");
                        requestObj = requestObj_;
                        newMutationSequences = [];
                        _b = requestObj.type;
                        switch (_b) {
                            case 'random': return [3 /*break*/, 4];
                            case 'mutate': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 4: return [4 /*yield*/, genMutations_genSeqs(requestObj.num_mutations, mutationSeqGen, undefined, undefined)];
                    case 5:
                        rstMutationSequences = _c.sent();
                        if (rstMutationSequences === undefined) {
                            response = {
                                Result: 'AllSpaceExhasuted'
                            };
                            respond(response);
                            return [2 /*return*/];
                        }
                        newMutationSequences.push.apply(newMutationSequences, rstMutationSequences);
                        return [3 /*break*/, 9];
                    case 6:
                        baseMutationSeqObj = requestObj.baseMutationSequence;
                        assert_1["default"](Array.isArray(baseMutationSeqObj), "mutation_sequence should be an array while provided: \n" + util_1["default"].inspect(baseMutationSeqObj, true, Infinity, true));
                        overridenFaultSpaceSpecifier = requestObj.overridenFaultSpaceSpecifier !== null ? requestObj.overridenFaultSpaceSpecifier : undefined;
                        baseMutationSeq = new (MutationSequence_1["default"].bind.apply(MutationSequence_1["default"], __spreadArrays([void 0], baseMutationSeqObj.map(Mutations_1.objToMutation))))();
                        baseAST = baseMutationSeq.mutateAST(oriAST);
                        utils_1.ASTNodeRemoveExtraAttributesDeep(baseAST);
                        if (mutationSeqGen.findASTByMutationSequence(baseMutationSeq) === undefined) {
                            possibleMutationTypes_1 = x.mutation_types;
                            original_faultSpace_Path_1 = faultSpace.map(function (x) { return RandomMutationSequenceGenerator_1.faultSpaceToFaultSpaceInfo(x, possibleMutationTypes_1); });
                            baseMutationSeq.mutateAST(oriAST, function (beforeAST, _, newMutation) {
                                if (newMutation !== undefined) {
                                    original_faultSpace_Path_1 = original_faultSpace_Path_1
                                        .map(function (x) {
                                        var newNodePath = newMutation.updateASTPath.bind(newMutation, beforeAST)(x.faultSpace.nodePath);
                                        if (newNodePath === null) {
                                            return null;
                                        }
                                        else if (lodash_1.isEqual(x.faultSpace.nodePath, newMutation.targetNodePath)) {
                                            var mutationType = newMutation.mutationType;
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
                                }
                                return true;
                            });
                            mutationSeqGen.addKnownAST(baseAST, baseMutationSeq, original_faultSpace_Path_1);
                        }
                        return [4 /*yield*/, genMutations_genSeqs(1, mutationSeqGen, baseAST, overridenFaultSpaceSpecifier)];
                    case 7:
                        rstMutationSequences = _c.sent();
                        if (rstMutationSequences === undefined) {
                            response = {
                                Result: 'AllSpaceExhasuted'
                            };
                            respond(response);
                            return [2 /*return*/];
                        }
                        else if (rstMutationSequences.length === 0) {
                            response = {
                                Result: 'SpaceExhasutedForAST'
                            };
                            respond(response);
                            return [2 /*return*/];
                        }
                        else {
                            newMutationSequences.push.apply(newMutationSequences, rstMutationSequences);
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        {
                            throw new Error("Unknown iter-json request object type: " + requestObj.type);
                        }
                        _c.label = 9;
                    case 9:
                        outPaths = new Array(newMutationSequences.length);
                        assert_1["default"](typeof patched_src_dir !== 'undefined');
                        len_newMutationSequences = newMutationSequences.length;
                        for (i = 0; i < len_newMutationSequences; i++) {
                            num = numProcessed + i;
                            outPath = path_1["default"].format({
                                dir: patched_src_dir,
                                name: num.toString(),
                                ext: '.sol'
                            });
                            newAST = newMutationSequences[i].mutateAST(oriAST);
                            finalNewAST = simplify ? mutationSeqGen.simplifyAST(newAST) : newAST;
                            newSRC = SRCUtils_1.a2S(finalNewAST);
                            newMutationSeq = newMutationSequences[i];
                            fs_1["default"].writeFileSync(outPath, newSRC);
                            outPaths[i] = outPath;
                            logger_1["default"].info("Patched source file #" + num + " written to " + outPath);
                            if (output_mutation) {
                                outPath_mutation = path_1["default"].format({
                                    dir: patched_src_dir,
                                    name: num + ".sol.mutation",
                                    ext: '.json'
                                });
                                fs_1["default"].writeFileSync(outPath_mutation, JSON.stringify(newMutationSeq));
                                logger_1["default"].info("Mutation sequence file #" + num + " for " + outPath + " written to " + outPath_mutation);
                            }
                        }
                        numProcessed += newMutationSequences.length;
                        switch (requestObj.type) {
                            case 'mutate': {
                                assert_1["default"](newMutationSequences.length === 1);
                                response = {
                                    Result: 'Success',
                                    NewMutationSequences: newMutationSequences,
                                    PatchedFilePaths: outPaths,
                                    ModifiedLocations: newMutationSequences.map(function (x) { return x.modifiedLocations(oriAST); })
                                };
                                respond(response);
                                return [2 /*return*/];
                            }
                            case 'random': {
                                response = {
                                    Result: 'Success',
                                    NewMutationSequences: newMutationSequences,
                                    PatchedFilePaths: outPaths,
                                    ModifiedLocations: newMutationSequences.map(function (x) { return x.modifiedLocations(oriAST); })
                                };
                                respond(response);
                                return [2 /*return*/];
                            }
                            default: {
                                // If it's truly invalid request type, it should have failed already
                                throw new ts_essentials_1.UnreachableCaseError(requestObj);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    else {
        // Some implementation inconsistency
        throw new ts_essentials_1.UnreachableCaseError(max_num_seq);
    }
}
exports["default"] = genMutations;
function genMutations_genSeqs(num, mutationSeqGen, ast, overridenFaultSpaceSpecifier) {
    if (overridenFaultSpaceSpecifier === void 0) { overridenFaultSpaceSpecifier = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var overridenFaultSpace, interestedSpace, rstMutations, i, mutationSeq;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    overridenFaultSpace = undefined;
                    if (overridenFaultSpaceSpecifier !== undefined) {
                        interestedSpace = InterestedSpaceSpecifierParser_1["default"](ast, overridenFaultSpaceSpecifier);
                        overridenFaultSpace = utils_2.generateFaultSpace(ast, interestedSpace);
                    }
                    rstMutations = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < num)) return [3 /*break*/, 4];
                    overridenFaultSpace;
                    return [4 /*yield*/, mutationSeqGen.next({ requestAST: ast })];
                case 2:
                    mutationSeq = (_a.sent()).value;
                    if (typeof mutationSeq === 'undefined') {
                        logger_1["default"].info('Patch search space exhausted.');
                        return [2 /*return*/, undefined];
                    }
                    else if (mutationSeq === RandomMutationSequenceGenerator_1.RandomMutationGenerator_Result.ExhaustedForRequestedAST) {
                        logger_1["default"].debug("Requested AST can't be modified further.");
                        return [3 /*break*/, 4];
                    }
                    else if (mutationSeq === RandomMutationSequenceGenerator_1.RandomMutationGenerator_Result.TerminateRequested) {
                        logger_1["default"].debug('Terminated requested');
                        return [3 /*break*/, 4];
                    }
                    else {
                        logger_1["default"].debug("Generated " + (i + 1) + " patches for current task");
                    }
                    rstMutations.push(mutationSeq);
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, rstMutations];
            }
        });
    });
}
