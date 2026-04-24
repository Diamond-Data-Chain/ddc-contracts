// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DDCToken is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 256_000_000 ether;

    constructor(address initialHolder) ERC20("Diamond Data Chain", "DDC") {
        require(initialHolder != address(0), "zero holder");
        _mint(initialHolder, TOTAL_SUPPLY);
    }
}
