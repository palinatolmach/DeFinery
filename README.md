# **DeFinery**: Property-Based Automated Program Repair of DeFi Protocols

- This artifact has been archived at the following permanent location: DOI.

- This repository serves as a submission for the Available and Reusable badges.


## **Overview**

This reporitory demonstrates how **DeFinery** can be used to automatically repair smart contracts that do not satisfy their functional specification. **DeFinery** takes a user-defined correctness property and a trace leading to its violation as input, based on which it automatically generates a diverse set of patches for a smart contract, while providing formal correctness guarantees w.r.t. the intended behavior. It combines search-based patch generation with semantic analysis of an original program to efficiently navigate the search space and generate higher-quality patches that cannot be obtained by other smart contract repair tools.

This README describes the [prerequisites](#prerequisites) for running DeFinery.
In the [Quick Start](#quick-start) section of the README, we show how to run the pre-built Docker image of DeFinery to reproduce the results shown in the paper.

The information on the smart contract dataset used for the evaluation is provided in [Experimental Data](#experimental-data). More details on the prototype implementation are shown in [Prototype Implementation](#prototype-implementation).

The instructions on how to build the tool from scratch are provided separately in the [INSTALL.md](./INSTALL.md) file.

## **Content**

The repository is structured as follows:

```
DeFinery
│   DeFinery.pdf
│   README.md
│   INSTALL.md
│   LICENSE.md
│   Dockerfile
|   definery-see.zip
│   build.sh
│   start.sh
└───contracts
│   └─── eval/
│   └─── patched/
│   └─── raw/
└───raw_results
│   └─── Confused_Sign/
│   └─── EtherBank/
│   └─── Refund_NoSub/
│   └─── Unprotected/
│   └─── Uranium/
│   └─── Value/
│   └─── cToken/
│   └─── iToken/
│   └─── xForce/
└───SCRepair
│   README.md
│   CLI.py
│   CR.py
│   ETC.py
│   GR.py
│   IN.py
│   Slither.py
│   SolVer.py
│   SolidityM.py
│   StoreKeyValuePairAction.py
│   Utils.py
│   __init__.py
│   __main__.py
│   build.rb
│   requirements.txt
│   setup.py
│   └─── sm/
│   └─── test/
```

| Files/Dirs                                                                        |  Descriptions                                                   |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------|
| [DeFinery.pdf](./DeFinery.pdf)                                                          | PDF of the accepted paper.                                                      |
| README.md                                                                          | This README file.                                               |
| [INSTALL.md](./INSTALL.md)                                                                     | File containing instructions for building and running the tool.                                               |
| [build.sh](./build.sh)                                                  | Script for local installation of the tool. See [INSTALL](./INSTALL.md).                     |
| [Dockerfile](./Dockerfile)                                                        | File used to make a Docker image. See [INSTALL](./INSTALL.md).   |
| [contracts](./contracts)                                                            | Smart contracts used for evaluation. See [Experimental Data](#experimental-data).              |
| [raw_results](./raw_results)                                                            | Raw results of the evaluation discussed in the paper. See [Experimental Data](#experimental-data).              |
| [definery-see.zip](./definery-see.zip)                                                            | An archived binary of a symbolic execution engine used in DeFinery.              |
| [start.sh](./start.sh)                                                            | Script running DeFinery on a given smart contract. |
| [SCRepair](./SCRepair)                                                                 | Implementation of the repair component based on [SCRepair](https://github.com/xiaoly8/SCRepair/).                                      |


A companion website for the paper submission can also be found at: https://sites.google.com/view/ase2022-definery/.
 
---
 
## Prerequisites

We use Docker 20.10.14 that can be obtained from the Docker [website](https://docs.docker.com/get-docker/).

DeFinery also uses Python 3.7 and Node v14.20.0.

The scripts included in this repository have been tested on Ubuntu 18:04. The binary of a symbolic execution component ([definery-see.zip](./definery-see.zip)) is also built for Linux-AMD64 (Ubuntu 18.04).

## **Quick Start**

The easiest way to run **DeFinery** is by a public Docker image using the following command:

`docker run -it --rm -v  YOUR_PATH/experiments:/experiments/ definerysc/definery CONTRACT_NAME`

The command will pull the Docker container and execute both symbolic analysis and patch generation for a given smart contract, which can be one of the following: [`xForce`, `iToken`, `cToken`, `Value`, `Uranium`, `Unprotected`, `Refund_NoSub`, `Confused_Sign`, `EtherBank`]. Please make sure that `YOUR_PATH` is an absolute path.

Running this command will add files produced by symbolic engine and patch generator into the `YOUR_PATH/experiments/CONTRACT_NAME` folder. The `patched` folder contains plausible patches that pass the test cases generated by our tool. Once at least one of the patches passes conditional equivalence checking, you will see the following text pointing to the location of a correct patch in a <code>/patched</code> folder:

`The valid implementation is EQUIVALENT: /experiments/CONTRACT_NAME/patched/patched_0.sol`

For example, you can run the following command to repair the `xForce` smart contract:


`docker run -it --rm -v  ~/Desktop/experiments:/experiments/ definerysc/definery xForce`


The tool will, first, start the symbolic analysis of the given smart contract:
```
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
dumping contract information: 
Contract: _MAIN_
	Constructor: _MAIN_()
	State Variables:
		force
		$var_0
		$var_1
		user
		xforce
	Modifiers:
	Functions:
		_MAIN_:::function ()
		_MAIN_::declare_property:function (bool)
...
```

The result of the analysis will be saved in the `~/Desktop/experiments/xForce` folder to be reused during repair, after which the repair process will start:
```
result context [1]: 
Is possibly reentrant: 0
RESULT: 0
The trace is INVALID
$var_0 = 0
$var_1 = 97
result context [2]: 
Is possibly reentrant: 0
RESULT: 1
The trace is VALID
$var_0 = 2
$var_1 = 2
Recording summary, validCount: 1
Summary file is /experiments/xForce/summary.txt
[2022-08-04 10:22:25.762851] INFO: CLI: Start repairing problems
```

The repair component will output the information on the patch searching process, such as identified plausible patches, fitness values for the evaluated generation, etc. Once the valid (equivalent) patch is identified, it will show the name of the repaired smart contract located in the `~/Desktop/experiments/xForce/patched/` folder.

```
                  	     	                               fitness values                               	    	                                 	                                              
                  	     	----------------------------------------------------------------------------	    	                                 	                                              
gen               	evals	min                                  	max                                 	op  	#targetedVuls                    	#targetedVuls(detailed)vuls-best-patch(max: 3)
0                 	11   	{'hard': '(-1.0,)', 'soft': '(1.0,)'}	{'hard': '(0.0,)', 'soft': '(1.0,)'}	init	(0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1)	                                              
plausible-last-gen	6    	{'hard': '(0.0,)', 'soft': '(2.0,)'} 	{'hard': '(0.0,)', 'soft': '(1.0,)'}	init	(0, 0, 0, 0, 0, 0)               	                                              
[2022-08-04 10:22:41.192624] INFO: CR.py: Plausible patches details:
...
[2022-08-04 10:22:41.192737] INFO: CR.py: Evaluated 10 patches
Testing equivalence... 0
Testing equivalence... 1
The valid implementation is EQUIVALENT: /experiments/xForce/patched/patched_1.sol
Testing equivalence... 2
Testing equivalence... 3
Testing equivalence... 4
Testing equivalence... 5
```

If you inspect the generated file, you will notice that the fix `require(res);` is now included in the `deposit()` function of the xForce smart contract:
```
-> % cat ~/Desktop/experiments/xForce/patched/patched_1.sol 
...
    function deposit(uint256 amount) external {
        // Gets the amount of Force locked in the contract
        uint256 totalForce;
        totalForce = force.balanceOf(address(this));
        // Gets the amount of xForce in existence
        uint256 totalShares = totalSupply;
        // If no xForce exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalForce == 0) {
            _mint(msg.sender, amount);
        } else {
            uint256 what = (amount * totalShares) / totalForce;
            _mint(msg.sender, what);
        }
        // Lock the Force in the contract; Missing check on return value of transferFrom();
        bool res;
        res = force.transferFrom(msg.sender, address(this), amount);
        require(res);
    }
```

The instructions for **building the tool from the source code** contained in this repo are described in the INSTALL.md file.

## Reproducing Experimental Results

To reproduce the results of the evaluation shown in the paper using Docker, you may simply repeat the process described above for the 9 smart contracts used in the experiments: `xForce`, `iToken`, `cToken`, `Value`, `Uranium`, `Unprotected`, `Refund_NoSub`, `Confused_Sign`, `EtherBank`.

The commands to be run would look as follows:

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery Confused_Sign`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery xForce`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery Unprotected`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery cToken`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery iToken`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery Value`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery Refund_NoSub`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery EtherBank`

`docker run -it --rm -v ~/Desktop/experiments:/experiments/ definerysc/definery Uranium`

The output of the tool will suggest the name of the valid (equivalent) patch for the contract, which will be located in, e.g. `~/Deskop/experiments/CONTRACT_NAME/patched/` folder.

## Experimental Data

We evaluated our tool on a dataset of 9 smart contracts that include 5 real-world DeFi smart contracts and 4 benchmark smart contracts selected from the [SmartBugs](https://github.com/smartbugs/smartbugs) dataset. The analyzed smart contracts are available in the [/contracts](https://github.com/definery-sc/DeFinery/tree/main/contracts) folder. The [/raw](https://github.com/definery-sc/DeFinery/tree/main/contracts/eval) folder contains adapted source code of the analyzed smart contracts, while [/eval](https://github.com/definery-sc/DeFinery/tree/main/contracts/eval) contains files that were symbolically analyzed, i.e., they include analyzed smart contract code, the Main contract encoding the harness function for symbolic analysis, and supplementary code (e.g., User smart contracts).

[/raw_results](https://github.com/definery-sc/DeFinery/tree/main/raw_results) reports raw experimental data for running our tool on our dataset. On average, it tool **DeFinery** 53 seconds to analyze and fix a smart contract. We provide more detailed statistics on our [website](https://sites.google.com/view/ase2022-definery/).

## Prototype Implementation

The code for the patch generation module based on [SCRepair](https://github.com/xiaoly8/SCRepair) is available in the [/code/SCRepair ](https://github.com/definery-sc/DeFinery/tree/main/code/SCRepair) folder with the installation instructions. The implementation of the patch generation module is a work in progress.

Our modified version of SCRepair relies on our symbolic engine, **DeFinery-see**, the binary for which is available [for download](https://drive.google.com/file/d/1eDVyjNiSIqzFPpMXj0bTFRKAxTHkzsVY/view), and assumes that semantic analysis results are available in the `/experiments/CONTRACT_NAME` folder. The binary is built for Linux-AMD64 (Ubuntu 18.04). It takes 3 arguments:

* Execution mode:  `-symexe-main` (symbolically executes the harness function and records the results in the `/experiments/CONTRACT_NAME/` folder;  `-symexe-check` (symbolically executes the harness function but does not save resulting files); `-symexe-eqcheck` performs conditional equivalence checking between the file provided as a second argument (e.g., `./contracts/CONTRACT_NAME_patched.sol`) and a previously recorded summary of the `CONTRACT_NAME`. The summary of the original smart contract is to be available at `./experiments/CONTRACT_NAME/`, therefore the invokation in this mode should be preceded by a `-symexe-main` execution.
* The path to a smart contract or a file with several smart contracts to be analyzed, e.g., `/contracts/CONTRACT_NAME.sol`. This file has to be located in the /contracts folder. There should also be an `/experiments` folder to store the results.
* The name of a vulnerable smart contract to be repaired: `CONTRACT_NAME`

`./definery-see -symexe-main ~/contracts/CONTRACT_NAME.sol CONTRACT_NAME`
