// Adapted from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol

interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    function _transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/* Adapted from https://etherscan.io/address/0xe7f445b93eb9cdabfe76541cc43ff8de930a58e6#code
 * Vulnerable_at_lines: 147
 */

contract xForce {
    mapping (address => uint)                       public  balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;
    uint totalSupply;
    IERC20 public force;

    constructor(address _underlying) public {
        force = IERC20(_underlying);
        totalSupply = 1500;
    }

    function getBalanceOf(address usr) external returns (uint balance) {
        return balanceOf[usr];
    }

    function getTotalSupply() public view returns (uint tS) {
        return totalSupply;
    }

    function approve(address guy, uint wad) public returns (bool appr) {
        allowance[msg.sender][guy] = wad;
        return true;
    }

    function transfer(address dst, uint wad) public returns (bool success) {
        success = transferFrom(msg.sender, dst, wad);
        return success;
    }

    function transferFrom(address src, address dst, uint wad)
        public
        returns (bool success)
    {
        require(balanceOf[src] >= wad);
        if (src != msg.sender && allowance[src][msg.sender] != 99999999) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        return true;
    }


    function deposit(uint256 amount) external {
        // Gets the amount of Force locked in the contract
        uint256 totalForce;
        totalForce = force.balanceOf(address(this));
        // Gets the amount of xForce in existence
        uint256 totalShares = totalSupply;
        // If no xForce exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalForce == 0) {
            _mint(msg.sender, amount);
        }
        // Calculate and mint the amount of xForce the Force is worth. The ratio will change overtime, as xForce is burned/minted and Force deposited + gained from fees / withdrawn.
        else {
            uint256 what = (amount * totalShares) / totalForce;
            _mint(msg.sender, what);
        }
        // Lock the Force in the contract; Missing check on return value of transferFrom();
        bool res;
        res = force.transferFrom(msg.sender, address(this), amount);
    }

    function _mint(address account, uint amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        totalSupply += amount;
        balanceOf[account] += amount;
    }

    function withdraw(uint256 numberOfShares) external {
        // Gets the amount of xForce in existence
        uint256 totalShares = totalSupply;
        // Calculates the amount of Force the xForce is worth
        uint forceBalance;
        forceBalance = force.balanceOf(address(this));
        uint256 what;
        what = (numberOfShares * forceBalance) / totalShares;
        _burn(msg.sender, numberOfShares);
        force._transfer(msg.sender, what);
    }

    function _burn(address user, uint amount) internal {
        require(balanceOf[user] >= amount);
        totalSupply -= amount;
        balanceOf[user] -= amount;
    }

    // A supplementary function for setting execution environment
    function setBalances(address _user, uint amount) external {
        balanceOf[_user] = amount;
    }
}

// Adapted from https://etherscan.io/address/0x6807d7f7df53b7739f6438eabd40ab8c262c0aa8#code
contract Force {
    mapping (address => uint) public  balances;
    mapping (address => mapping (address => uint))  public  allowed;
    uint totalSupply;
    bool public transfersEnabled;
    address payable controller;

    constructor() public {
        totalSupply = 1500;
        transfersEnabled = true;
    }

    function getBalanceOf(address usr) external returns (uint balance) {
        return balances[usr];
    }

    function getTotalSupply() public view returns (uint tS) {
        return totalSupply;
    }

    function approve(address _owner, address _spender, uint256 _amount) public returns (bool success) {
        require(transfersEnabled);

        allowed[_owner][_spender] = _amount;
        return true;
    }

    function _transfer(address _to, uint256 _amount) public returns (bool success) {
        require(transfersEnabled);
        success = doTransfer(msg.sender, _to, _amount);
        return success;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {

        // The controller of this contract can move tokens around at will,
        //  this is important to recognize! Confirm that you trust the
        //  controller of this contract, which in most situations should be
        //  another open source smart contract or 0x0
        if (msg.sender != controller) {
            require(transfersEnabled);

            if (allowed[_from][_to] < _amount) {
                return false;
            }
            allowed[_from][_to] -= _amount;
        }
        success = doTransfer(_from, _to, _amount);
        return success;
    }

    function doTransfer(address _from, address _to, uint _amount) internal returns (bool success) {
        if (_amount == 0) {
            return true;
        }
        require((_to != address(0)) && (_to != address(this)));
        // If the amount being transfered is more than the balance of the
        //  account the transfer returns false
        uint previousBalanceFrom;
        previousBalanceFrom = balanceOfAt(_from, 0);
        if (previousBalanceFrom < _amount) {
            return false;
        }
        // Alerts the token controller of the transfer
        // First update the balance array with the new value for the address
        //  sending the tokens
        updateValueAtNow(_from, previousBalanceFrom - _amount);
        // Then update the balance array with the new value for the address
        //  receiving the tokens
        uint previousBalanceTo;
        previousBalanceTo = balanceOfAt(_to, 0);
        require(previousBalanceTo + _amount >= previousBalanceTo); // Check for overflow
        updateValueAtNow(_to, previousBalanceTo + _amount);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        balance = balanceOfAt(_owner, 0);
        return balance;
    }

    function balanceOfAt(address _owner, uint _block) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function updateValueAtNow(address _owner, uint _value) public returns (uint256 balance) {
        balances[_owner] = _value;
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

    Force force;
    xForce xforce;

    function setForce(address _force, address _xforce) public {
        force = Force(_force);
        xforce = xForce(_xforce);
    }

    function Force_approve(uint amount) public {
      force.approve(address(this), address(xforce), amount);
    }

    function xForce_deposit(uint amount) public {
      xforce.deposit(amount);
    }

    function xForce_withdraw(uint amount) public {
      xforce.withdraw(amount);
    }
}

// Main contract encoding the harness function as a constructor
contract _MAIN_ {
    function declare_property(bool property) public {}

    Force force;
    xForce xforce;
    User user;

    uint $var_1; uint $var_0;

    constructor() public {
        // Setting up the environment, initial contract balances
        user = new User();
        force = new Force();
        xforce = new xForce(address(force));
        user.setForce(address(force), address(xforce));

        force.setBalances(address(xforce), 1000);
        force.setBalances(address(user), 100);
        xforce.setBalances(address(user), 0);

        // Setting symbolic vars to concrete values in test cases
        // <<< $var_0 >>>
        // <<< $var_1 >>>

        // Recording initial user allocations (Force and xForce)
        uint initUserxForce; uint initUserForce;
        initUserxForce = xforce.getBalanceOf(address(user));
        initUserForce = force.balanceOf(address(user));

        /* Assuming User approves a non-negative number ($var0)
         * of Force tokens he has for transfer to xForce;
         * He, then, "deposits" a positive number of Force tokens he has
         * ($var1) in exchange for xForce. However, depending on the
         * value of $var0, the transfer of Force may or may not be successful
         * (in the latter case, the user will receive xForce for free)
         */
        __assume__($var_1 > 0 && $var_1 < 100);
        __assume__($var_0 >= 0 && $var_0 <= $var_1);
		user.Force_approve($var_0);
		user.xForce_deposit($var_1);

        // Recording initial user allocations (Force and xForce)
        uint resUserxForce; resUserxForce = xforce.getBalanceOf(address(user));
        uint resUserForce; resUserForce = force.getBalanceOf(address(user));

        /* Checking the property:
         * 'User didn’t receive xForce if he didn’t provide any Force'
         */
        declare_property((resUserForce < initUserForce) || !(resUserxForce > initUserxForce));
    }
}
