# **DeFinery**: Property-Based Automated Program Repair of DeFi Protocols

- This artifact has been archived at the following permanent location: DOI.

- This repository serves as a submission for the Available and Reusable badges.


## **Overview**

This reporitory demonstrates how **DeFinery** can be used to automatically repair smart contracts that do not satisfy their functional specification. **DeFinery** takes a user-defined correctness property and a trace leading to its violation as input, based on which it automatically generates a diverse set of patches for a smart contract, while providing formal correctness guarantees w.r.t. the intended behavior. It combines search-based patch generation with semantic analysis of an original program to efficiently navigate the search space and generate higher-quality patches that cannot be obtained by other smart contract repair tools.

This README describes the [prerequisites](#prerequisites) for running DeFinery.
In the [Quick Start](#quick-start) section of the README, we show how to run the pre-built Docker image of DeFinery to reproduce the results shown in the paper. The information on the smart contract dataset used for the evaluation is provided in [Experimental Data](#experimental-data). More details on the prototype implementation are shown in [Prototype Implementation](#prototype-implementation).

The instructions on how to build the tool from scratch are provided in the [INSTALL.md](./INSTALL.md) file.

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

The scripts included in this repository have been tested on Ubuntu 18:04. The binary of a symbolic execution component ([definery-see.zip](/.definery-see.zip)) is also built for Linux-AMD64 (Ubuntu 18.04).

## **Quick Start**

The easiest way to run **DeFinery** is by a public Docker image using the following command:
`docker run -it --rm -v  YOUR_PATH/experiments:/experiments/ definerysc/definery CONTRACT_NAME`

The command will pull the Docker container and execute both symbolic analysis and patch generation for a given smart contract, which can be one of the following: [`xForce`, `iToken`, `cToken`, `Value`, `Uranium`, `Unprotected`, `Refund_NoSub`, `Confused_Sign`, `EtherBank`]. Please make sure that `YOUR_PATH` is an absolute path.

Running this command will add files produced by symbolic engine and patch generator into the `YOUR_PATH/experiments/CONTRACT_NAME` folder. The `patched` folder contains plausible patches that pass the test cases generated by our tool. Once at least one of the patches passes conditional equivalence checking, you will see the following text pointing to the location of a correct patch in a <code>/patched</code> folder:

`The valid implementation is EQUIVALENT: /experiments/CONTRACT_NAME/patched/patched_0.sol`

The instructions for building the tool from the source code contained in this repo are described in the INSTALL.md file.

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
