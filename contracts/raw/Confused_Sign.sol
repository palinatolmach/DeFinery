/* Adapted from https://github.com/smartbugs/smartbugs/blob/master/dataset/access_control/wallet_02_refund_nosub.sol,
 * https://smartcontractsecurity.github.io/SWC-registry/docs/SWC-105#wallet-02-refund-nosubsol
 * Vulnerable_at_lines: 25
*/

 contract Confused_Sign {
     address creator;

     mapping(address => uint256) balances;

     constructor() public {
         creator = msg.sender;
     }

     function getBalances(address depositor) public view returns (uint balance) {
        return balances[depositor];
     }

     function deposit() public payable {
         require(balances[msg.sender] + msg.value > balances[msg.sender]);
         balances[msg.sender] += msg.value;
     }

     function withdraw(uint256 amount) public {
         require(amount >= balances[msg.sender]);
         msg.sender.call.value(amount);
         balances[msg.sender] -= amount;
     }

     function migrateTo(address payable to) public {
         require(creator == msg.sender);
         to.transfer(address(this).balance);
     }
 }