"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var utils_1 = require("./utils");
var assert_1 = require("assert");
var util_1 = require("util");
function getFaultSpaceNodePath(faultSpace) {
    return faultSpace.nodePath;
}
exports.getFaultSpaceNodePath = getFaultSpaceNodePath;
function getFaultSpaceNodePair(ast, faultSpace) {
    return faultSpace.map(function (x) {
        var node = utils_1.getASTNodeFromPath(ast, x.nodePath);
        assert_1["default"](node !== undefined, "FaultSpace " + util_1["default"].inspect(x, false, Infinity, true) + " not found in AST");
        return [x, node];
    });
}
exports.getFaultSpaceNodePair = getFaultSpaceNodePair;
