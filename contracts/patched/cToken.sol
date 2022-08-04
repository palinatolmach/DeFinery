/* Adapted from https://github.com/dapphub/ds-token/blob/master/src/token.sol,
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 */
contract WETH {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    function getBalanceOf(address usr) external returns (uint256 balance) {
        return balanceOf[usr];
    }
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
    }
    function withdraw(uint256 wad) public {
        require(balanceOf[msg.sender] >= wad);
        balanceOf[msg.sender] -= wad;
    }
    function totalSupply() public view returns (uint256 tS) {
        return address(this).balance;
    }
    function approve(address guy, uint256 wad) public returns (bool appr) {
        allowance[msg.sender][guy] = wad;
        return true;
    }
    function transfer(address dst, uint256 wad) public returns (bool success) {
        return transferFrom(msg.sender, dst, wad);
    }
    function transferFrom(address src, address dst, uint256 wad)
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
    // A supplementary function for setting execution environment
    function setBalanceOf(address usr, uint256 amount) external {
        balanceOf[usr] = amount;
    }
}
// Adapted from https://etherscan.io/address/0xff20817765cb7f73d4bde2e66e067e58d11095c2#code
contract AMP {
    uint256 _totalSupply;
    mapping(address => uint256) public _balances;
    mapping(address => mapping(address => uint256)) public _allowances;
    constructor() public {
        _totalSupply = 1000;
    }
    function totalSupply() external view returns (uint256 tS) {
        return _totalSupply;
    }
    function balanceOf(address _tokenHolder)
        external
        view
        returns (uint256 balance)
    {
        return _balances[_tokenHolder];
    }
    function approve(address guy, uint256 wad) public returns (bool appr) {
        _allowances[msg.sender][guy] = wad;
        return true;
    }
    function transfer(address dst, uint256 wad) public returns (bool success) {
        return transferFrom(msg.sender, dst, wad);
    }
    function transferFrom(address src, address dst, uint256 wad)
        public
        returns (bool success)
    {
        require(_balances[src] >= wad);
        if (src != msg.sender && _allowances[src][msg.sender] != 99999999) {
            require(_allowances[src][msg.sender] >= wad);
            _allowances[src][msg.sender] -= wad;
        }
        _balances[src] -= wad;
        _balances[dst] += wad;
        // An ERC777 post-call hook enabling reentrancy
        User(dst).tokensReceived(dst, wad);
        return true;
    }
    // A supplementary function for setting execution environment
    function setBalanceOf(address usr, uint256 amount) external {
        _balances[usr] = amount;
    }
}
/* Adapted from https://github.com/CreamFi/compound-protocol/blob/cce8c8836d21ac307df918a4ca46f0b83dbe2757/contracts/CEther.sol,
 * https://github.com/CreamFi/compound-protocol/blob/0e079dd9e1d6fdf974ab429a17b955dedf677315/contracts/CToken.sol
 */
contract crETH {
    uint256 totalSupply_crETH;
    mapping(address => uint256) accountTokens_crETH;
    mapping(address => uint256) borrowBalance;
    bool locked;
    WETH eth;
    AMP amp;
    cToken crAmp;
    modifier noReentrancy() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }
    constructor(address _weth, address _amp) public {
        eth = WETH(_weth);
        amp = AMP(_amp);
    }
    function getBalances(address _user)
        external
        view
        returns (uint256 balance)
    {
        return accountTokens_crETH[_user];
    }
    function getBorrowBalance(address _user)
        external
        view
        returns (uint256 balance)
    {
        return borrowBalance[_user];
    }
    function mintFresh(address minter, uint256 mintAmount)
        external
        returns (uint256 retMintAmount)
    {
        uint256 balancesEth;
        balancesEth = eth.getBalanceOf(minter);
        if (balancesEth >= mintAmount) {
            uint256 exchangeRateMantissa = 1;
            eth.transferFrom(minter, address(this), mintAmount);
            uint256 mintTokens = mintAmount / exchangeRateMantissa;
            /* We write previously calculated values into storage */
            totalSupply_crETH += mintTokens;
            accountTokens_crETH[minter] += mintTokens;
            return mintAmount;
        }
    }
    function borrowFresh(address borrower, uint256 borrowAmount)
        external
        returns (uint256 retBorrow)
    {
        /* Fail if borrow not allowed */
        uint256 allowed;
        uint256 collateralFactor = 75;
        uint256 exchangeRate = 1;
        uint256 oraclePrice = 1;
        uint256 tokensToDenom = collateralFactor * exchangeRate * oraclePrice;
        // For simplicity, we assume that crAMP and crETH have equal value
        uint256 sumCollateral = (tokensToDenom *
            accountTokens_crETH[borrower]) /
            100;
        uint256 tokens_crAMP;
        tokens_crAMP = crAmp.getBalances(borrower);
        sumCollateral += (tokensToDenom * tokens_crAMP) / 100;
        uint256 sumBorrowPlusEffects = borrowBalance[borrower];
        uint256 borrows_crAMP;
        borrows_crAMP = crAmp.getBorrowBalance(borrower);
        sumBorrowPlusEffects += borrows_crAMP;
        sumBorrowPlusEffects += oraclePrice * borrowAmount;
        uint256 balanceEth;
        balanceEth = eth.getBalanceOf(address(this));
        if (
            sumCollateral > sumBorrowPlusEffects && balanceEth >= borrowAmount
        ) {
            eth.transferFrom(address(this), borrower, borrowAmount);
            /* We write the previously calculated values into storage */
            borrowBalance[borrower] += borrowAmount;
            return 0;
        } else {
            return 1;
        }
    }
    function setCreamAMP(address _crAMP) external {
        crAmp = cToken(_crAMP);
    }
}
/* Adapted from https://github.com/CreamFi/compound-protocol/blob/0e079dd9e1d6fdf974ab429a17b955dedf677315/contracts/CToken.sol
 * Vulnerable_at_lines: 270
 */
contract cToken {
    uint256 totalSupply;
    mapping(address => uint256) accountTokens;
    mapping(address => uint256) borrowBalance;
    bool locked;
    WETH eth;
    AMP amp;
    crETH crEth;
    modifier noReentrancy() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }
    constructor(address _weth, address _amp) public {
        eth = WETH(_weth);
        amp = AMP(_amp);
    }
    function getBalances(address _user)
        external
        view
        returns (uint256 balance)
    {
        return accountTokens[_user];
    }
    function getBorrowBalance(address _user)
        external
        view
        returns (uint256 balance)
    {
        return borrowBalance[_user];
    }
    function borrowFresh(address borrower, uint256 borrowAmount)
        external
        noReentrancy
        returns (uint256 retBorrow)
    {
        /* Fail if borrow not allowed */
        uint256 allowed;
        uint256 collateralFactor;
        collateralFactor = 75;
        uint256 exchangeRate;
        exchangeRate = 1;
        uint256 oraclePrice;
        oraclePrice = 1;
        uint256 tokensToDenom;
        tokensToDenom = collateralFactor * exchangeRate * oraclePrice;
        // For simplicity, we assume that crAMP and crETH have equal value
        uint256 tokens_crETH;
        tokens_crETH = crEth.getBalances(borrower);
        uint256 sumCollateral = (tokensToDenom * tokens_crETH) / 100;
        sumCollateral += (tokensToDenom * accountTokens[borrower]) / 100;
        uint256 sumBorrowPlusEffects = borrowBalance[borrower];
        uint256 borrows_crETH;
        borrows_crETH = crEth.getBorrowBalance(borrower);
        sumBorrowPlusEffects += borrows_crETH;
        sumBorrowPlusEffects += oraclePrice * borrowAmount;
        // These are safe, as the underflow condition is checked first
        uint256 balances;
        balances = amp.balanceOf(address(this));
        if (sumCollateral > sumBorrowPlusEffects && balances >= borrowAmount) {
            borrowBalance[borrower] += borrowAmount;
            amp.transferFrom(address(this), borrower, borrowAmount);
            return 0;
        } else {
            return 1;
        }
    }
    function setCreamETH(address _crETH) external {
        crEth = crETH(_crETH);
    }
}
/* A supplementary User smart contract
 * representing a DeFi protocol user
 */
contract User {
    cToken amp;
    crETH eth;
    WETH weth;
    uint256 reenter;
    constructor(uint256 _reenter) public {
        reenter = _reenter;
    }
    function setCream_AMP(address _crAmp) public {
        amp = cToken(_crAmp);
    }
    function setCream_ETH(address _crEth) public {
        eth = crETH(_crEth);
    }
    function setWETH(address _weth) public {
        weth = WETH(_weth);
    }
    function approveWETH(address spender, uint256 amount) public {
        WETH(weth).approve(spender, amount);
    }
    function crETH_mintFresh(uint256 amount) public {
        eth.mintFresh(address(this), amount);
    }
    function crAMP_borrowFresh(uint256 amount) public {
        amp.borrowFresh(address(this), amount);
    }
    function crETH_borrowFresh(uint256 amount) public {
        eth.borrowFresh(address(this), amount);
    }
    function tokensReceived(address borrower, uint256 amount) public {
        /* Performing a reentrant call to crETH---another CREAM contract;
         * If successful, this allows user to borrow more tokens than
         * he's allowed to by protocol rules, meaning that he has no
         * incentive to return the funds
         */
        if (reenter == 1) {
            eth.borrowFresh(address(this), amount);
        }
    }
} // Main contract encoding the harness function as a constructor
contract _MAIN_ {
    function declare_property(bool property) public {}

    mapping(address=>uint) public init;
    mapping(address=>uint) public res;

    uint $reenter;

    constructor() public {
        cToken _crAMP;
        crETH _crETH;
        User user;
        WETH ethImpl;
        AMP ampImpl;

        /* Assuming the user may or may not perform
         * a reentrant callback
         */
        __assume__($reenter == 0 || $reenter == 1);

        // Setting symbolic vars to concrete values in test cases:
        // <<< $reenter >>>

        // Setting up the environment, initial contract balances
        user = new User($reenter);
        ethImpl = new WETH();
        ampImpl = new AMP();

        address eth; address amp;
        eth = address(ethImpl);
        amp = address(ampImpl);

        _crAMP = new cToken(eth, amp);
        _crETH = new crETH(eth, amp);

        address crAMP_addr; address crETH_addr;
        crAMP_addr = address(_crAMP);
        crETH_addr = address(_crETH);

        address usr;
        usr = address(user);

        user.setCream_AMP(crAMP_addr);
        user.setCream_ETH(crETH_addr);
        user.setWETH(address(ethImpl));
        _crAMP.setCreamETH(crETH_addr);
        _crETH.setCreamAMP(crAMP_addr);

        ethImpl.setBalanceOf(usr, 100);
        ethImpl.setBalanceOf(crETH_addr, 1000);
        ampImpl.setBalanceOf(crAMP_addr, 1000);

        /* Recording initial allocations of participating
         * contracts (User and CREAM) for checking a financial property;
         * CREAM includes to contracts: crETH and crAMP (cToken),
         * so we sum the allocations of these two contracts
         */
        init[usr] = ampImpl.balanceOf(usr);
        init[usr] += ethImpl.getBalanceOf(usr);
        init[usr] += _crAMP.getBalances(usr);
        init[usr] += _crETH.getBalances(usr);

        init[crETH_addr] = ampImpl.balanceOf(crAMP_addr);
        init[crETH_addr] += ethImpl.getBalanceOf(crETH_addr);
        init[crETH_addr] += _crAMP.getBalances(crAMP_addr);
        init[crETH_addr] += _crETH.getBalances(crETH_addr);

        /* Sending a transaction from User providing
         * infinite approval to crETH to transfer tokens
         * on User's behalf
         */
        user.approveWETH(crETH_addr, 99999999);
        /* Sending a transaction from User that provides
         * ETH for crETH in return
         */
        user.crETH_mintFresh(100);
        /* Sending a transaction from User that borrows
         * a large part of amount allowed by protocol rules
         */
        uint val_1; val_1 = 100 * 3 / 5;
        user.crAMP_borrowFresh(val_1);

        // Recording resulting allocations
        res[usr] = ampImpl.balanceOf(usr);
        res[usr] += ethImpl.getBalanceOf(usr);
        res[usr] += _crAMP.getBalances(usr);
        res[usr] += _crETH.getBalances(usr);

        res[crETH_addr] = ampImpl.balanceOf(crAMP_addr);
        res[crETH_addr] += ethImpl.getBalanceOf(crETH_addr);
        res[crETH_addr] += _crAMP.getBalances(crAMP_addr);
        res[crETH_addr] += _crETH.getBalances(crETH_addr);

        /* Checking the property:
         * CREAM protocol balance can't decrease
         * (since the user should only borrow less than he deposited as collateral)
         */
        declare_property(res[crETH_addr] >= init[crETH_addr]);
    }
}
