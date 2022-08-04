"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var debug_1 = require("debug");
debug_1["default"].formatters.e = function (fn) { return fn(); };
exports["default"] = debug_1["default"];
