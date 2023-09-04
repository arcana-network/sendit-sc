// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;
// write an upgradeble contract which is ownable
// implement eip 712 for signing the request parameters
// import eip 712 library
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";

contract Sendit is OwnableUpgradeable, EIP712Upgradeable {
  enum RequestStatus { OPEN, REJECTED, COMPLETED }
  struct Request {
      uint256 id;
      address recipient;
      uint256 value;
      address token_address;
      RequestStatus status;
  }
  mapping(uint256 => Request) public requests;

  bytes32 private constant REQUEST_TYPEHASH = 
  keccak256("Request(uint256 id,address recipient,uint256 value,address token_address)");

  function initialize() public initializer {
    __Ownable_init();
    __EIP712_init("Sendit", "1");
  }

  // @dev request parameters and signature is fetched from off-chain and
  // passed to this function and the request is completed by the sender
  // @param _recipient the address of the recipient
  // @param _value the amount of the payment
  // @param _token_address the address of the token to be used for the payment
  // @param _signature the signature of the request parameters
  function send(uint256 _id,address _recipient, uint256 _value, address _token_address, 
  uint8 v, bytes32 r, bytes32 s) public {
    // check if the request is valid
    require(requests[_id].id != _id, "Sendit: request already exists");
    require(_recipient != address(0), "Sendit: invalid recipient");
    require(_value > 0, "Sendit: invalid value");
    require(_token_address != address(0), "Sendit: invalid token address");
    require(r != 0, "Sendit: invalid signature");
    require(s != 0, "Sendit: invalid signature");
    require(v != 0, "Sendit: invalid signature");
    // check if the request is not already completed
    require(requests[_id].status != RequestStatus.COMPLETED, "Sendit: request is completed");
    // check if the request is not already rejected
    require(requests[_id].status != RequestStatus.REJECTED, "Sendit: request is rejected");
    // request should be open 
    require(requests[_id].status == RequestStatus.OPEN, "Sendit: request is not open");
    // check if the signature is valid
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(REQUEST_TYPEHASH, _id,_recipient, _value, _token_address)));
    address signer = ecrecover(digest, v, r, s);
    require(signer == _recipient, "Sendit: invalid signature");
    // transfer the payment
    IERC20Upgradeable token = IERC20Upgradeable(_token_address);
    bool sent = token.transferFrom(msg.sender, _recipient, _value);
    require(sent, "Sendit: failed to send tokens");
    // update the request status
    requests[_id] = Request(_id, _recipient, _value, _token_address, RequestStatus.COMPLETED);
  }

}