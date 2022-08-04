/* Adapted from https://github.com/smartbugs/smartbugs/blob/master/dataset/reentrancy/etherbank.sol,
 * https://github.com/seresistvanandras/EthBench/blob/master/Benchmark/Simple/reentrant.sol
 * Vulnerable_at_lines: 20
*/

contract EtherBank{
    mapping (address => uint) userBalances;

	function addToBalance() public payable {
		userBalances[msg.sender] += msg.value;
	}

	function getBalance(address user) external view returns (uint balance) {
        return userBalances[user];
	}

	function withdrawBalance() public {
		uint amountToWithdraw;
		amountToWithdraw = userBalances[msg.sender];
		msg.sender.call.value(amountToWithdraw);
		userBalances[msg.sender] = 0;
	}
}