/* Adapted from https://github.com/smartbugs/smartbugs/blob/master/dataset/reentrancy/etherbank.sol,
 * https://github.com/seresistvanandras/EthBench/blob/master/Benchmark/Simple/reentrant.sol
 * Vulnerable_at_lines: 24
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
		/* Reentrancy due to missing Check-Effect-Interactions
		 * pattern, i.e., an external call is performed before
		 * a state update
		 */
		msg.sender.call.value(amountToWithdraw);
		userBalances[msg.sender] = 0;
	}
}

// Main contract encoding the harness function as a constructor
 contract _MAIN_ {
    EtherBank bank;

	uint counter;
    uint $reenter;

    function declare_property(bool property) public {}

    constructor () public {
        bank = new EtherBank();

        /* Setting up the environment, initial contract balances
         * in terms of both EtherBank tokens and ETH
         */
        uint old_balance; uint old_wallet_balance;
        uint new_balance; uint new_wallet_balance;
        old_wallet_balance = bank.getBalance(address(this));
        old_balance = address(this).balance + old_wallet_balance;

        // Setting symbolic vars to concrete values in test cases
        // <<< $value >>>
        // <<< $reenter >>>

        /* Sending a successfull transaction depositing
         * a positive amount of ETH
         */
        uint $value; __assume__($value > 0 && $value < 100);
        bank.addToBalance.value($value)();

        /* Assuming this contract may or may not perform
         * a reentrant callback
         */
        __assume__($reenter == 0 || $reenter == 1);

        // Withdrawing deposited ETH
		bank.withdrawBalance();

        // Recording resulting allocations
        new_wallet_balance = bank.getBalance(address(this));
        new_balance = address(this).balance + new_wallet_balance;

        /* Checking the property:
         * 'User's sum of balances (EtherBank and ETH) should remain constant'
         */
        declare_property(old_balance == new_balance);
    }

	function () external {
        /* Performing one reentrant call to EtherBank;
         * If successful, this allows this contract to withdraw twice
         * the amount he is entitled to
         */

		if ($reenter == 1 && counter < 1) {
			counter++;
			bank.withdrawBalance();
		}
	}
}