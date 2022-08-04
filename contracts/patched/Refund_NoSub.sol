/*
 * Adapted from https://smartcontractsecurity.github.io/SWC-registry/docs/SWC-105#wallet-02-refund-nosubsol,
 * Adapted from https://github.com/smartbugs/smartbugs/blob/master/dataset/access_control/wallet_02_refund_nosub.sol,
 * https://smartcontractsecurity.github.io/SWC-registry/docs/SWC-105#wallet-02-refund-nosubsol
 * Vulnerable_at_lines: 40
 */
/* User can add pay in and withdraw Ether.
    Unfortunately the developer forgot set the user's balance to 0 when refund() is called.
    An attacker can pay in a small amount of Ether and call refund() repeatedly to empty the contract.
 */
contract Refund_NoSub {
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
        require(amount <= balances[msg.sender]);
        msg.sender.call.value(amount);
        balances[msg.sender] -= amount;
    }
    function refund() public {
        // <yes> <report> ACCESS_CONTROL; Missing 'balances[msg.sender] = 0;'
        msg.sender.call.value(balances[msg.sender]);
        balances[msg.sender] = 0;
    }
    // In an emergency the owner can migrate  allfunds to a different address.
    function migrateTo(address payable to) public {
        require(creator == msg.sender);
        to.transfer(address(this).balance);
    }
}
/* A supplementary User smart contract
 * representing a DeFi protocol user
 */
contract User {
    Refund_NoSub wallet;
    constructor(address _wallet) public {
        wallet = Refund_NoSub(_wallet);
    }
    function deposit(uint256 _value) public payable {
        wallet.deposit.value(_value)();
    }
    function withdraw(uint256 _amount) public {
        wallet.withdraw(_amount);
    }
    function refund() public {
        wallet.refund();
    }
}
 contract _MAIN_ {
    Refund_NoSub wallet;
    User user;

    function declare_property(bool property) public {}

    uint $from_deposit;
    uint $from_refund;
    uint $value;

    constructor () public {
        // Setting up the environment, initial contract balances
        wallet = new Refund_NoSub();
        user = new User(address(wallet));
        address(user).call.value(100);
        address(wallet).call.value(100);

        // Setting symbolic vars to concrete values in test cases:
        // <<< $value >>>
        // <<< $from_deposit >>>
        // <<< $from_refund >>>

        uint old_this_balance; uint old_wallet_balance;
        uint old_user_balance; uint old_usr_balance;
        uint new_this_balance; uint new_wallet_balance;
        uint new_user_balance; uint new_usr_balance;
        uint pre_balance; uint post_balance;
        uint balance_returned;

        /* Recording initial allocations and sums of balances
         * (Refund_NoSub and ETH) of participating contracts (Main, User)
         * for checking a financial property;
         */
        old_wallet_balance = wallet.getBalances(address(this));
        old_usr_balance = wallet.getBalances(address(user));

        old_this_balance = address(this).balance + old_wallet_balance;
        old_user_balance = address(user).balance + old_usr_balance;

        /* Assuming that calls sending ETH are successful, i.e., do
         * not exceed contract balances
         */
        __assume__($value > 0 && $value < 90);
        __assume__(address(this).balance >= $value && address(this).balance <= 10000);
        __assume__(address(user).balance >= $value && address(user).balance <= 10000);

        /* Assuming deposit() and refund() can each be called
         * by (1) User or (2) Main (this contract)
         */
        __assume__($from_deposit == 0 || $from_deposit == 1);
        __assume__($from_refund == 0 || $from_refund == 1);

        if ($from_deposit == 0) {
            wallet.deposit.value($value)();
        } else {
            user.deposit($value);
        }

        // Recording the number of tokens obtained by a caller via refund()
        if ($from_refund == 0) {
            pre_balance = address(this).balance;
            wallet.refund();
            post_balance = address(this).balance;
            balance_returned = post_balance - pre_balance;
        } else {
            pre_balance = address(user).balance;
            user.refund();
            post_balance = address(user).balance;
            balance_returned = post_balance - pre_balance;
        }

        // Recording resulting allocations, sums of balances
        new_wallet_balance = wallet.getBalances(address(this));
        new_usr_balance = wallet.getBalances(address(user));
        new_this_balance = address(this).balance + new_wallet_balance;
        new_user_balance = address(user).balance + new_usr_balance;

        /* Checking the property:
         * Sum of users' balances (Refund_NoSub and ETH) is constant, unless
         * a refund is called by a legitimate user who deposited ETH before---in
         * this case, the user should receive a refund
         */
        declare_property((old_this_balance == new_this_balance && old_user_balance == new_user_balance)
            && ((balance_returned == $value) || ($from_deposit != $from_refund)));
    }
}
