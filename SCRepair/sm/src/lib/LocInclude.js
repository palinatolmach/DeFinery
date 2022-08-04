"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var utils_1 = require("./utils");
function locInclude(loc, inLoc) {
    return utils_1.cmpLineColumn(loc.start, inLoc.start) >= 0 && utils_1.cmpLineColumn(loc.end, inLoc.end) <= 0;
}
exports["default"] = locInclude;
