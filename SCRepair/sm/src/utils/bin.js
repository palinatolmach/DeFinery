#!/usr/bin/env node
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
var yargs_1 = require("yargs/yargs");
var Mutations_1 = require("../lib/Mutations");
var utils_1 = require("../lib/utils");
var GenMutations_1 = require("./GenMutations");
function main() {
    var genMutations_common_args = {
        'for-node-types': {
            demandOption: false,
            type: 'array'
        },
        'replaceable-node-types': {
            demandOption: false,
            type: 'array'
        },
        mutation_types: {
            alias: 'types',
            demandOption: false,
            "default": Mutations_1.allMutationTypes,
            type: 'array'
        },
        'must-include-mutation-types': {
            demandOption: false,
            type: 'array'
        },
        'only-compilable': {
            demandOption: false,
            "default": true,
            type: 'boolean'
        },
        'simplify': {
            demandOption: false,
            "default": false,
            type: 'boolean'
        },
        'patched-src-dir': {
            normalize: true,
            demandOption: true,
            type: 'string'
        },
        'output-mutation': {
            demandOption: false,
            "default": false,
            type: 'boolean',
            group: 'debug:'
        },
        seed: {
            demandOption: false,
            "default": 'lucky-seed'
        },
        'mutation-space': {
            demandOption: false,
            "default": undefined
        }
    };
    var genMutations_common_args_check = function (argv) {
        var c1 = (argv['output-mutation'] === false || argv['patched-src-dir'] !== undefined);
        var for_node_types = argv['for-node-types'];
        var c2 = for_node_types === undefined || (Array.isArray(for_node_types) && for_node_types.every(function (x) { return utils_1.astNodeTypeStrings.includes(x); }));
        return c1 && c2;
    };
    yargs_1["default"](process.argv.slice(2))
        .command('iter-gen-mutations <path_to_contract_source>', "Itereatively generate mutants. It expects continuous user input that input specifies a solidity contract, this outputs a mutant of the provided versison of smart contract mutated using one mutation operator.\n\
      This command doesn't generate two identifcal smart contracts.", (function (parameter_yargs) {
        parameter_yargs
            .options(__assign({}, genMutations_common_args))
            .check(genMutations_common_args_check);
    }), function (x) {
        return GenMutations_1["default"](x, 'iter-json', x['max-mutation-sequences-length'], x['patched-src-dir'], (typeof x.seed === 'undefined' ? Math.random().toString() : x.seed), true, x['mutation-space'], (x['for-node-types'] === undefined ? undefined : x['for-node-types']), x.mutation_types, (x['replaceable-node-types'] === undefined ? undefined : x['replaceable-node-types']), x['simplify'], x['output-mutation'], true);
    })
        .help()
        .recommendCommands()
        .strict()
        .completion('completion')
        .parse();
}
exports["default"] = main;
main();
