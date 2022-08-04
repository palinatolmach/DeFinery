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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var assert_1 = require("assert");
var lodash_1 = require("lodash");
var utils_1 = require("./utils");
var binOps = [
    '+',
    '-',
    '*',
    '/',
    '&&',
    '||',
    '&',
    '|',
    '<',
    '>',
    '<=',
    '>=',
    '==',
    '!=',
    '=',
    '+=',
    '-=',
    '*=',
    '/=',
];
/* tslint:disable-next-line:no-unnecessary-class */
var ASTNodeSpace = /** @class */ (function () {
    function ASTNodeSpace() {
        this.ASTNodeMapSet = new Map(utils_1.astNodeTypeStrings.map(function (ele) { return [ele, new Set()]; }));
    }
    Object.defineProperty(ASTNodeSpace.prototype, "supportedNodeTypes", {
        /*
        Note: this return value is actually known in compile-time in the current implementation. But, this is a runtime function for now.
        */
        get: function () {
            return utils_1.astNodeTypeStrings.filter(this.isNodeTypeSupported.bind(this));
        },
        enumerable: true,
        configurable: true
    });
    ASTNodeSpace.prototype.ExpressionStatement = function (ctx) {
        // The calcuated space might contain duplicate elements
        if (ctx === void 0) { ctx = undefined; }
        return {
            type: 'ExpressionStatement',
            // Note: expression can deduplicate but it requires memory
            expression: utils_1.arrayToGenerator(__spreadArrays([
                this.BinaryOperationStatement(ctx),
                this.BinaryOperationStatement(ctx),
                this.FunctionCall(ctx)
            ],
            Array.from(this.getReusableNodeSet('ExpressionStatement', ctx !== undefined ? ctx.scopeInfo : undefined), function (ele) { return ele.expression; })
            ))
        };
    };
    ASTNodeSpace.prototype.FunctionCall = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        var space_assertionCall = {
            type: 'FunctionCall',
            expression: {
                type: 'Identifier',
                name: utils_1.arrayToGenerator(['require', 'assert'])
            },
            arguments: [
                utils_1.arrayToGenerator(__spreadArrays(Array.from(this.getReusableNodeSet('ExpressionStatement', ctx !== undefined ? ctx.scopeInfo : undefined), function (ele) { return ele.expression; })))
            ],
            names: []
        };
        return utils_1.arrayToGenerator([space_assertionCall]);
    };
    ASTNodeSpace.prototype.BooleanLiteral = function (_ctx) {
        if (_ctx === void 0) { _ctx = undefined; }
        return {
            type: 'BooleanLiteral',
            value: utils_1.arrayToGenerator([true, false])
        };
    };
    ASTNodeSpace.prototype.NumberLiteral = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        return {
            type: 'NumberLiteral',
            number: utils_1.arrayToGenerator(__spreadArrays([
                '0',
                '1'
            ], Array.from(this.getReusableNodeSet('NumberLiteral', ctx !== undefined ? ctx.scopeInfo : undefined), function (ele) { return ele.number; }))),
            subdenomination: utils_1.arrayToGenerator([
                null,
            ])
        };
    };
    ASTNodeSpace.prototype.Identifier = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        if (ctx === undefined) {
            return undefined;
        }
        else {
            return __spreadArrays((this.getReusableNodeSet('Identifier', ctx !== undefined ? ctx.scopeInfo : undefined)));
        }
    };
    ASTNodeSpace.prototype.UnaryOperation = function () {
        return undefined;
    };
    ASTNodeSpace.prototype.BinaryOperation = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        return {
            type: 'BinaryOperation',
            left: utils_1.arrayToGenerator(__spreadArrays(Array.from(this.getReusableNodeSet('BinaryOperation', ctx !== undefined ? ctx.scopeInfo : undefined), function (ele) { return ele.left; }))),
            right: utils_1.arrayToGenerator(__spreadArrays(Array.from(this.getReusableNodeSet('BinaryOperation', ctx !== undefined ? ctx.scopeInfo : undefined), function (ele) { return ele.right; }))),
            operator: utils_1.arrayToGenerator(binOps)
        };
    };
    ASTNodeSpace.prototype.Conditional = function () {
        return undefined;
    };
    // Custom space generators
    ASTNodeSpace.prototype.BoolBinaryOperation = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        var binaryOperationExpressionGeneratorFilter = function (generator, forbiddenTypes) { return utils_1.generatorFilter(generator, function (x) { return (forbiddenTypes.includes(x.type)); }); };
        var boolValuedBinOps_forBool = [
            '&&',
            '||',
        ];
        var forbiddenTypes_forBool = ['NumberLiteral', 'HexLiteral'];
        var space_forBool = this.BinaryOperation(ctx);
        space_forBool.operator = utils_1.arrayToGenerator(boolValuedBinOps_forBool);
        space_forBool.left = binaryOperationExpressionGeneratorFilter(space_forBool.left, forbiddenTypes_forBool);
        space_forBool.right = binaryOperationExpressionGeneratorFilter(space_forBool.right, forbiddenTypes_forBool);
        var boolValuedBinOps_forNumber = [
            '<',
            '>',
            '<=',
            '>=',
        ];
        var forbiddenTypes_forNumber = ['BooleanLiteral'];
        var space_forNumber = this.BinaryOperation(ctx);
        space_forNumber.operator = utils_1.arrayToGenerator(boolValuedBinOps_forNumber);
        space_forNumber.left = binaryOperationExpressionGeneratorFilter(space_forNumber.left, forbiddenTypes_forNumber);
        space_forNumber.right = binaryOperationExpressionGeneratorFilter(space_forNumber.right, forbiddenTypes_forNumber);
        var boolValuedBinOps_forAllTypes = [
            '==',
            '!=',
        ];
        var space_forAllTypes = this.BinaryOperation(ctx);
        space_forAllTypes.operator = utils_1.arrayToGenerator(boolValuedBinOps_forAllTypes);
        return utils_1.arrayToGenerator([space_forBool, space_forNumber, space_forAllTypes]);
    };
    // `BinaryOperation` expressions that can be a statement
    ASTNodeSpace.prototype.BinaryOperationStatement = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        return this.AssignmentOperation(ctx);
    };
    ASTNodeSpace.prototype.NumberArithmeticAssignmentOperation = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        var numberArithmeticAssignmentBinOps = [
            '+=',
            '-=',
            '*=',
            '/=',
        ];
        var identifiers = this.Identifier(ctx);
        if (identifiers === undefined) {
            return undefined;
        }
        var binOpSpace = this.BinaryOperation(ctx);
        binOpSpace.left = utils_1.arrayToGenerator(identifiers);
        binOpSpace.operator = utils_1.arrayToGenerator(numberArithmeticAssignmentBinOps);
        binOpSpace.right = utils_1.arrayToGenerator(__spreadArrays(identifiers, [this.NumberLiteral(ctx)]));
        return binOpSpace;
    };
    ASTNodeSpace.prototype.AssignmentOperation = function (ctx) {
        if (ctx === void 0) { ctx = undefined; }
        var statementBinOps = [
            '=',
        ];
        var identifiers = this.Identifier(ctx);
        if (identifiers === undefined) {
            return undefined;
        }
        var binOpSpace = this.BinaryOperation(ctx);
        binOpSpace.left = utils_1.arrayToGenerator(identifiers);
        binOpSpace.operator = utils_1.arrayToGenerator(statementBinOps);
        // function invalidNodeFilter(binOp: BinaryOperation): boolean {
        //   return !(binOp.left.type === 'Identifier' && binOp.right.type === 'Identifier' && binOp.left.name === binOp.right.name);
        // }
        return utils_1.arrayToGenerator([binOpSpace]);
    };
    //==========================================================================================================================
    ASTNodeSpace.prototype.isNodeTypeSupported = function (type) {
        return typeof this[type] !== 'undefined' && typeof this[type]() !== 'undefined';
    };
    ASTNodeSpace.prototype.getASTNodeGenerator = function (nodeType, ctx, seed) {
        var nodeSpace;
        if (ctx === void 0) { ctx = undefined; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nodeSpace = this[nodeType](ctx);
                    if (typeof nodeSpace === 'undefined') {
                        throw new Error("nodeType " + nodeType + " is unsupported");
                    }
                    return [5 /*yield**/, __values(this.processSpace(nodeSpace, seed))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    ASTNodeSpace.prototype.processSpace = function (space, seed) {
        var gen_paths, gens, topLevelSpace, _i, _a, genRst, newGenObj, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gen_paths = utils_1.recPathOfFunctions(space);
                    if (!(gen_paths.length !== 0)) return [3 /*break*/, 5];
                    gens = void 0;
                    topLevelSpace = gen_paths.length === 1 && gen_paths[0].length === 0;
                    if (topLevelSpace) {
                        gens = [space.bind(undefined, seed)];
                    }
                    else {
                        gens = lodash_1.at(space, gen_paths).map(function (x) { return x.bind(undefined, seed); });
                    }
                    _i = 0, _a = utils_1.cartesianProduct.apply(void 0, gens);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    genRst = _a[_i];
                    newGenObj = void 0;
                    if (topLevelSpace) {
                        newGenObj = genRst[0];
                    }
                    else {
                        newGenObj = lodash_1.cloneDeep(space);
                        for (i in genRst) {
                            lodash_1.set(newGenObj, gen_paths[i], genRst[i]);
                        }
                    }
                    return [5 /*yield**/, __values(this.processSpace(newGenObj))];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, space];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    };
    ASTNodeSpace.prototype.buildASTNodeSet_visitor = function (ast, node_, nodePath) {
        var set = this.ASTNodeMapSet.get(node_.type);
        assert_1["default"](set !== undefined, "node has unknown node type: " + node_.type);
        var node = lodash_1.cloneDeep(node_);
        var newNodeObj = recRemoveLocInfo(node);
        set.add({ node: newNodeObj, scopeInfo: utils_1.getNodePathScopeInfo(ast, nodePath) });
        // Don't return false to keep traversing the AST tree
        return true;
    };
    ASTNodeSpace.prototype.getPredefinedASTNodeSet = function (nodeTypeString, scopeInfo) {
        if (scopeInfo === void 0) { scopeInfo = undefined; }
        var relevantNodeScopes = __spreadArrays(this.ASTNodeMapSet.get(nodeTypeString));
        if (scopeInfo !== undefined) {
            relevantNodeScopes = relevantNodeScopes.filter(function (x) { return x.scopeInfo === undefined ? false :
                (x.scopeInfo.contractName === scopeInfo.contractName && (scopeInfo.functionName === undefined || scopeInfo.functionName === x.scopeInfo.functionName)); });
        }
        return new Set(relevantNodeScopes.map(function (x) { return x.node; }));
    };
    ASTNodeSpace.prototype.getReusableNodeSet = function (nodeTypeString, scopeInfo) {
        var _this = this;
        if (scopeInfo === void 0) { scopeInfo = undefined; }
        var predefineNodeSet = this.getPredefinedASTNodeSet(nodeTypeString, scopeInfo);
        if (predefineNodeSet.size === 0) {
            return predefineNodeSet;
        }
        switch (nodeTypeString) {
            case 'ExpressionStatement': {
                var predefineNodeSet_ = predefineNodeSet;
                return new Set(__spreadArrays(predefineNodeSet_).filter(function (x) {
                    var isAssignmentStatement = x.expression.type === 'BinaryOperation' && x.expression.operator === '=';
                    var isEventEmittingStatement = scopeInfo !== undefined && scopeInfo.contractName !== undefined && x.expression.type === 'FunctionCall' && x.expression.expression.type === 'Identifier' && __spreadArrays(_this.getPredefinedASTNodeSet('EventDefinition', {
                        contractName: scopeInfo.contractName
                    })).some(function (eventDefinition) {
                        var functionCallFunctionExpression = x.expression.expression;
                        return eventDefinition.name === functionCallFunctionExpression.name;
                    });
                    return !(isAssignmentStatement || isEventEmittingStatement);
                }));
            }
            // case 'BinaryOperation': {
            //   const predefineNodeSet_ = predefineNodeSet as Set<BinaryOperation>;
            //   return new Set([...predefineNodeSet_].filter((x) => {
            //     const isAssignmentExpression = 'BinaryOperation' && x.operator === '=';
            //     return !(isAssignmentExpression);
            //   })) as Set<ASTNodeByTypeString<T_NodeTypeString, ASTNode>>;
            // }
        }
        return predefineNodeSet;
    };
    ASTNodeSpace.prototype.isNodeInSpace = function (node, ctx) {
        if (ctx === void 0) { ctx = new NewNodeGenerationContext(undefined, undefined); }
        assert_1["default"](utils_1.isASTNode(node));
        var type = node.type;
        var nodeSpace = this[type](ctx);
        if (nodeSpace === undefined) {
            return false;
        }
        function processSpace(space, target, seed) {
            // const primitivePaths = recPathOfPrimitives(space);
            // if(primitivePaths.some((x)=>! lodash_equalWith(lodash_get, isEqualWith as lodash_equalWith(space, x) )
            if (!lodash_1.isEqualWith(space, target, function (objVal, _othVal) {
                if (typeof objVal === 'function') {
                    // The field being checked in not generated yet
                    return true;
                }
                else {
                    return undefined;
                }
            })) {
                return false;
            }
            var gen_paths = utils_1.recPathOfFunctions(space);
            assert_1["default"](gen_paths.length !== 0);
            var gens;
            var topLevelSpace = gen_paths.length === 1 && gen_paths[0].length === 0;
            if (topLevelSpace) {
                gens = [space.bind(undefined, seed)];
            }
            else {
                gens = lodash_1.at(space, gen_paths).map(function (x) { return x.bind(undefined, seed); });
            }
            for (var _i = 0, _a = utils_1.cartesianProduct.apply(void 0, gens); _i < _a.length; _i++) {
                var genRst = _a[_i];
                var newGenObj = void 0;
                if (topLevelSpace) {
                    newGenObj = genRst[0];
                }
                else {
                    newGenObj = lodash_1.cloneDeep(space);
                    for (var i in genRst) {
                        lodash_1.set(newGenObj, gen_paths[i], genRst[i]);
                    }
                }
                var rst = processSpace(newGenObj, target);
                if (rst) {
                    return true;
                }
            }
            return false;
        }
        return processSpace(nodeSpace, node);
    };
    return ASTNodeSpace;
}());
exports["default"] = ASTNodeSpace;
var RandomASTNodeSpace = /** @class */ (function (_super) {
    __extends(RandomASTNodeSpace, _super);
    function RandomASTNodeSpace(AST) {
        var _this = _super.call(this) || this;
        _this.AST = AST;
        // let a: keyof ASTNodeSpace;
        var thisCls = _this;
        utils_1.visitWithPath(AST, new Proxy({}, {
            get: function (_target, property, _receiver) {
                if (property.endsWith(':exit')) {
                    // I want to skip this code https://github.com/federicobond/solidity-parser-antlr/blob/906d7ab5bb404fb392db52d133274d81da4e988d/src/index.js#L107
                    return undefined;
                }
                else {
                    return thisCls.buildASTNodeSet_visitor.bind(thisCls, AST);
                }
            }
        }));
        return _this;
    }
    return RandomASTNodeSpace;
}(ASTNodeSpace));
exports.RandomASTNodeSpace = RandomASTNodeSpace;
var SeededASTNodeSpace = /** @class */ (function (_super) {
    __extends(SeededASTNodeSpace, _super);
    function SeededASTNodeSpace(ASTNodes) {
        var _this = _super.call(this) || this;
        for (var _i = 0, ASTNodes_1 = ASTNodes; _i < ASTNodes_1.length; _i++) {
            var astNode = ASTNodes_1[_i];
            // Don't need scopeInfo being generated
            _this.buildASTNodeSet_visitor({}, astNode, []);
        }
        return _this;
    }
    SeededASTNodeSpace.getSeededASTNodeSpace = function (ASTNodes) {
        var inst = new SeededASTNodeSpace(ASTNodes);
        return new Proxy(inst, {
            get: this.get
        });
    };
    // XXX: This is pretty hacky
    SeededASTNodeSpace.get = function (inst, prop) {
        // Only intervent accessing ASTNode structure space info
        if (utils_1.astNodeTypeStrings.includes(prop)) {
            return inst.getSeededASTNodeBase(prop);
        }
        else {
            return inst[prop];
        }
    };
    SeededASTNodeSpace.prototype.getSeededASTNodeBase = function (nodeType) {
        var _this = this;
        assert_1["default"](utils_1.astNodeTypeStrings.includes(nodeType));
        // TODO: fix type error
        return function () {
            return __spreadArrays(_this.getPredefinedASTNodeSet(nodeType, undefined));
        };
    };
    return SeededASTNodeSpace;
}(ASTNodeSpace));
exports.SeededASTNodeSpace = SeededASTNodeSpace;
function recRemoveLocInfo(node) {
    return utils_1.deepOmit(node, ['loc', 'range']);
}
var NewNodeGenerationContext = /** @class */ (function () {
    function NewNodeGenerationContext(scopeInfo, forLocation) {
        this.scopeInfo = scopeInfo;
        this.forLocation = forLocation;
    }
    return NewNodeGenerationContext;
}());
exports.NewNodeGenerationContext = NewNodeGenerationContext;
