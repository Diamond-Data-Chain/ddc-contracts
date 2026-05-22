// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPresaleFinalize {
    function finalized() external view returns (bool);
}

contract DDCAdamasGrantVault is ReentrancyGuard {
    IERC20 public immutable usdt;
    address public immutable adamasWallet;
    IPresaleFinalize public immutable presale;

    uint256 public constant GRANT_AMOUNT = 1_850_000e18;

    bool public claimed;

    event GrantClaimed(uint256 amount, address indexed receiver);

    constructor(
        address usdtAddress,
        address presaleAddress,
        address adamasReceiver
    ) {
        require(usdtAddress != address(0), "zero usdt");
        require(presaleAddress != address(0), "zero presale");
        require(adamasReceiver != address(0), "zero adamas");

        usdt = IERC20(usdtAddress);
        presale = IPresaleFinalize(presaleAddress);
        adamasWallet = adamasReceiver;
    }

    function claimGrant() external nonReentrant {
        require(!claimed, "already claimed");
        require(presale.finalized(), "presale not finalized");

        claimed = true;

        require(usdt.transfer(adamasWallet, GRANT_AMOUNT), "transfer failed");

        emit GrantClaimed(GRANT_AMOUNT, adamasWallet);
    }
}
