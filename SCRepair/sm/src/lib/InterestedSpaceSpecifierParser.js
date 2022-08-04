"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var assert_1 = require("assert");
var InterestedSpace_1 = require("./InterestedSpace/InterestedSpace");
function InterestedSpaceSpecifierParser(_ast, interested_space_specifier) {
    // Transform interested_space_specifier
    if (interested_space_specifier === undefined) {
        // All possible spaces are interested
        return undefined;
    }
    else {
        var rst = [];
        var _loop_1 = function (specifier) {
            if (specifier.length === 0) {
                return "continue";
            }
            var specifier_ = specifier;
            var begin_nodeTypeSpecifier = 'TYPE:';
            var begin_locationalSpecifier = 'LOC:';
            function processContractSpecifier(specifier_) {
                var arr = specifier_.trim().split('.');
                if (arr.length === 1 || arr[1] === '*') {
                    return new InterestedSpace_1.InterestedContract(arr[0], null);
                }
                else {
                    var functionName = arr[1] !== '(fallback)' ? arr[1] : '';
                    return new InterestedSpace_1.InterestedContract(arr[0], [functionName]);
                }
            }
            function processNodeTypeSpecifier(specifier_) {
                var nodeType_specifier = specifier_.trim().slice(begin_nodeTypeSpecifier.length);
                var parts = nodeType_specifier.split('-');
                assert_1["default"](parts.length >= 1 && parts.length <= 2, "malformed NodeType specifier");
                var interestedNodeType = new InterestedSpace_1.InterestedNodeType(parts[parts.length - 1]);
                if (parts.length === 2) {
                    var interestedContract = processContractSpecifier(parts[0]);
                    return new InterestedSpace_1.ConjunctInterestedSpace(interestedContract, interestedNodeType);
                }
                else {
                    return interestedNodeType;
                }
            }
            function processLocationalSpecifier(specifier_) {
                var location_specifier = specifier_.slice(begin_locationalSpecifier.length);
                var _a = location_specifier.split('-').map(function (x) { return x.trim(); }), start_specifier = _a[0], end_specifier = _a[1];
                var _b = start_specifier.split(','), start_line = _b[0], start_col = _b[1];
                var _c = end_specifier.split(','), end_line = _c[0], end_col = _c[1];
                return new InterestedSpace_1.InterestedLocation({
                    start: {
                        line: parseInt(start_line),
                        column: start_col !== undefined ? parseInt(start_col) : 0
                    },
                    end: {
                        line: parseInt(end_line),
                        column: end_col !== undefined ? parseInt(end_col) : Infinity
                    }
                });
            }
            if (specifier_.startsWith(begin_nodeTypeSpecifier)) {
                rst.push(processNodeTypeSpecifier(specifier_));
            }
            else if (specifier_.startsWith(begin_locationalSpecifier)) {
                rst.push(processLocationalSpecifier(specifier_));
            }
            else {
                rst.push(processContractSpecifier(specifier_));
            }
        };
        for (var _i = 0, _a = interested_space_specifier.split(';').map(function (x) { return x.trim(); }); _i < _a.length; _i++) {
            var specifier = _a[_i];
            _loop_1(specifier);
        }
        return rst;
    }
}
exports["default"] = InterestedSpaceSpecifierParser;
