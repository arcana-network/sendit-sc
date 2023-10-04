// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Sendit is EIP712Upgradeable, ReentrancyGuardUpgradeable {
  using SafeERC20 for IERC20;

  enum RequestStatus {
    OPEN,
    REJECTED,
    COMPLETED
  }
  struct Request {
    uint256 nonce;
    address recipient;
    uint256 value;
    address token_address;
    uint256 expiry;
    RequestStatus status;
  }
  mapping(address => mapping(uint256 => bool)) public nonces;
  mapping(address => mapping(uint256 => Request)) public requests;
  event RequestCompleted(
    uint256 nonce,
    address recipient,
    uint256 value,
    address token_address
  );

  bytes32 private constant REQUEST_TYPEHASH =
    keccak256(
      "Request(uint256 chainId,uint256 nonce,address recipient,uint256 value,address token_address,uint256 expiry)"
    );

  function initialize() public initializer {
    __ReentrancyGuard_init();
    __EIP712_init("Sendit", "0.0.1");
  }

  /**
   * @dev request parameters and signature is fetched from off-chain and
   * passed to this function and the request is completed by the sender
   * @param _recipient the address of the recipient
   * @param _value the amount of the payment
   * @param _token_address the address of the token to be used for the payment
   * @param _expiry the expiry of the request
   * @param v signature field
   * @param r signature field
   * @param s signature field
   */
  function send(
    uint256 _nonce,
    address _recipient,
    uint256 _value,
    address _token_address,
    uint256 _expiry,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external payable nonReentrant {
    /// check if the request is valid
    require(!nonces[_recipient][_nonce], "Sendit: Nonce already used");
    require(_recipient != address(0), "Sendit: invalid recipient");
    require(_value != 0, "Sendit: invalid value");
    /// check if the request is not expired
    require(_expiry > block.timestamp, "Sendit: request is expired");
    /// check if the request is not already completed
    require(
      requests[_recipient][_nonce].status != RequestStatus.COMPLETED,
      "Sendit: request is completed"
    );
    /// check if the request is not already rejected
    require(
      requests[_recipient][_nonce].status != RequestStatus.REJECTED,
      "Sendit: request is rejected"
    );
    /// request should be open
    require(
      requests[_recipient][_nonce].status == RequestStatus.OPEN,
      "Sendit: request is not open"
    );
    /// check if the signature is valid
    bytes32 digest = _hashTypedDataV4(
      keccak256(
        abi.encode(
          REQUEST_TYPEHASH,
          block.chainid,
          _nonce,
          _recipient,
          _value,
          _token_address,
          _expiry
        )
      )
    );
    address signer = ECDSA.recover(digest, v, r, s);
    require(signer == _recipient, "Sendit: invalid signature");
    /// update the request status
    requests[_recipient][_nonce] = Request(
      _nonce,
      _recipient,
      _value,
      _token_address,
      _expiry,
      RequestStatus.COMPLETED
    );
    nonces[_recipient][_nonce] = true;

    /// transfer the payment
    if (_token_address == address(0)) {
      /// transfer ether
      /// check msg.value is equal to _value
      require(msg.value == _value, "Sendit: invalid msg.value");
      (bool sent, ) = _recipient.call{value: _value}("");
      require(sent, "Sendit: failed to send ether");
    } else {
      /// transfer tokens
      IERC20 token = IERC20(_token_address);
      token.safeTransferFrom(msg.sender, _recipient, _value);
    }

    emit RequestCompleted(_nonce, _recipient, _value, _token_address);
  }
}
