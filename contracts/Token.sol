// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// implement an ERC20 contract using openzeppelin library
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract Token is ERC20Upgradeable {
  function initialize() public initializer {
    __ERC20_init("Token", "TKN");
    _mint(msg.sender, 10 ** 9);
  }
}
