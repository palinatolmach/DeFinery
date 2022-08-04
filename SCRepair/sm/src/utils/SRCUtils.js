"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var prettier_1 = require("prettier");
var prettier_plugin_solidity_1 = require("prettier-plugin-solidity");
var util_1 = require("util");
function a2S(ast) {
    try {
        var src = prettier_1["default"].format('PLACEHOLDER', {
            plugins: [
                prettier_plugin_solidity_1["default"],
                {
                    parsers: {
                        custom: __assign(__assign({}, prettier_plugin_solidity_1["default"].parsers['solidity-parse']), { parse: function () { return ast; } })
                    }
                },
            ],
            parser: 'custom'
        });
        return src;
    }
    catch (e) {
        console.error("AST = \n" + util_1["default"].inspect(ast, true, Infinity, true));
        console.error(e.stack);
        throw new Error(e);
    }
}
exports.a2S = a2S;
