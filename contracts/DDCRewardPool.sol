// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DDCRewardPool is Ownable {
    IERC20 public immutable ddc;
    address public presale;

    uint256 public constant MAX_BURN_CAP = 128_000_000 ether;
    uint256 public constant PRESALE_BURN_TARGET = 51_200_000 ether;

    uint256 public cumulativeBurnAccounted;
    uint256 public burnLockedBalance;
    uint256 public rewardEligibleBalance;

    event PresaleSet(address indexed presale);
    event PresaleReconciled(uint256 residualReceived, uint256 burnLockedAdded, uint256 rewardEligibleAdded);

    modifier onlyPresale() {
        require(msg.sender == presale, "not presale");
        _;
    }

    constructor(address owner_, address ddc_) Ownable(owner_) {
        require(ddc_ != address(0), "zero ddc");
        ddc = IERC20(ddc_);
    }

    function setPresaleOnce(address presale_) external onlyOwner {
        require(presale == address(0), "presale already set");
        require(presale_ != address(0), "zero presale");
        presale = presale_;
        emit PresaleSet(presale_);
    }

    function accountPresaleReconciliation(uint256 residualAmount, uint256 burnLockedAdded) external onlyPresale {
        require(residualAmount > 0, "zero residual");
        require(burnLockedAdded <= residualAmount, "burn > residual");
        require(cumulativeBurnAccounted + burnLockedAdded <= MAX_BURN_CAP, "burn cap");

        uint256 rewardAdded = residualAmount - burnLockedAdded;

        burnLockedBalance += burnLockedAdded;
        rewardEligibleBalance += rewardAdded;
        cumulativeBurnAccounted += burnLockedAdded;

        emit PresaleReconciled(residualAmount, burnLockedAdded, rewardAdded);
    }

    function totalAccounted() external view returns (uint256) {
        return burnLockedBalance + rewardEligibleBalance;
    }

    function unaccountedBalance() external view returns (uint256) {
        uint256 bal = ddc.balanceOf(address(this));
        uint256 accounted = burnLockedBalance + rewardEligibleBalance;
        return bal > accounted ? bal - accounted : 0;
    }

    function remainingPresaleBurnTarget() external view returns (uint256) {
        if (burnLockedBalance >= PRESALE_BURN_TARGET) return 0;
        return PRESALE_BURN_TARGET - burnLockedBalance;
    }

    function remainingGlobalBurnCapacity() external view returns (uint256) {
        if (cumulativeBurnAccounted >= MAX_BURN_CAP) return 0;
        return MAX_BURN_CAP - cumulativeBurnAccounted;
    }
}
