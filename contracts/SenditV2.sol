// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
// write an upgradeble contract which is ownable
// implement eip 712 for signing the request parameters
// import eip 712 library
import "./Sendit.sol";

contract SenditV2 is Sendit{
  function version() external pure returns(uint) {
    return 2;
  }
}