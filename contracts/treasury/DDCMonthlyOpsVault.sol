// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DDCMonthlyOpsVault is ReentrancyGuard {
    IERC20 public immutable usdt;

    address public immutable opsWallet;

    uint256 public constant MONTHLY_AMOUNT = 168_000e18;
    uint256 public constant MAX_MONTHS = 12;
    uint256 public immutable startTime;

    uint256 public claimedMonths;

    event MonthlyClaim(
        uint256 indexed monthIndex,
        uint256 amount,
        address indexed receiver
    );

    constructor(
        address usdtAddress,
        address opsReceiver,
        uint256 presaleStart
    ) {
        require(usdtAddress != address(0), "zero usdt");
        require(opsReceiver != address(0), "zero ops");

        usdt = IERC20(usdtAddress);
        opsWallet = opsReceiver;

        startTime = presaleStart + 30 days;
    }

    function claimMonthly() external nonReentrant {
        uint256 elapsed = block.timestamp < startTime
            ? 0
            : ((block.timestamp - startTime) / 30 days) + 1;

        if (elapsed > MAX_MONTHS) {
            elapsed = MAX_MONTHS;
        }

        require(elapsed > claimedMonths, "nothing claimable");

        uint256 monthsToClaim = elapsed - claimedMonths;
        uint256 amount = monthsToClaim * MONTHLY_AMOUNT;

        claimedMonths = elapsed;

        require(
            usdt.transfer(opsWallet, amount),
            "transfer failed"
        );

        emit MonthlyClaim(elapsed, amount, opsWallet);
    }
}
