/* Adapted from https://github.com/OokiTrade/contractsV2/blob/bf95cbe373d4e972da5e93daf8ddb0f3886e78a1/contracts/connectors/loantoken/LoanTokenLogicStandard.sol
 * Vulnerable_at_lines: 69 or 84
 */

contract iToken {
    address owner;
    mapping(address=>uint256) balances;
    mapping (address => mapping (address => uint))  public  allowed;

    constructor(
        address _newOwner)
        public
    {
        owner = _newOwner;
    }

    function getBalances(address _user) view external returns (uint256 balance) {
        balance = balances[_user];
        return balance;
    }

    function approve(address _to, uint256 _value)
        public returns (bool approved)
    {
        allowed[msg.sender][_to] = _value;
        return true;
    }

    function transferTo(
        address _to,
        uint256 _value)
        external
        returns (bool res)
    {
        res = _internalTransferFrom(
            msg.sender,
            _to,
            _value,
            99999999
        );
        return res;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value)
        external
        returns (bool res)
    {
        res = _internalTransferFrom(
            _from,
            _to,
            _value,
            allowed[msg.sender][_to]
        );
        return res;
    }

    function _internalTransferFrom(
        address _from,
        address _to,
        uint _value,
        uint _allowanceAmount
        )
        internal
        returns (bool success)
    {
        if (_allowanceAmount != 99999999) {
            allowed[_from][msg.sender] = _allowanceAmount - _value;
        }

        require(_to != address(0), "15");

        uint256 _balancesFrom = balances[_from];
        uint256 _balancesTo = balances[_to];

        require(_balancesFrom >= _value);
        uint256 _balancesFromNew = _balancesFrom - _value;
        balances[_from] = _balancesFromNew;

        uint256 _balancesToNew = _balancesTo + _value;
        balances[_to] = _balancesToNew;

        return true;
    }

    // A supplementary function for setting execution environment
    function setBalances(address _user, uint amount) external {
        balances[_user] = amount;
    }
}

/* A supplementary User smart contract
 * representing a DeFi protocol user
 */
contract User {
    iToken token;
    address main;

    function setToken(address _token, address _main) public {
        token = iToken(_token);
        main = _main;
    }

    function transferTo(address _to, uint _value) public {
        token.transferTo(_to, _value);
    }
}

// Main contract encoding the harness function as a constructor
contract _MAIN_ {
    function declare_property(bool property) public {}

    mapping(address=>uint) public init;
    mapping(address=>uint) public res;

    iToken token;
    User user;

    uint $var_0;
    uint $to_addr;

    /* Values of state variables prefixed with testVal
     * are being automatically checked when executing
     * test cases (in addition to validity checking
     * of the execution trace)
     */
    uint testVal_0;
    uint testVal_1;

    constructor() public {
        user = new User();
        token = new iToken(address(this));

        // Setting up the environment, initial contract balances
        token.setBalances(address(user), 1000);
        token.setBalances(address(this), 1000);
        user.setToken(address(token), address(this));

        /* Recording initial allocations of participating
         * contracts (Main, User, and iToken) for checking a financial property;
         */
        init[address(this)] = token.getBalances(address(this));
        init[address(user)] = token.getBalances(address(user));
        init[address(token)] = token.getBalances(address(token));

        // Setting symbolic vars to concrete values in test cases
        // <<< $to_addr >>>
        // <<< $var_0 >>>

        address _to;
        /* Assuming User can transfer tokens to either of 4 addresses:
         * Main (this contract), User (himself), iToken, or address(0)
         */
        __assume__($to_addr == 0 || $to_addr == 1 || $to_addr == 2 || $to_addr == 3);

        if ($to_addr == 0) {
            _to = address(this);
        } else if ($to_addr == 1) {
            _to = address(user);
        }
        else if ($to_addr == 2) {
            _to = address(token);
        } else if ($to_addr == 3) {
            _to = address(0);
        }

        __assume__($var_0 > 0);
        // Transferring positive number of tokens from User to another address
	user.transferTo(_to, $var_0);

        // Recording resulting allocations of participating contracts
        res[address(this)] = token.getBalances(address(this));
        res[address(user)] = token.getBalances(address(user));
        res[address(token)] = token.getBalances(address(token));

        /* Recording control variable values for more accurate
         * test case results (optional)
         */
        testVal_0 = res[address(this)];
        testVal_1 = res[address(user)];

        /* Checking the property:
         * 'Constant sum of all users' balances is preserved by a transfer()'
         */
        declare_property((init[address(user)] + init[address(this)] + init[address(token)])
                            == (res[address(user)] + res[address(this)] + res[address(token)]));
    }
}
