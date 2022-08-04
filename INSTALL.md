# Building DeFinery

As discussed in the [README](.README.md), the easiest way to run DeFinery is using a public Docker image.
The tool, however, can also be installed locally using the source code and a binary contained in this repository. This can be done in two ways: using Docker or building the tool directly in your system locally. In both cases, the installation may take up to 50 minutes, since some of the project dependencies (Z3, in particular) take quite long to install.

## Prerequisites

To build a Docker image for DeFinery, we have used Docker 20.10.14 that can be obtained from the Docker [website](https://docs.docker.com/get-docker/).

The script provided in this repository were evaluated on Ubuntu 18:04. The binary of a symbolic execution component ([definery-see.zip](./definery-see.zip)) is also built for Linux-AMD64 (Ubuntu 18.04). 

DeFinery also uses Python 3.7 and Node v14.20.0.


## Dockerization

The first way to build DeFinery locally is build a Docker image from the code contained in this repository. This can be done using the provided [Dockerfile](./Dockerfile) in the following way:
```
# Creating an image called DeFinery
docker build -t definery .
```

Once the image is created, you can verify the tool installation by repairing one of the smart contracts used for the evaluation, e.g.,
```
docker run -it --rm -v ~/Desktop/experiments:/experiments/ definery xForce
```

`~/Desktop/test:/experiments/` mounts a local folder (`/Desktop/experiments`) to the Docker container to facilitate the exploration of patched smart contracts—you can, then, view the results produced by the tool in this folder.

The output produced by the container should be similar to the one described in [README.md](./README.md).

To reproduce the result of the evaluation shown in the paper, run the same command while substituting the name of the contract (e.g., `xForce`) with one of the following contract names: [xForce, iToken, cToken, Value, Uranium, Unprotected, Refund_NoSub, Confused_Sign, EtherBank]. 

## Local Build

As an alternative to using Docker, you can also build the tool locally.
We have prepared a one-click script [build.sh](./build.sh) that performs the installation of the tool and its dependencies to your system (the script is tested on Ubuntu 18:04).

The script installs the necessary C++, Python, and Node dependencies (build-essential, libboost-all-dev, cmake, curl, zip, unzip, tar, vcpkg, Z3, nvm). It assumes that Python 3.7, pip, and Git are installed in the system — if not, please uncomment their installation in the script.
The script also unpacks the binary of `definery-see` from the archive and moves it to the `/SCRepair` folder. Both components in DeFinery are configured to read and write files from/to `./contracts/` (we move the contracts from `/contracts/eval` there) and `./experiments` folders located within `/SCRepair`. The script also builds the repair module of DeFinery using `npm`.

You can run the script as follows:

```
# install dependencies of the artifact and build the project
bash ./build.sh
```

To make sure that both symbolic-execution and repair components work as expected, you may run the following two commands in the provided order:
```
cd SCRepair

# Performing symbolic analysis of the xForce smart contract
# Results of the analysis should be saved in the ./experiments/xForce folder 
./definery-see -symexe-main ./contracts/xForce.sol xForce

# Based on the results of symbolic analysis, repair the smart contract
# The patched version of the contract should be saved in the ./experiments/xForce/patched folder 
python3.7 ./CLI.py --targetContractName xForce repair ./experiments/xForce/xForce.sol
```

Once completed, the first command should output the results of the symbolic analysis:
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

The second command will identify the correct patch for a smart contract and will save it in the `./experiments/xForce/patched/` folder.
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

As in the case of running a Docker container, if you inspect the generated file, you will notice that the fix `require(res);` is now included in the `deposit()` function of the xForce smart contract:
```
-> % cat ./experiments/xForce/patched/patched_1.sol 
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
