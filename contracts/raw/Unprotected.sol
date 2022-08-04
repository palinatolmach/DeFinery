/*
 * Adapted from https://github.com/trailofbits/not-so-smart-contracts/blob/master/unprotected_function/Unprotected.sol,
 * https://github.com/smartbugs/smartbugs/blob/master/dataset/access_control/unprotected0.sol
 * Vulnerable_at_lines: 25
 */

 contract Unprotected{
     address private owner;
     mapping(address => uint256) balances;

     modifier onlyowner {
         require(msg.sender==owner);
         _;
     }

     constructor() public
     {
         owner = msg.sender;
     }

     // <yes> <report> ACCESS_CONTROL
     // Missing an (owner == msg.sender) check
     function changeOwner(address _newOwner)
        public
     {
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