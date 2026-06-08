// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DDCPresaleRecorder is Ownable {
    enum PayMethod {
        UNKNOWN,
        USDT,
        BNB // reserved for future compatibility; disabled for presale v1 writes
    }

    struct Purchase {
        uint256 ddcAmount;
        address payAsset;
        uint256 payAmount;
        uint8 payMethod;
        bytes32 memoHash;
        bytes32 sourceRef;
        uint64 ts;
    }

    struct Totals {
        uint256 ddc;
        uint256 usdt;
        uint256 bnb;
    }

    mapping(bytes32 => mapping(address => Purchase[])) private _userPurchases;
    mapping(bytes32 => Purchase[]) private _globalPurchases;
    mapping(bytes32 => mapping(address => Totals)) private _userTotals;
    mapping(bytes32 => mapping(bytes32 => bool)) public recordedSourceRef;

    address public writer;

    event WriterUpdated(address indexed writer);
    event PurchaseRecorded(
        bytes32 indexed projectId,
        address indexed user,
        uint256 ddcAmount,
        address indexed payAsset,
        uint256 payAmount,
        uint8 payMethod,
        bytes32 memoHash,
        bytes32 sourceRef,
        uint64 ts
    );

    modifier onlyWriterOrOwner() {
        require(msg.sender == writer || msg.sender == owner(), "not writer");
        _;
    }

    constructor(address owner_, address writer_) Ownable(owner_) {
        require(owner_ != address(0), "zero owner");
        require(writer_ != address(0), "zero writer");
        writer = writer_;
        emit WriterUpdated(writer_);
    }

    function setWriter(address writer_) external onlyOwner {
        require(writer_ != address(0), "zero writer");
        writer = writer_;
        emit WriterUpdated(writer_);
    }

    function recordPurchase(
        bytes32 projectId,
        address user,
        uint256 ddcAmount,
        address payAsset,
        uint256 payAmount,
        uint8 payMethod,
        bytes32 memoHash,
        bytes32 sourceRef,
        uint64 ts
    ) external onlyWriterOrOwner {
        require(projectId != bytes32(0), "zero project");
        require(user != address(0), "zero user");
        require(ddcAmount > 0, "zero ddc");
        require(sourceRef != bytes32(0), "zero source");
        require(payMethod == uint8(PayMethod.USDT), "USDT only v1");
        require(!recordedSourceRef[projectId][sourceRef], "already recorded");

        recordedSourceRef[projectId][sourceRef] = true;

        Purchase memory p = Purchase({
            ddcAmount: ddcAmount,
            payAsset: payAsset,
            payAmount: payAmount,
            payMethod: payMethod,
            memoHash: memoHash,
            sourceRef: sourceRef,
            ts: ts == 0 ? uint64(block.timestamp) : ts
        });

        _userPurchases[projectId][user].push(p);
        _globalPurchases[projectId].push(p);

        Totals storage t = _userTotals[projectId][user];
        t.ddc += ddcAmount;

        if (payMethod == uint8(PayMethod.USDT)) {
            t.usdt += payAmount;
        } else if (payMethod == uint8(PayMethod.BNB)) {
            t.bnb += payAmount;
        }

        emit PurchaseRecorded(
            projectId,
            user,
            ddcAmount,
            payAsset,
            payAmount,
            payMethod,
            memoHash,
            sourceRef,
            p.ts
        );
    }

    function getUserPresaleTotals(
        bytes32 projectId,
        address user
    ) external view returns (uint256 ddc, uint256 usdt, uint256 bnb) {
        Totals storage t = _userTotals[projectId][user];
        return (t.ddc, t.usdt, t.bnb);
    }

    function getUserPurchaseCount(
        bytes32 projectId,
        address user
    ) external view returns (uint256) {
        return _userPurchases[projectId][user].length;
    }

    function listUserPurchases(
        bytes32 projectId,
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (Purchase[] memory) {
        Purchase[] storage src = _userPurchases[projectId][user];
        return _slice(src, offset, limit);
    }

    function getGlobalPurchaseCount(
        bytes32 projectId
    ) external view returns (uint256) {
        return _globalPurchases[projectId].length;
    }

    function listGlobalPurchases(
        bytes32 projectId,
        uint256 offset,
        uint256 limit
    ) external view returns (Purchase[] memory) {
        Purchase[] storage src = _globalPurchases[projectId];
        return _slice(src, offset, limit);
    }

    function _slice(
        Purchase[] storage src,
        uint256 offset,
        uint256 limit
    ) internal view returns (Purchase[] memory out) {
        if (offset >= src.length || limit == 0) {
            return new Purchase[](0);
        }

        uint256 end = offset + limit;
        if (end > src.length) end = src.length;

        out = new Purchase[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            out[i - offset] = src[i];
        }
    }
}
