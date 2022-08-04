"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var winston_1 = require("winston");
var yes_no_1 = require("yes-no");
var logger = winston_1["default"].createLogger({
    format: winston_1["default"].format.combine(winston_1["default"].format.timestamp(), winston_1["default"].format.cli(), winston_1["default"].format.printf(function (info) {
        return info.timestamp + " " + info.level + ": " + info.message;
    })),
    level: typeof process.env.DEBUG !== 'undefined' && yes_no_1.parse(process.env.DEBUG) ? 'debug' : 'info',
    transports: [
        new winston_1["default"].transports.Console({
            stderrLevels: ['debug', 'error', 'info']
        }),
    ]
});
exports["default"] = logger;
