"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var chance_1 = require("chance");
var debug_1 = require("../../utils/debug");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var solc_1 = require("solc");
var util_1 = require("util");
var logger_1 = require("../../utils/logger");
var assert_1 = require("assert");
var os_1 = require("os");
var NodePathUtils_1 = require("./NodePathUtils");
__export(require("./NodePathUtils"));
// Note: when executing, __filename is in the build directory
var solc_path = path_1["default"].join(path_1["default"].dirname(__filename), '..', '..', '..', '..', 'solc-bin', 'soljson-v0.4.24+commit.e67f0147.js');
if (!fs_1["default"].existsSync(solc_path)) {
    solc_path = path_1["default"].join(path_1["default"].dirname(__filename), '..', '..', '..', 'solc-bin', 'soljson-v0.4.24+commit.e67f0147.js');
}
var solc_0_4_24 = solc_1["default"].setupMethods(require(solc_path));
function retNodeType(node) {
    return node.type;
}
exports.retNodeType = retNodeType;
/*

Return generator function of the cartesian product of iterators

*/
function cartesianProduct() {
    var _i, thisGen, _a, thisGen_1, s, gen, _b, gen_1, g;
    var sets = [];
    for (_i = 0; _i < arguments.length; _i++) {
        sets[_i] = arguments[_i];
    }
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!(sets.length === 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, []];
            case 1:
                _c.sent();
                return [2 /*return*/];
            case 2:
                thisGen = sets[0]();
                if (!thisGen) {
                    throw new Error();
                }
                _a = 0, thisGen_1 = thisGen;
                _c.label = 3;
            case 3:
                if (!(_a < thisGen_1.length)) return [3 /*break*/, 8];
                s = thisGen_1[_a];
                gen = cartesianProduct.apply(void 0, sets.slice(1));
                _b = 0, gen_1 = gen;
                _c.label = 4;
            case 4:
                if (!(_b < gen_1.length)) return [3 /*break*/, 7];
                g = gen_1[_b];
                return [4 /*yield*/, __spreadArrays([s], g)];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _b++;
                return [3 /*break*/, 4];
            case 7:
                _a++;
                return [3 /*break*/, 3];
            case 8: return [2 /*return*/];
        }
    });
}
exports.cartesianProduct = cartesianProduct;
function combination() {
    var _i, thisGen, _a, thisGen_2, s, gen, _b, gen_2, g;
    var sets = [];
    for (_i = 0; _i < arguments.length; _i++) {
        sets[_i] = arguments[_i];
    }
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!(sets.length === 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, []];
            case 1:
                _c.sent();
                return [2 /*return*/];
            case 2:
                thisGen = sets[0]();
                if (!thisGen) {
                    throw new Error();
                }
                _a = 0, thisGen_2 = thisGen;
                _c.label = 3;
            case 3:
                if (!(_a < thisGen_2.length)) return [3 /*break*/, 8];
                s = thisGen_2[_a];
                gen = combination.apply(void 0, sets.slice(1));
                _b = 0, gen_2 = gen;
                _c.label = 4;
            case 4:
                if (!(_b < gen_2.length)) return [3 /*break*/, 7];
                g = gen_2[_b];
                if (g.includes(s)) {
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, __spreadArrays([s], g)];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _b++;
                return [3 /*break*/, 4];
            case 7:
                _a++;
                return [3 /*break*/, 3];
            case 8: return [2 /*return*/];
        }
    });
}
exports.combination = combination;
function isASTNode(node) {
    return !!node && typeof node === 'object' && node.hasOwnProperty('type');
}
exports.isASTNode = isASTNode;
exports.disallowKeys = new Set([
    'range',
    'loc',
    'comments',
    'arguments',
    'parameters',
    'parameterTypes',
    'returnTypes',
    'modifiers',
    'names',
    'variables',
    'components',
    'members',
    'baseContracts',
    'symbolAliases',
    'operations',
    'cases',
    'returnArguments',
]); // Elements to be disallowed to be modified
exports.astNodeTypeStrings = [
    'SourceUnit',
    'PragmaDirective',
    'PragmaName',
    'PragmaValue',
    'Version',
    'VersionOperator',
    'VersionConstraint',
    'ImportDeclaration',
    'ImportDirective',
    'ContractDefinition',
    'InheritanceSpecifier',
    'StateVariableDeclaration',
    'UsingForDeclaration',
    'StructDefinition',
    'ModifierDefinition',
    'ModifierInvocation',
    'FunctionDefinition',
    'ModifierList',
    'EventDefinition',
    'EnumValue',
    'EnumDefinition',
    'ParameterList',
    'Parameter',
    'EventParameterList',
    'EventParameter',
    'FunctionTypeParameterList',
    'FunctionTypeParameter',
    'VariableDeclaration',
    'ArrayTypeName',
    'UserDefinedTypeName',
    'Mapping',
    'FunctionTypeName',
    'StorageLocation',
    'StateMutability',
    'Block',
    'LineComment',
    'BlockComment',
    'ExpressionStatement',
    'IfStatement',
    'WhileStatement',
    'ForStatement',
    'InlineAssemblyStatement',
    'DoWhileStatement',
    'ContinueStatement',
    'BreakStatement',
    'ReturnStatement',
    'ThrowStatement',
    'VariableDeclarationStatement',
    'IdentifierList',
    'ElementaryTypeName',
    'NewExpression',
    'ExpressionList',
    'NameValueList',
    'NameValue',
    'FunctionCall',
    'FunctionCallArguments',
    'AssemblyBlock',
    'AssemblyItem',
    'AssemblyCall',
    'AssemblyLocalDefinition',
    'AssemblyAssignment',
    'AssemblyIdentifierOrList',
    'AssemblyIdentifierList',
    'AssemblyStackAssignment',
    'LabelDefinition',
    'AssemblySwitch',
    'AssemblyCase',
    'AssemblyFunctionDefinition',
    'AssemblyFunctionReturns',
    'AssemblyFor',
    'AssemblyIf',
    'AssemblyLiteral',
    'SubAssembly',
    'TupleExpression',
    'ElementaryTypeNameExpression',
    'StringLiteral',
    'BooleanLiteral',
    'NumberLiteral',
    'Identifier',
    'IndexAccess',
    'MemberAccess',
    'UnaryOperation',
    'BinaryOperation',
    'Conditional',
];
exports.AssertionIdentifierNames = ['assert', 'require', 'revert'];
/**
 *
 * Note: by right, the passed array should be a generic type, and let typescript auto inferring the exact type in each case
 *  But, comes out that typescript compiler is too slow when doing so.
 *  TODO: try this again when upgrading to TypeScript ^3.5.3
 *
 * @param iter An array
 */
function arrayToGenerator(iter) {
    return function (random) {
        if (random === void 0) { random = false; }
        var newIter = ![false, undefined].includes(random)
            ? (random === true ? new chance_1["default"]() : new chance_1["default"](random)).shuffle(iter)
            : iter;
        return newIter[Symbol.iterator]();
    };
}
exports.arrayToGenerator = arrayToGenerator;
function _isASTNode(node) {
    return !!node && typeof node === 'object' && node.hasOwnProperty('type');
}
function visitWithPath(node, visitor, path) {
    if (path === void 0) { path = []; }
    if (Array.isArray(node)) {
        node.forEach(function (child, idx) { return visitWithPath(child, visitor, __spreadArrays(path, [idx.toString()])); });
    }
    if (!_isASTNode(node)) {
        return;
    }
    var cont = true;
    if (visitor[node.type] !== undefined) {
        cont = visitor[node.type](node, path);
    }
    if (cont === false) {
        return;
    }
    for (var prop in node) {
        if (node.hasOwnProperty(prop)) {
            visitWithPath(node[prop], visitor, __spreadArrays(path, [prop]));
        }
    }
    var selector = node.type + ':exit';
    if (visitor[selector] !== undefined) {
        visitor[selector](node, path);
    }
}
exports.visitWithPath = visitWithPath;
function recPathOfFunctions(obj, initPath) {
    if (initPath === void 0) { initPath = []; }
    if (typeof obj === 'function') {
        return [[]];
    }
    var rst = [];
    for (var prop in obj) {
        switch (typeof obj[prop]) {
            case 'function': {
                rst.push(__spreadArrays(initPath, [prop]));
                break;
            }
            case 'object': {
                rst.push.apply(rst, recPathOfFunctions(obj[prop], __spreadArrays(initPath, [prop])));
                break;
            }
            default: {
                // noop
            }
        }
    }
    return rst;
}
exports.recPathOfFunctions = recPathOfFunctions;
function recPathOfPrimitives(obj, initPath) {
    if (initPath === void 0) { initPath = []; }
    var rst = [];
    for (var prop in obj) {
        switch (typeof obj[prop]) {
            case 'function': {
                break;
            }
            case 'object': {
                if (obj[prop] !== null) {
                    rst.push.apply(rst, recPathOfPrimitives(obj[prop], __spreadArrays(initPath, [prop])));
                }
                else {
                    rst.push(__spreadArrays(initPath, [prop]));
                }
                break;
            }
            default: {
                rst.push(__spreadArrays(initPath, [prop]));
            }
        }
    }
    return rst;
}
exports.recPathOfPrimitives = recPathOfPrimitives;
var debugLogger_compile = debug_1["default"]('compile');
var debugLogger_compile_err = debugLogger_compile.extend('err');
var debugLogger_compile_succ = debugLogger_compile.extend('succ');
var debugLogger_compile_start = debugLogger_compile.extend('start');
function compile(contractSrcStr, optimize, retBin) {
    if (optimize === void 0) { optimize = false; }
    if (retBin === void 0) { retBin = false; }
    debugLogger_compile_start('Compilation start...');
    var compileOutput = JSON.parse(solc_0_4_24.compile(JSON.stringify({
        language: 'Solidity',
        sources: {
            'main.sol': {
                content: contractSrcStr
            }
        },
        settings: {
            optimizer: {
                enabled: typeof optimize === 'boolean' ? optimize : true,
                runs: typeof optimize === 'number' ? optimize : 200
            },
            outputSelection: {
                '*': {
                    '*': ['evm.bytecode.object']
                }
            }
        }
    })));
    if (typeof compileOutput.errors !== 'undefined') {
        debugLogger_compile_err(util_1["default"].inspect(compileOutput.errors, true, Infinity));
        for (var _i = 0, _a = compileOutput.errors; _i < _a.length; _i++) {
            var error = _a[_i];
            switch (error.type) {
                case 'Warning':
                case 'DocstringParsingError': {
                    continue;
                }
                case 'ParserError':
                case 'SyntaxError':
                case 'DeclarationError':
                case 'TypeError': {
                    return false;
                }
                default: {
                    // throw new Error(`Unknown error from solc: ${util.inspect(error)}`);
                    logger_1["default"].error("Unknown error from solc: " + util_1["default"].inspect(error));
                    return false;
                }
            }
        }
    }
    debugLogger_compile_succ("Compile succeeded");
    if (!retBin) {
        return true;
    }
    else {
        var allContractOuts_1 = compileOutput.contracts['main.sol'];
        var binObj_1 = {};
        Object.keys(allContractOuts_1).forEach(function (contracts) { return (binObj_1[contracts] = allContractOuts_1[contracts].evm.bytecode.object); });
        return binObj_1;
    }
}
exports.compile = compile;
function deepOmit(obj, keys) {
    function rec(obj) {
        return lodash_1["default"].transform(obj, function (rst, val, key) {
            if (keys.includes(key)) {
                return;
            }
            rst[key] = typeof obj[key] === 'object' ? rec(obj[key]) : val;
        });
    }
    return rec(obj);
}
exports.deepOmit = deepOmit;
function arrStartsWithArr(arr, maybeStartWith) {
    return maybeStartWith.every(function (val, idx) { return arr[idx] === val; });
}
exports.arrStartsWithArr = arrStartsWithArr;
function ASTNodeRemoveExtraAttributesDeep(node) {
    ASTNodeRemoveAttrsDeep(node, ['tokens']);
}
exports.ASTNodeRemoveExtraAttributesDeep = ASTNodeRemoveExtraAttributesDeep;
function ASTNodeRemoveLocDeep(node) {
    ASTNodeRemoveAttrsDeep(node, ['range', 'loc']);
}
exports.ASTNodeRemoveLocDeep = ASTNodeRemoveLocDeep;
function ASTNodeRemoveAttrsDeep(node, attributesToRemove) {
    ASTNodeRemoveAttrs(node, attributesToRemove);
    for (var attr_ in node) {
        var attr = attr_;
        if (typeof node[attr] === 'object') {
            ASTNodeRemoveLocDeep(node[attr]);
        }
    }
}
exports.ASTNodeRemoveAttrsDeep = ASTNodeRemoveAttrsDeep;
// This only performs for the top-most level
function ASTNodeRemoveAttrs(node, attributesToRemove) {
    for (var attr in node) {
        if (attributesToRemove.includes(attr)) {
            delete node[attr];
        }
    }
}
exports.ASTNodeRemoveAttrs = ASTNodeRemoveAttrs;
function astNodeContainsNonEmptyBlock(node) {
    if (node['type'] === 'Block') {
        if (node['statements'].length !== 0) {
            return true;
        }
        else {
            return astNodeContainsNonEmptyBlock(node['statements']);
        }
    }
    else {
        for (var key_ in node) {
            var key = key_;
            if (Object.hasOwnProperty(node[key])) {
                if (astNodeContainsNonEmptyBlock(node[key])) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.astNodeContainsNonEmptyBlock = astNodeContainsNonEmptyBlock;
function deletableFaultSpace(ast, faultSpaces, onlyDeleteNodeType) {
    if (onlyDeleteNodeType === void 0) { onlyDeleteNodeType = undefined; }
    return faultSpaces.filter(function (faultSpace) {
        var nodeParent = lodash_1.get(ast, faultSpace.nodePath.slice(0, -1));
        assert_1["default"](nodeParent !== undefined);
        var node = lodash_1.get(nodeParent, faultSpace.nodePath.slice(-1));
        assert_1["default"](node !== undefined && node !== null, "invalid node found!" + os_1["default"].EOL + util_1["default"].inspect(node, true, Infinity, true));
        if (onlyDeleteNodeType !== undefined && !onlyDeleteNodeType.includes(node.type)) {
            return false;
        }
        if (node.type === 'FunctionCall') {
            if (node.expression.type === 'Identifier') {
                // Shouldn't delete any assertion related statements as they are written by original developer intentionally to make sure some of things go right
                if (exports.AssertionIdentifierNames.includes(node.expression.name)) {
                    return false;
                }
            }
        }
        // Disable deleting non-empty codeblock
        return Array.isArray(nodeParent) && faultSpace.nodePath.every(function (x) { return !exports.disallowKeys.has(x); }) && !astNodeContainsNonEmptyBlock(node);
    });
}
exports.deletableFaultSpace = deletableFaultSpace;
function objPathVisit(obj, visitPath, visitorFn) {
    if (visitorFn(obj) && visitPath.length !== 0) {
        objPathVisit(obj[visitPath[0]], visitPath.slice(1), visitorFn);
    }
}
exports.objPathVisit = objPathVisit;
// export function isPrefixArray<T extends any>(arr: T[], prefixArr: T[]): boolean {
//   for (let i =0; i < prefixArr.length; i++) {
//     if(arr[i] !== prefixArr[i]) {
//       return false;
//     }
//   }
//   return true;
// }
function cmpLineColumn(a, b) {
    if (a.line === b.line) {
        return a.column - b.column;
    }
    else {
        return a.line - b.line;
    }
}
exports.cmpLineColumn = cmpLineColumn;
function locationDisjoint_Above(loc, above) {
    return cmpLineColumn(loc.start, above.start) < 0 && cmpLineColumn(loc.end, above.start) < 0;
}
exports.locationDisjoint_Above = locationDisjoint_Above;
function locationDisjoint_Below(loc, below) {
    return cmpLineColumn(loc.start, below.end) > 0 && cmpLineColumn(loc.end, below.end) > 0;
}
exports.locationDisjoint_Below = locationDisjoint_Below;
function locationDisjoint(a, b) {
    return locationDisjoint_Above(a, b) || locationDisjoint_Below(a, b);
}
exports.locationDisjoint = locationDisjoint;
function locationIntersect(a, b) {
    // Start of a is inside b
    return (cmpLineColumn(a.start, b.start) >= 0 && cmpLineColumn(a.start, b.end) <= 0) ||
        // Start of b is inside a
        (cmpLineColumn(b.start, a.start) >= 0 && cmpLineColumn(b.start, a.end) <= 0);
}
exports.locationIntersect = locationIntersect;
function isNodePathInScope(ast, nodePath, contractNames, functionNames) {
    if (contractNames === void 0) { contractNames = undefined; }
    if (functionNames === void 0) { functionNames = undefined; }
    var scope = NodePathUtils_1.getNodePathScopeInfo(ast, nodePath);
    // It's ok even if the scope information for the `nodePath` is undefined
    return (contractNames === undefined || contractNames.includes(scope.contractName)) && (functionNames === undefined || functionNames.includes(scope.functionName));
}
exports.isNodePathInScope = isNodePathInScope;
function getASTNodeFromPath(ast, nodePath) {
    return lodash_1.get(ast, nodePath);
}
exports.getASTNodeFromPath = getASTNodeFromPath;
function findASTParentNode(ast, nodePath) {
    for (var i = nodePath.length - 1; i >= 1; i--) {
        var parentPath = nodePath.slice(0, i);
        if (isASTNode(getASTNodeFromPath(ast, parentPath))) {
            return parentPath;
        }
    }
    return null;
}
exports.findASTParentNode = findASTParentNode;
var nonFunctionalRelatedAttributes = ['tokens', 'comments', 'loc', 'range'];
exports.ASTFunctionalEqualCompareCustomizer = function (objVal, othVal, key) {
    if (nonFunctionalRelatedAttributes.includes(key)) {
        return true;
    }
    else if (((typeof objVal === 'object' && objVal !== null) && nonFunctionalRelatedAttributes.some(function (x) { return objVal.hasOwnProperty(x); }))
        || ((typeof othVal === 'object' && othVal !== null) && nonFunctionalRelatedAttributes.some(function (x) { return othVal.hasOwnProperty(x); }))) {
        var newObjVal = lodash_1.clone(objVal);
        ASTNodeRemoveAttrs(newObjVal, nonFunctionalRelatedAttributes);
        var newOthVal = lodash_1.clone(othVal);
        ASTNodeRemoveAttrs(newOthVal, nonFunctionalRelatedAttributes);
        return lodash_1.isEqualWith(newObjVal, newOthVal, exports.ASTFunctionalEqualCompareCustomizer);
    }
    else {
        return undefined;
    }
};
function generatorFilter(genFunc, filterFn) {
    return (function (random) {
        var _i, _a, val;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = genFunc(random);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    val = _a[_i];
                    if (!filterFn(val)) return [3 /*break*/, 3];
                    return [4 /*yield*/, val];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.generatorFilter = generatorFilter;
function generateFaultSpace(ast, interestedSpace) {
    var faultSpace = [];
    var fnDepth = 0;
    var predefined = {
        ContractDefinition: function (node, path) {
            return interestedSpace === undefined ? true : interestedSpace.some(function (space) { return space.isNodeInterested(node, path, ast); });
        },
        FunctionDefinition: function (node, path) {
            if (interestedSpace === undefined || interestedSpace.some(function (space) { return space.isNodeInterested(node, path, ast); })) {
                fnDepth++;
                logger_1["default"].debug("Found interested function " + node.name);
                return true;
            }
            else {
                return false;
            }
        },
        'FunctionDefinition:exit': function (_node, _path) {
            fnDepth--;
        }
    };
    var generalVisitorFn = function (node, path) {
        if (fnDepth !== 0) {
            // Ether flow preservation block
            var methodName_externalCalls = [
                'send',
                'transfer',
                'call',
                'delegatecall',
                'callcode',
            ];
            var parentNode = getASTNodeFromPath(ast, findASTParentNode(ast, path));
            // NOTE: only the parts of function call are not in the fault space. The function call itself, however, can be in.
            var isEtherFlowRelated = parentNode.type === 'FunctionCall' && parentNode.expression.type === 'MemberAccess' && methodName_externalCalls.includes(parentNode.expression.memberName);
            if (isEtherFlowRelated) {
                return false;
            }
        }
        {
            var isWantedASTNodeType = !(node.type === 'EmitStatement');
            if (!isWantedASTNodeType) {
                return false;
            }
        }
        var inExactScope = (interestedSpace === undefined || interestedSpace.some(function (space) { return space.isNodeInExactScope(node, path, ast); }));
        if (fnDepth !== 0 && inExactScope) {
            faultSpace.push({ nodePath: path });
            return true;
        }
        else {
            var isNodeInterested = interestedSpace === undefined || interestedSpace.some(function (space) { return space.isNodeInterested(node, path, ast); });
            return isNodeInterested;
        }
    };
    var visitor = new Proxy({}, {
        get: function (_target, property, _receiver) {
            return typeof predefined[property] !== 'undefined'
                ? predefined[property]
                : property.endsWith(':exit')
                    ? function () { return undefined; }
                    : generalVisitorFn;
        }
    });
    visitWithPath(ast, visitor);
    var rst = faultSpace.map(function (_a) {
        var nodePath = _a.nodePath;
        return {
            nodePath: nodePath
        };
    });
    return rst;
}
exports.generateFaultSpace = generateFaultSpace;
function stripSwarmMetadata(binWithSwarmData) {
    var RE_SWARM_REPLACE = /(a165627a7a72305820)([0-9a-f]{64})(0029)$/;
    return binWithSwarmData.replace(RE_SWARM_REPLACE, '');
}
exports.stripSwarmMetadata = stripSwarmMetadata;
