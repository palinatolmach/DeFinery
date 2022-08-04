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
}