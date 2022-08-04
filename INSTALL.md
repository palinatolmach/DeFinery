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
docker run -it --rm -v ~/Desktop/test:/experiments/ definery Unprotected
```

`~/Desktop/test:/experiments/` mounts a local folder (`/Desktop/test`) to the Docker container to facilitate the exploration of patched smart contracts—you can, then, view the results produced by the tool in this folder.

## Local Build

As an alternative to using Docker, you can also build the tool locally.
We have prepared a one-click script that performs the installation of the tool and its dependencies to your system (the script is tested on Ubuntu 18:04).
The script installs the necessary C++, Python, and Node dependencies (build-essential, libboost-all-dev, cmake, curl, zip, unzip, tar, vcpkg, Z3, nvm). It assumes that Python 3.7, pip, and Git are installed in the system — if not, please uncomment their installation in the script. It also unpacks the binary of `definery-see` from the archive and moves it to the `/SCRepair` folder. Both components in DeFinery are configured to read and write files from/to `./contracts/` (we move the contracts from `/contracts/eval` there) and `./experiments` folders located within `/SCRepair`. The script also builds the repair module of DeFinery using `npm`.

You can run the script as follows:

```
# install dependencies of the artifact and build the project
bash ./build.sh
```

To make sure that both symbolic-execution and repair components work as expected, you may run the following two commands in the provided order:
```
cd SCRepair

# Performing symbolic analysis of the Unprotected smart contract
# Results of the analysis should be saved in the ./experiments/Unprotected folder 
./definery-see -symexe-main ./contracts/Unprotected.sol Unprotected

# Based on the results of symbolic analysis, repair the smart contract
# The patched version of the contract should be saved in the ./experiments/Unprotected/patched folder 
python3.7 ./CLI.py --targetContractName Unprotected repair ./experiments/Unprotected/Unprotected.sol
```