/*
 * Adapted from https://github.com/trailofbits/not-so-smart-contracts/blob/master/unprotected_function/Unprotected.sol,
 * https://github.com/smartbugs/smartbugs/blob/master/dataset/access_control/unprotected0.sol
 * Vulnerable_at_lines: 25
 */
contract Unprotected {
    address private owner;
    mapping(address => uint256) balances;
    modifier onlyowner {
        require(msg.sender == owner);
        _;
    }
    constructor() public {
        owner = msg.sender;
    }
    // <yes> <report> ACCESS_CONTROL
    // Missing an (owner == msg.sender) check
    function changeOwner(address _newOwner) public {
        require(owner == msg.sender);
        owner = _newOwner;
    }
    function deposit() public payable {
        require(balances[msg.sender] + msg.value > balances[msg.sender]);
        balances[msg.sender] += msg.value;
    }
    function migrateTo(address to) public {
        require(owner == msg.sender);
        to.call.value(address(this).balance);
    }
    function getOwner() public view returns (address _owner) {
        return owner;
    }
}
/* A supplementary User smart contract
 * representing a DeFi protocol user
 */
contract User {
    Unprotected wallet;
    constructor(address _wallet) public payable {
        wallet = Unprotected(_wallet);
    }
    function deposit(uint256 _value) public {
        wallet.deposit.value(_value)();
    }
    function changeOwner(address _to) public {
        wallet.changeOwner(_to);
    }
    function migrateTo(address _to) public {
        wallet.migrateTo(_to);
    }
} // Main contract encoding the harness function as a constructor
 contract _MAIN_ {
    Unprotected wallet;
    User user; User anotherUser;
    uint $from_change; uint $to_change;

    function declare_property(bool property) public {}

    /* 'is_trusted()' is a supplementary function provided in DeFinery
     * to facilitate checking access-control properties;
     * a address is either a smart contract deployer or has appeared as a
     * parameter in a function call made by a trusted address;
     */
    function is_trusted(address usr) public returns (bool trusted) {}

    constructor () public {
        // Setting up the environment
        wallet = new Unprotected();
        user = new User(address(wallet));
        anotherUser = new User(address(wallet));

        // Recording an initial owner for checking access-control property
        address oldOwner; oldOwner = wallet.getOwner();

        // Setting symbolic vars to concrete values in test cases:
        // <<< $from_change >>>
        // <<< $to_change >>>

        /* Assuming changeOwner() function can be called by one of three
         * participating contracts: Main (this contract, current owner), User,
         * or another User; the newOwner can be any of these 3 contracts too.
         */
        __assume__($from_change == 0 || $from_change == 1 || $from_change == 2);
        __assume__($to_change == 0 || $to_change == 1 || $to_change == 2);

        if ($from_change == 0) {
            if ($to_change == 0) {
                wallet.changeOwner(address(this));
            } else if ($to_change == 1) {
                wallet.changeOwner(address(user));
            } else {
                wallet.changeOwner(address(anotherUser));
            }
        } else {
            if ($to_change == 0) {
                user.changeOwner(address(this));
            } else if ($to_change == 1) {
                user.changeOwner(address(user));
            } else {
                user.changeOwner(address(anotherUser));
            }
        }

        // Recording a resulting owner for checking access-control property
        address newOwner; newOwner = wallet.getOwner();

        /* Checking the property:
         * Owner can only be changed to a trusted address,
         * in other words---it can only be changed by a current owner.
         */
        bool trusted; trusted = is_trusted(newOwner);
        declare_property((oldOwner == newOwner) || trusted);
    }
}
