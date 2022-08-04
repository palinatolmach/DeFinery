/* Adapted from https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#code
 */

contract WETH {
    mapping (address => uint) public  balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;

    function getBalanceOf(address usr) external returns (uint balance) {
        return balanceOf[usr];
    }

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
    }
    function withdraw(uint wad) public {
        require(balanceOf[msg.sender] >= wad);
        balanceOf[msg.sender] -= wad;
    }

    function totalSupply() public view returns (uint tS) {
        return address(this).balance;
    }

    function approve(address guy, uint wad) public returns (bool appr) {
        allowance[msg.sender][guy] = wad;
        return true;
    }

    function transfer(address dst, uint wad) public returns (bool success) {
        return transferFrom(msg.sender, dst, wad);
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
}

// Adapted from https://etherscan.io/address/0xff20817765cb7f73d4bde2e66e067e58d11095c2#code
contract AMP {
    uint _totalSupply;
    mapping(address => uint) public _balances;
    mapping (address => mapping (address => uint)) public _allowances;

    constructor() public {
        _totalSupply = 1000;
     }

    function totalSupply() external view returns (uint tS) {
        return _totalSupply;
    }

    function balanceOf(address _tokenHolder) external view returns (uint balance) {
        return _balances[_tokenHolder];
    }

    function approve(address guy, uint wad) public returns (bool appr) {
        _allowances[msg.sender][guy] = wad;
        return true;
    }


    function transfer(address dst, uint wad) public returns (bool success) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad)
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

        User(dst).tokensReceived(dst, wad);

        return true;
    }
}

/* Adapted from https://github.com/CreamFi/compound-protocol/blob/cce8c8836d21ac307df918a4ca46f0b83dbe2757/contracts/CEther.sol,
 * https://github.com/CreamFi/compound-protocol/blob/0e079dd9e1d6fdf974ab429a17b955dedf677315/contracts/CToken.sol
 */
contract crETH {
    uint totalSupply_crETH;
    mapping(address => uint) accountTokens_crETH;
    mapping(address => uint) borrowBalance;
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

    function getBalances(address _user) view external returns (uint balance) {
        return accountTokens_crETH[_user];
    }


    function getBorrowBalance(address _user) view external returns (uint balance) {
        return borrowBalance[_user];
    }

    function mintFresh(address minter, uint mintAmount)
        external returns (uint retMintAmount) {
        uint balancesEth;
        balancesEth = eth.getBalanceOf(minter);
        if (balancesEth >= mintAmount) {
            uint exchangeRateMantissa = 1;
            eth.transferFrom(minter, address(this), mintAmount);
            uint mintTokens = mintAmount / exchangeRateMantissa;

            /* We write previously calculated values into storage */
            totalSupply_crETH += mintTokens;
            accountTokens_crETH[minter] += mintTokens;

            return mintAmount;
        }
    }

    function borrowFresh(
        address borrower,
        uint borrowAmount
        ) external returns (uint retBorrow) {
        /* Fail if borrow not allowed */
        uint allowed;

        uint collateralFactor = 75;
        uint exchangeRate = 1;
        uint oraclePrice = 1;
        uint tokensToDenom = collateralFactor * exchangeRate * oraclePrice;

        // For simplicity, we assume that crAMP and crETH have equal value
        uint sumCollateral = tokensToDenom * accountTokens_crETH[borrower] / 100;
        uint tokens_crAMP; tokens_crAMP = crAmp.getBalances(borrower);
        sumCollateral += tokensToDenom * tokens_crAMP / 100;

        uint sumBorrowPlusEffects = borrowBalance[borrower];
        uint borrows_crAMP; borrows_crAMP = crAmp.getBorrowBalance(borrower);
        sumBorrowPlusEffects += borrows_crAMP;
        sumBorrowPlusEffects += oraclePrice * borrowAmount;

        uint balanceEth;
        balanceEth = eth.getBalanceOf(address(this));

        if (sumCollateral > sumBorrowPlusEffects && balanceEth >= borrowAmount) {
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
 * Vulnerable_at_lines: 259
 */

contract cToken {
    uint totalSupply;
    mapping(address => uint) accountTokens;
    mapping(address => uint) borrowBalance;
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

    function getBalances(address _user) view external returns (uint balance) {
        return accountTokens[_user];
    }

    function getBorrowBalance(address _user) view external returns (uint balance) {
        return borrowBalance[_user];
    }

    function borrowFresh(
        address borrower,
        uint borrowAmount
        ) external
        noReentrancy
        returns (uint retBorrow) {
        /* Fail if borrow not allowed */
        uint allowed;

        uint collateralFactor;
        collateralFactor = 75;
        uint exchangeRate;
        exchangeRate = 1;
        uint oraclePrice;
        oraclePrice = 1;
        uint tokensToDenom;
        tokensToDenom = collateralFactor * exchangeRate * oraclePrice;
        // For simplicity, we assume that crAMP and crETH have equal value
        uint tokens_crETH; tokens_crETH = crEth.getBalances(borrower);
        uint sumCollateral = tokensToDenom * tokens_crETH / 100;
        sumCollateral += tokensToDenom * accountTokens[borrower] / 100;

        uint sumBorrowPlusEffects = borrowBalance[borrower];
        uint borrows_crETH; borrows_crETH = crEth.getBorrowBalance(borrower);
        sumBorrowPlusEffects += borrows_crETH;
        sumBorrowPlusEffects += oraclePrice * borrowAmount;

        // These are safe, as the underflow condition is checked first
        uint balances;
        balances = amp.balanceOf(address(this));
        if (sumCollateral > sumBorrowPlusEffects && balances >= borrowAmount) {
            amp.transferFrom(address(this), borrower, borrowAmount);
            borrowBalance[borrower] += borrowAmount;
            return 0;
        } else {
          return 1;
        }
    }

    function setCreamETH(address _crETH) external {
        crEth = crETH(_crETH);
    }
}
