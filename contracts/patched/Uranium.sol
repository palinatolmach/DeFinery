/* Adapted from https://github.com/dapphub/ds-token/blob/master/src/token.sol,
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 */
contract USDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 totalSupply;
    function getBalanceOf(address usr) external returns (uint256 balance) {
        return balanceOf[usr];
    }
    function getTotalSupply() public view returns (uint256 tS) {
        return totalSupply;
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
    function setBalances(address _user, uint256 amount) external {
        balanceOf[_user] = amount;
    }
}
/* Adapted from https://github.com/dapphub/ds-token/blob/master/src/token.sol,
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 */
contract DAI {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 totalSupply;
    function getBalanceOf(address usr) external returns (uint256 balance) {
        return balanceOf[usr];
    }
    function getTotalSupply() public view returns (uint256 tS) {
        return totalSupply;
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
    function setBalances(address _user, uint256 amount) external {
        balanceOf[_user] = amount;
    }
}
/* Adapted from https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol,
 * https://twitter.com/FrankResearcher/status/1387347036916260869
 * Vulnerable_at_lines: 165
 */
contract Uranium {
    uint256 private reserve0;
    uint256 private reserve1;
    uint256 private totalBorrows;
    uint256 private totalReserves;
    uint256 private borrowIndex;
    address usdc;
    address dai;
    constructor(
        uint256 _reserve0,
        uint256 _reserve1,
        address _usdc,
        address _dai
    ) public {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        usdc = _usdc;
        dai = _dai;
    }
    function swap(uint256 amount0Out, uint256 amount1Out, address to)
        public
        payable
    {
        uint256 _reserve0 = reserve0;
        uint256 _reserve1 = reserve1;
        require(
            amount0Out > 0 || amount1Out > 0,
            "UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        require(
            amount0Out < _reserve0 && amount1Out < _reserve1,
            "UniswapV2: INSUFFICIENT_LIQUIDITY"
        );
        // optimistically transfer tokens
        if (amount0Out > 0) {
            USDC(usdc).transferFrom(address(this), to, amount0Out);
        } else if (amount1Out > 0) {
            DAI(dai).transferFrom(address(this), to, amount1Out);
        }
        uint256 balance0;
        uint256 balance1;
        balance0 = USDC(usdc).getBalanceOf(address(this));
        balance1 = DAI(dai).getBalanceOf(address(this));
        uint256 amount0In;
        uint256 amount1In;
        if (balance0 > _reserve0 - amount0Out) {
            amount0In = balance0 - (_reserve0 - amount0Out);
        } else {
            amount0In = 0;
        }
        if (balance1 > _reserve1 - amount1Out) {
            amount1In = balance1 - (_reserve1 - amount1Out);
        } else {
            amount1In = 0;
        }
        // (x * y = k) invariant implementation
        require(
            amount0In > 0 || amount1In > 0,
            "UniswapV2: INSUFFICIENT_INPUT_AMOUNT"
        );
        uint256 balance0Adjusted;
        balance0Adjusted = (balance0 * 100);
        uint256 balance1Adjusted;
        balance1Adjusted = (balance1 * 100);
        // Vulnerable statement causing the exploit, a constant should have been 100 instead of 10
        require(
            balance0Adjusted * balance1Adjusted >=
                _reserve0 * _reserve1 * 100**2,
            "UniswapV2: K"
        );
        _update(balance0, balance1, _reserve0, _reserve1);
    }
    function _update(
        uint256 _balance0,
        uint256 _balance1,
        uint256 _reserve0,
        uint256 _reserve1
    ) private {
        reserve0 = _balance0;
        reserve1 = _balance1;
    }
} // Main contract encoding the harness function as a constructor
contract _MAIN_ {
    function declare_property(bool property) public {}

    mapping(address=>uint) public init;
    mapping(address=>uint) public res;
    uint $init0;
    uint $init1;

    /* Values of state variables prefixed with testVal
     * are being automatically checked when executing
     * test cases (in addition to validity checking
     * of the execution trace)
     */
    uint testVal_0;
    uint testVal_1;

    constructor() public {
        Uranium uranium;
        USDC usdc;
        DAI dai;

        // Setting up the environment, initial contract balances
        usdc = new USDC();
        dai = new DAI();
        uranium = new Uranium(1000, 1000, address(usdc), address(dai));
        address urn; urn = address(uranium);

        dai.setBalances(urn, 1000);
        usdc.setBalances(urn, 1000);
        dai.setBalances(address(this), 100);
        usdc.setBalances(address(this), 0);

        // Setting symbolic vars to concrete values in test cases:
        // <<< $init0 >>>
        // <<< $init1 >>>

        // Recording initial allocations (reserves) of Uranium in DAI, USDC
        init[urn] = dai.getBalanceOf(urn);
        uint urn_usdc_init; urn_usdc_init = usdc.getBalanceOf(urn);
        init[urn] = urn_usdc_init * init[urn];

        // Successfully transferring DAI to Uranium
        __assume__($init0 > 0 && $init0 <= 100);
        dai.transferFrom(address(this), urn, $init0);

        /* Retrieving a positive amount of USDC from Uranium in return
         * for transferred DAI; depending of the amount of USDC, this
         * call might be valid or malicious
         */
        __assume__($init1 > 0 && $init1 < 1000);
        uranium.swap($init1, 0, address(this));

        // Recording resulting allocations (reserves) of Uranium in DAI, USDC
        res[urn] = dai.getBalanceOf(urn);
        uint urn_usdc; urn_usdc = usdc.getBalanceOf(urn);
        res[urn] =  res[urn] * urn_usdc;

        /* Recording control variable values for more accurate
         * test case results (optional)
         */
        testVal_0 = res[address(urn)];
        testVal_1 = res[address(this)];

        /* Checking the property:
         * Constant product of Uranium (pool) reserves is non-decreasing;
         */
        declare_property(res[urn] >= init[urn]);
    }
}
