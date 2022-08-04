Our patch generation module is based on a modified version of **SCRepair** — first automated smart contract gas-optimized vulnerability repair system available [here](https://github.com/xiaoly8/SCRepair). SCRepair can automatically generate patches fixing vulnerabilities while attempt to keep the test cases passing. Ethereum smart contract written in Solidity is supported.

While an original implementation supports Slither and Oyente as vulnerability detector, we have integrated SCRepair with our semantic analysis module for fault localization and patch assessment processes.

Installation
===

To install SCRepair, use the following command, and the dependencies will be automatically installed and configured:

```Bash
python3.7 setup.py install
```

To setup the patch generation component implemented in TypeScript, run the following command:

```Bash
cd sm && npm install && npm run-script build
```

To Use
===

Use the following command

```Bash
python3 CLI.py --targetContractName CONTRACT_NAME repair PATH_TO_CONTRACT
```

The modified version used in **DeFinery** relies on our symbolic engine, the binary for which is available in this repository, and assumes that semantic analysis results are available in the `./experiments/CONTRACT_NAME` folder.

Original SCRepair Publication
===

Paper proposing SCRepair "Smart Contract Repair" appeared in TOSEM (ACM Transactions on Software Engineering and Methodology). The full-text is available at https://arxiv.org/abs/1912.05823

```bibtex
@misc{yu2020SCRepair,
    title={Smart Contract Repair},
    author={Xiao Liang Yu and Omar Al-Bataineh and David Lo and Abhik Roychoudhury},
    year={2020},
    journal={ACM Transactions on Software Engineering and Methodology (TOSEM)},
    publisher={ACM New York, NY, USA}
}
```

SCRepair Team
===

Abhik Roychoudhury, Principal Investigator

Developed by Xiao Liang Yu <xiaoly@comp.nus.edu.sg>
