/*
 * Adapted from https://smartcontractsecurity.github.io/SWC-registry/docs/SWC-105#wallet-02-refund-nosubsol,
 * Adapted from https://github.com/smartbugs/smartbugs/blob/master/dataset/access_control/wallet_02_refund_nosub.sol,
 * https://smartcontractsecurity.github.io/SWC-registry/docs/SWC-105#wallet-02-refund-nosubsol
 * Vulnerable_at_lines: 40
 */

 /* User can add pay in and withdraw Ether.
    Unfortunately the developer forgot set the user's balance to 0 when refund() is called.
    An attacker can pay in a small amount of Ether and call refund() repeatedly to empty the contract.
 */

 contract Refund_NoSub {
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
         require(amount <= balances[msg.sender]);
         msg.sender.call.value(amount);
         balances[msg.sender] -= amount;
     }

     function refund() public {
         // <yes> <report> ACCESS_CONTROL
         msg.sender.call.value(balances[msg.sender]);
     }

     // In an emergency the owner can migrate  allfunds to a different address.
     function migrateTo(address payable to) public {
         require(creator == msg.sender);
         to.transfer(address(this).balance);
     }
 }