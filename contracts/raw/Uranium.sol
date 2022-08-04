/* Adapted from https://github.com/dapphub/ds-token/blob/master/src/token.sol,
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 */

contract USDC {
    mapping (address => uint)  public                       balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;
    uint totalSupply;

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

/* Adapted from https://github.com/dapphub/ds-token/blob/master/src/token.sol,
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 */

contract DAI {
    mapping (address => uint)                       public  balanceOf;
    mapping (address => mapping (address => uint))  public  allowance;
    uint totalSupply;

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

/* Adapted from https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol,
 * https://twitter.com/FrankResearcher/status/1387347036916260869
 * Vulnerable_at_lines: 155
 */

contract Uranium {
    uint private reserve0;
    uint private reserve1;

    uint private totalBorrows;
    uint private totalReserves;
    uint private borrowIndex;

    address usdc;
    address dai;

    constructor(uint _reserve0, uint _reserve1, address _usdc, address _dai) public {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        usdc = _usdc;
        dai = _dai;
    }

    function swap(uint amount0Out, uint amount1Out, address to) public payable {
        uint _reserve0 = reserve0;
        uint _reserve1 = reserve1;

        require(amount0Out > 0 || amount1Out > 0, 'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'UniswapV2: INSUFFICIENT_LIQUIDITY');

        // optimistically transfer tokens
        if (amount0Out > 0) {
            USDC(usdc).transferFrom(address(this), to, amount0Out);
        } else if (amount1Out > 0) {
            DAI(dai).transferFrom(address(this), to, amount1Out);
        }

        uint balance0;
        uint balance1;

        balance0 = USDC(usdc).getBalanceOf(address(this));
        balance1 = DAI(dai).getBalanceOf(address(this));

        uint amount0In;
        uint amount1In;
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
        require(amount0In > 0 || amount1In > 0, 'UniswapV2: INSUFFICIENT_INPUT_AMOUNT');
        uint balance0Adjusted;
        balance0Adjusted = (balance0 * 100);
        uint balance1Adjusted;
        balance1Adjusted = (balance1 * 100);

        // Vulnerable statement causing the exploit:
        require(balance0Adjusted * balance1Adjusted >= _reserve0 * _reserve1 * 10**2, 'UniswapV2: K');

        _update(balance0, balance1, _reserve0, _reserve1);
    }

    function _update(uint _balance0, uint _balance1, uint _reserve0, uint _reserve1) private {
        reserve0 = _balance0;
        reserve1 = _balance1;
    }
}