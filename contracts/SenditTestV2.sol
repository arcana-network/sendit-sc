// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
// write an upgradeble contract which is ownable
// implement eip 712 for signing the request parameters
// import eip 712 library
import "./SenditV2.sol";

contract SenditTestV2 is SenditV2 {
  function version() external override pure returns (uint) {
    return 2;
  }
}
