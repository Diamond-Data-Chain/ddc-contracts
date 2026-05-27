// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DDCLinearVestingVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable ddc;
    address public immutable beneficiary;
    uint256 public immutable startTime;
    uint256 public immutable duration;
    uint256 public immutable totalAllocation;

    uint256 public claimed;

    event Claimed(address indexed beneficiary, uint256 amount);

    constructor(
        address ddc_,
        address beneficiary_,
        uint256 startTime_,
        uint256 duration_,
        uint256 totalAllocation_
    ) {
        require(ddc_ != address(0), "zero ddc");
        require(beneficiary_ != address(0), "zero beneficiary");
        require(duration_ > 0, "zero duration");
        require(totalAllocation_ > 0, "zero allocation");

        ddc = IERC20(ddc_);
        beneficiary = beneficiary_;
        startTime = startTime_;
        duration = duration_;
        totalAllocation = totalAllocation_;
    }

    function vestedAmount() public view returns (uint256) {
        if (block.timestamp < startTime) return 0;

        uint256 elapsed = block.timestamp - startTime;

        if (elapsed >= duration) {
            return totalAllocation;
        }

        return (totalAllocation * elapsed) / duration;
    }

    function claimable() public view returns (uint256) {
        uint256 vested = vestedAmount();

        if (vested <= claimed) return 0;

        return vested - claimed;
    }

    function claim() external nonReentrant {
        require(msg.sender == beneficiary, "not beneficiary");

        uint256 amount = claimable();

        require(amount > 0, "nothing claimable");

        claimed += amount;

        ddc.safeTransfer(beneficiary, amount);

        emit Claimed(beneficiary, amount);
    }
}
