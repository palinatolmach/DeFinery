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
var LocInclude_1 = require("../LocInclude");
var utils_1 = require("../utils");
var assert_1 = require("assert");
var EarlyExitFromVIsitorException = /** @class */ (function () {
    function EarlyExitFromVIsitorException() {
    }
    return EarlyExitFromVIsitorException;
}());
var InterestedSpace = /** @class */ (function () {
    function InterestedSpace() {
    }
    InterestedSpace.prototype.isNodeInExactScope = function (astNode, nodePath, wholeFileAST) {
        return this.isNodeInterested(astNode, nodePath, wholeFileAST);
    };
    return InterestedSpace;
}());
exports.InterestedSpace = InterestedSpace;
var ConjunctInterestedSpace = /** @class */ (function (_super) {
    __extends(ConjunctInterestedSpace, _super);
    function ConjunctInterestedSpace() {
        var interestedSpaces = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            interestedSpaces[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.interestedSpaces = interestedSpaces;
        return _this;
    }
    ConjunctInterestedSpace.prototype.isNodeInterested = function (astNode, nodePath, wholeFileAST) {
        return this.interestedSpaces.every(function (x) { return x.isNodeInterested(astNode, nodePath, wholeFileAST); });
    };
    ConjunctInterestedSpace.prototype.isNodeInExactScope = function (astNode, nodePath, wholeFileAST) {
        return this.interestedSpaces.every(function (x) { return x.isNodeInExactScope(astNode, nodePath, wholeFileAST); });
    };
    return ConjunctInterestedSpace;
}(InterestedSpace));
exports.ConjunctInterestedSpace = ConjunctInterestedSpace;
var InterestedLocation = /** @class */ (function (_super) {
    __extends(InterestedLocation, _super);
    function InterestedLocation(location) {
        var _this = _super.call(this) || this;
        _this.location = location;
        return _this;
    }
    InterestedLocation.prototype.isNodeInterested = function (astNode, _nodePath, _wholeFileAST) {
        return astNode.loc !== undefined && utils_1.locationIntersect(astNode.loc, this.location);
    };
    InterestedLocation.prototype.isNodeInExactScope = function (astNode, _nodePath, _wholeFileAST) {
        return astNode.loc !== undefined && LocInclude_1["default"](astNode.loc, this.location);
    };
    return InterestedLocation;
}(InterestedSpace));
exports.InterestedLocation = InterestedLocation;
var InterestedNodeType = /** @class */ (function (_super) {
    __extends(InterestedNodeType, _super);
    function InterestedNodeType(nodeType) {
        var _this = _super.call(this) || this;
        _this.nodeType = nodeType;
        return _this;
    }
    InterestedNodeType.prototype.isNodeInterested = function (astNode, _nodePath, _wholeFileAST) {
        return utils_1.isASTNode(astNode);
    };
    InterestedNodeType.prototype.isNodeInExactScope = function (astNode, _nodePath, _wholeFileAST) {
        return astNode.type === this.nodeType;
    };
    return InterestedNodeType;
}(InterestedSpace));
exports.InterestedNodeType = InterestedNodeType;
var InterestedContract = /** @class */ (function (_super) {
    __extends(InterestedContract, _super);
    function InterestedContract(contractName, functionNames) {
        var _this = _super.call(this) || this;
        _this.contractName = contractName;
        _this.functionNames = functionNames;
        assert_1["default"](!Array.isArray(_this.functionNames) || functionNames.length !== 0);
        return _this;
    }
    InterestedContract.prototype.isNodeInterested = function (_astNode, nodePath, wholeFileAST) {
        var rst = true;
        var thisInstance = this;
        function visitPath(node) {
            switch (node.type) {
                case 'ContractDefinition': {
                    if (thisInstance.contractName !== node.name) {
                        rst = false;
                        throw new EarlyExitFromVIsitorException();
                    }
                    else if (thisInstance.contractName === node.name && thisInstance.functionNames === null) {
                        rst = true;
                        throw new EarlyExitFromVIsitorException();
                    }
                    else {
                        assert_1["default"](thisInstance.contractName === node.name && Array.isArray(thisInstance.functionNames));
                        // Note: Comment the following to make only statements in a function interested
                        rst = true;
                        return true;
                    }
                    // break;
                }
                case 'FunctionDefinition': {
                    assert_1["default"](Array.isArray(thisInstance.functionNames));
                    rst = (thisInstance.functionNames.includes(node.name));
                    throw new EarlyExitFromVIsitorException();
                }
                default: {
                    return true;
                }
            }
        }
        ;
        try {
            utils_1.objPathVisit(wholeFileAST, nodePath, visitPath);
        }
        catch (EarlyExitFromVIsitorException) { }
        return rst;
    };
    InterestedContract.prototype.isNodeInExactScope = function (_astNode, nodePath, wholeFileAST) {
        var rst = true;
        var thisInstance = this;
        function visitPath(node) {
            switch (node.type) {
                case 'ContractDefinition': {
                    if (thisInstance.contractName !== node.name) {
                        rst = false;
                        throw new EarlyExitFromVIsitorException();
                    }
                    else if (thisInstance.contractName === node.name && thisInstance.functionNames === null) {
                        rst = true;
                        throw new EarlyExitFromVIsitorException();
                    }
                    else {
                        assert_1["default"](thisInstance.contractName === node.name && Array.isArray(thisInstance.functionNames));
                        rst = false;
                        return true;
                    }
                    // break;
                }
                case 'FunctionDefinition': {
                    assert_1["default"](Array.isArray(thisInstance.functionNames));
                    rst = (thisInstance.functionNames.includes(node.name));
                    throw new EarlyExitFromVIsitorException();
                }
                default: {
                    return true;
                }
            }
        }
        ;
        try {
            utils_1.objPathVisit(wholeFileAST, nodePath, visitPath);
        }
        catch (EarlyExitFromVIsitorException) { }
        return rst;
    };
    return InterestedContract;
}(InterestedSpace));
exports.InterestedContract = InterestedContract;
