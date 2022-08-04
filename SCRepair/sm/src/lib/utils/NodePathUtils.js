"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var _1 = require(".");
function getNodePathScopeInfo(ast, nodePath) {
    var contractName = undefined;
    var functionName = undefined;
    _1.objPathVisit(ast, nodePath, function (node) {
        if (_1.isASTNode(node)) {
            switch (node.type) {
                case 'ContractDefinition': {
                    contractName = node.name;
                    return true;
                }
                case 'FunctionDefinition': {
                    functionName = node.name;
                    // All wanted info has been found, stop visiting further
                    return false;
                }
            }
        }
        return true;
    });
    return {
        contractName: contractName,
        functionName: functionName
    };
}
exports.getNodePathScopeInfo = getNodePathScopeInfo;
