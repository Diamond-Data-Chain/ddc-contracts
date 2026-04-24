// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDDCPresaleVesting {
    struct Purchase {
        uint64 timestamp;
        uint8 batchId;
        uint256 amountDDC;
        uint256 paidUSDT;
        bytes32 txId;
    }

    event Purchased(address indexed user, uint8 indexed batchId, uint256 amountDDC, uint256 paidAmount, bool isUSDT, bytes32 txId);
    event BatchRollover(uint8 indexed fromBatch, uint8 indexed toBatch, uint256 amountRolled);
    event BatchAdvanced(uint8 indexed previousBatch, uint8 indexed newBatch);
    event Claimed(address indexed user, uint256 amount);
    event TgeSet(uint64 indexed tgeTimestamp);
    event PresaleFinished(uint256 totalSold, uint256 unsoldToRewards);
    event RaisedFundsWithdrawn(address indexed treasury, uint256 usdtAmount, uint256 nativeAmount);

    function totalBatches() external pure returns (uint8);
    function currentBatch() external view returns (uint8);

    function batchInfo(uint8 batchId) external view returns (
        uint256 priceUSDT,
        uint256 baseAllocationDDC,
        uint256 rolloverInDDC,
        uint256 hardCapDDC,
        uint256 soldDDC,
        uint64 startTime,
        uint64 endTime,
        bool isActive,
        bool isClosed
    );

    function totalPurchased(address user) external view returns (uint256);
    function vestingPrincipal(address user) external view returns (uint256);
    function claimed(address user) external view returns (uint256);
    function claimable(address user) external view returns (uint256);
    function locked(address user) external view returns (uint256);
    function userPurchases(address user, uint256 offset, uint256 limit) external view returns (Purchase[] memory);

    function buyWithUSDT(uint256 usdtAmount, bytes32 txId) external;
    function buyWithNative(bytes32 txId) external payable;
    function claim() external;
    function finalize() external;
    function setTGE(uint64 tge_) external;
}
