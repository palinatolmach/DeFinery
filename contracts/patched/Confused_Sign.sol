/* Adapted from https://github.com/smartbugs/smartbugs/blob/master/dataset/access_control/wallet_02_refund_nosub.sol,
 * https://smartcontractsecurity.github.io/SWC-registry/docs/SWC-105#wallet-02-refund-nosubsol
 * Vulnerable_at_lines: 25
*/
contract Confused_Sign {
    address creator;
    mapping(address => uint256) balances;
    constructor() public {
        creator = msg.sender;
    }
    function getBalances(address depositor)
        public
        view
        returns (uint256 balance)
    {
        return balances[depositor];
    }
    function deposit() public payable {
        require(balances[msg.sender] + msg.value > balances[msg.sender]);
        balances[msg.sender] += msg.value;
    }
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        msg.sender.call.value(amount);
        balances[msg.sender] -= amount;
    }
    function migrateTo(address payable to) public {
        require(creator == msg.sender);
        to.transfer(address(this).balance);
    }
}
 contract _MAIN_ {
    Confused_Sign wallet;
    uint $value;
    uint $withdraw_amt;

    function declare_property(bool property) public {}

    constructor () public {
        wallet = new Confused_Sign();

        // Setting up initial contract balances
        __assume__(address(this).balance == 10000);
        address(wallet).call.value(3000);

        // Setting symbolic vars to concrete values in test cases:
        // <<< $value >>>
        // <<< $withdraw_amt >>>

        uint before_deposit; uint after_deposit; uint deposited;
        uint after_withdrawal; uint withdrawn;

        // Checking this contract's balance before deposit()
        before_deposit = address(this).balance;

        /* Sending a successful transaction calling .deposit()
         * with positive msg.value
         */
        __assume__($value > 0 && $value < 7000);
        wallet.deposit.value($value)();

        /* Checking this contract's balance after deposit()
         * to check how much the user has deposited
         */
        after_deposit = address(this).balance;

        /* Trying to (successfully) withdraw a positive amount from the wallet */
        __assume__($withdraw_amt > 0 && $withdraw_amt < address(wallet).balance);
        wallet.withdraw($withdraw_amt);

        /* Checking this contract's balance after withdraw()
         * to check how much the user has withdrawn
         */
        after_withdrawal = address(this).balance;

        deposited = before_deposit - after_deposit;
        withdrawn = after_withdrawal - after_deposit;

        /* Checking the property:
         * User can’t withdraw more than he deposited AND
         * he can successfully get a refund if he deposited something
         */
        declare_property(withdrawn <= deposited && (withdrawn > 0 || !($value >= $withdraw_amt)));
    }
}
