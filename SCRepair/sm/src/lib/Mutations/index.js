"use strict";
/**
 * @author: Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
 *
 */
exports.__esModule = true;
var util_1 = require("util");
var Mutation_1 = require("./Mutation");
exports.Mutation = Mutation_1["default"];
var InsertionM_1 = require("./InsertionM");
var InsertionM_2 = require("./InsertionM");
exports.InsertionM = InsertionM_2["default"];
var DeletionM_1 = require("./DeletionM");
var DeletionM_2 = require("./DeletionM");
exports.DeletionM = DeletionM_2["default"];
var MovementM_1 = require("./MovementM");
var MovementM_2 = require("./MovementM");
exports.MovementM = MovementM_2["default"];
var ReplacementM_1 = require("./ReplacementM");
var ReplacementM_2 = require("./ReplacementM");
exports.ReplacementM = ReplacementM_2.ReplacementM;
var RandomMutationGenerator_1 = require("./RandomMutationGenerator");
exports.RandomMutationGenerator = RandomMutationGenerator_1["default"];
exports.allMutationTypes = [
    InsertionM_1["default"].name,
    ReplacementM_1.ReplacementM.name,
    DeletionM_1["default"].name,
    MovementM_1["default"].name,
];
function objToMutation(obj) {
    if (typeof obj.mutationType !== 'undefined' &&
        [InsertionM_1["default"].name, ReplacementM_1.ReplacementM.name, DeletionM_1["default"].name, MovementM_1["default"].name].includes(obj.mutationType)) {
        switch (obj.mutationType) {
            case InsertionM_1["default"].name: {
                return new InsertionM_1["default"](obj.targetPropertyPath, obj.insertIndex, obj.newNode);
            }
            case ReplacementM_1.ReplacementM.name: {
                return new ReplacementM_1.ReplacementM(obj.targetNodePath, obj.newNode);
            }
            case DeletionM_1["default"].name: {
                return new DeletionM_1["default"](obj.targetNodePath);
            }
            case MovementM_1["default"].name: {
                return new MovementM_1["default"](obj.ast, obj.fromNodePath, obj.toPropertyPath, obj.insertIndex);
            }
            default: {
                throw new Error('Regression logic error');
            }
        }
    }
    else {
        throw new Error("The following object is not a mutation object:\n" + util_1["default"].inspect(obj, true, Infinity, true));
    }
}
exports.objToMutation = objToMutation;
