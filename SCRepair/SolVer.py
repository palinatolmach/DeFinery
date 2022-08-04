"""
@author: Xiao Liang Yu
"""
from IN import ProblemDetector, ProblemDetectorResult, DetectedVulnerability, VulnerabilityInfo, NonDetectedVulnerability, FailedTrace, PassedTrace, RectifiedVulnerability, UnrectifiedVulnerability
from IN import CodeRange, Location
from encodings import utf_8
from typing import Iterable, Union, Dict, Optional, Any, ClassVar, Sequence, DefaultDict, cast, List, Tuple
from pathlib import Path
from logbook import Logger
import os
import json
import concurrent
import asyncio
from collections import defaultdict
from Utils import FaultElement_NodeType, FaultElement_CodeRange
from itertools import chain
import subprocess
from tempfile import mkdtemp
import sys
import contextvars
import functools
import re

logger = Logger(os.path.basename(__file__))

class TestCaseExecutionResult(VulnerabilityInfo):
    def isTargeted(self,
                   targetedVul: Optional[Sequence[str]] = None,
                   targetedLocation: Optional[Sequence[CodeRange]] = None
                   ) -> bool:
        return self.detected

class PassedValidCase(PassedTrace, TestCaseExecutionResult):
    pass

class FailedValidCase(FailedTrace, TestCaseExecutionResult):
    pass

class PassedInvalidCase(RectifiedVulnerability, TestCaseExecutionResult):
    pass

class FailedInvalidCase(UnrectifiedVulnerability, TestCaseExecutionResult):
    pass

class SolVer(ProblemDetector):

    contractName: str = ''
    name: str ='SolVer'
    threadPool: ClassVar[
        concurrent.futures.
        ThreadPoolExecutor] = concurrent.futures.ThreadPoolExecutor()
    paths_tc: Tuple[str, ...]

    def __init__(self, args):
        super().__init__(args)
        self.paths_tc = []
        self.ref_values = {}


    async def to_thread(func, *args, **kwargs):
        loop = asyncio.get_running_loop()
        ctx = contextvars.copy_context()
        func_call = functools.partial(ctx.run, func, *args, **kwargs)
        return await loop.run_in_executor(None, func_call)


    # Only support one source code for now
    async def detect(self,
                     path_source: Sequence[Path],
                     firstEval: bool = False,
                     targetContractName: Optional[str] = None,
                     targetLocations: Optional[Sequence[CodeRange]] = None,
                     targetedVul: Optional[Sequence[str]] = None,
                     fastFail: bool = True,
                     **extra_args) -> ProblemDetectorResult:
        """
        execute SolVer on the collected contracts
        :param path_source:
        :return:
        """
        folder = mkdtemp()

        self.contractName = targetContractName

        if (len(self.paths_tc) == 0):
            tcPath = F'/experiments/{targetContractName}'
            print(F'tcPath {tcPath}')

            dirTestCases = Path(tcPath)

            self.paths_tc = tuple(
                str((dirTestCases / p).absolute())
                for p in os.listdir(dirTestCases)
                # Not including .DS_store
                if (not p.startswith('.') and not p.startswith('summary')
                    and not p.startswith('no_')
                    and not p.startswith(targetContractName)
                    and not p.startswith('original') and not p.startswith('patched')))

        logger.info(F'Start executing {len(self.paths_tc)} test cases using SolVer with symbex')

        tcRsts_ = await asyncio.gather(*(self.execTC(p, path_source, folder, firstEval)
                             for p in self.paths_tc))

        tcRsts: List[VulnerabilityInfo]
        tcRsts = []

        for testFile, rst in zip(self.paths_tc, tcRsts_):
            if 'invalid' in testFile: # the trace was invalid
                vulInfoObj: Optional[VulnerabilityInfo] = None
                if rst is True:
                    vulInfoObj = PassedInvalidCase(name=str(testFile))
                elif rst is False:
                    vulInfoObj = FailedInvalidCase(name=str(testFile))

                if vulInfoObj is not None:
                    tcRsts.append(vulInfoObj)
            else: # the trace is valid
                vulInfoObj: Optional[VulnerabilityInfo] = None
                if rst is True:
                    vulInfoObj = PassedValidCase(name=str(testFile))
                elif rst is False:
                    vulInfoObj = FailedValidCase(name=str(testFile))

                if vulInfoObj is not None:
                    tcRsts.append(vulInfoObj)

        logger.debug(F'{len(tcRsts)} test cases finally executed')

        print(F"The test cases execution result for {str(path_source[0]).rsplit('/', 1)[1]} is {tcRsts}")
        return tcRsts

    async def execTC(self, path, source, folder, firstEval) -> bool:
        newPath = folder + '/' + path.rsplit('/', 1)[1] + '_' + str(source[0]).rsplit('/', 1)[1]
        refPath = path + '/' + self.contractName + '.sol'

        output_file = open(newPath, "w")
        with open(source[0], "r") as scan:
            output_file.write(scan.read())
        with open(refPath, "r") as scan:
            output_file.write(scan.read())
        # Closing the output file
        output_file.close()
        scan.close()

        args_execTC = F'../definery-see -symexe-check {newPath} {self.contractName}'

        try:
            execTCRun = await asyncio.create_subprocess_shell(
                args_execTC,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            data_stdout, _ = await execTCRun.communicate()
        finally:
            if 'execTCRun' in vars() and execTCRun.returncode is None:
                # execTCRun.stderr.close()
                # execTCRun.stdout.close()
                execTCRun.kill()        # assert execTCRun.returncode == 0

        stdout = data_stdout.decode(utf_8.getregentry().name)
        output = stdout

        result = re.findall("Name and Valuation:.*", output)

        ref_vals = {}
        if firstEval:
            logger.info(F'Results for {path} are {result}')
            for r in result:
                var_name, value = r.split(": ")[1].split(", ")
                print(var_name, value)
                # TODO: that isn't necessary most of the time
                var = var_name.split("%")[0]
                ref_value = {var: value}
                ref_vals.update(ref_value)

            ref_result = {path: ref_vals}
            self.ref_values.update(ref_result)

        if 'invalid' in path:
            if "The trace is VALID" in output:
                return True
            elif "The trace is INVALID" in output:
                return False
            else:
                return True
        else:
            if ("The trace is VALID" in output):
                eq_values = []

                for r in result:
                    var_name, value = r.split(": ")[1].split(", ")
                    # TODO: that isn't necessary most of the time
                    var = var_name.split("%")[0]
                    prev_value = self.ref_values[path][var]
                    eq_values.append(prev_value == value)

                # logger.info(F'Eq Values are {eq_values}')
                res_equal = all(eq_values)
                if res_equal:
                    return True
            elif "The trace is INVALID" in output:
                return False
            else:
                return False