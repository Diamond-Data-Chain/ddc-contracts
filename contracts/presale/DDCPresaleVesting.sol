// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IDDCRewardPool {
    function PRESALE_BURN_TARGET() external view returns (uint256);
    function accountPresaleReconciliation(
        uint256 residualAmount,
        uint256 burnLockedAdded
    ) external;
}

contract DDCPresaleVesting is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint8 public constant TOTAL_BATCHES = 40;
    uint64 public constant BATCH_DURATION = 368_640; // 102.4h
    uint256 public constant BATCH_BASE_ALLOCATION = 2_560_000 ether;
    uint256 public constant PRESALE_NOMINAL_TOTAL = 102_400_000 ether;
    uint256 public constant MIN_PURCHASE_USDT = 50 * 1e6;
    uint256 public constant MAX_PURCHASE_USDT = 5_000 * 1e6;
    uint256 public constant TREASURY_SWEEP_THRESHOLD_USDT = 10_000 * 1e6;
    uint256 private constant PHASE_DURATION = 180 days;

    struct Batch {
        uint256 priceUSDT;      // 6 decimals per 1 DDC
        uint256 baseAllocation; // fixed 2.56M DDC
        uint256 rolloverIn;     // unsold from previous batch
        uint256 hardCap;        // baseAllocation + rolloverIn
        uint256 sold;           // nominal DDC sold in this batch
        uint64 startTime;
        uint64 endTime;
        bool isClosed;
    }

    struct Purchase {
        uint64 timestamp;
        uint8 batchId;
        uint256 amountDDC;
        uint256 paidUSDT;
        bytes32 txId;
    }

    IERC20 public immutable ddc;
    IERC20 public immutable usdt;
    IDDCRewardPool public immutable rewardPool;
    address public immutable treasury;

    uint64 public immutable presaleStart;
    uint8 public currentBatchId;
    uint64 public tgeTimestamp;
    bool public finalized;

    mapping(uint8 => Batch) private _batches;
    mapping(address => uint256) public totalPurchased;
    mapping(address => uint256) public vestingPrincipal;
    mapping(address => uint256) public claimed;
    mapping(bytes32 => bool) private _usedTxIds;
    mapping(address => Purchase[]) private _userPurchases;
    mapping(uint8 => mapping(address => uint256)) public spentUsdtPerBatch;

    uint256 public totalNominalSold;
    uint256 public totalBuyerPrincipal;
    uint256 public totalBurnLockedFromSales;
    uint256[40] private _prices;

    event Purchased(
        address indexed user,
        uint8 indexed batchId,
        uint256 amountDDC,
        uint256 paidAmount,
        bool isUSDT,
        bytes32 txId
    );
    event BatchRollover(
        uint8 indexed fromBatch,
        uint8 indexed toBatch,
        uint256 amountRolled
    );
    event BatchAdvanced(uint8 indexed previousBatch, uint8 indexed newBatch);
    event Claimed(address indexed user, uint256 amount);
    event TgeSet(uint64 indexed tgeTimestamp);
    event PresaleFinished(uint256 totalSold, uint256 unsoldToRewards);
    event RaisedFundsWithdrawn(
        address indexed treasury,
        uint256 usdtAmount,
        uint256 nativeAmount
    );

    constructor(
        address owner_,
        address ddc_,
        address usdt_,
        address rewardPool_,
        address treasury_,
        uint64 presaleStart_,
        uint256[40] memory batchPricesUSDT6_
    ) Ownable(owner_) {
        require(ddc_ != address(0), "zero ddc");
        require(usdt_ != address(0), "zero usdt");
        require(rewardPool_ != address(0), "zero reward pool");
        require(treasury_ != address(0), "zero treasury");
        require(presaleStart_ > 0, "zero presale start");

        ddc = IERC20(ddc_);
        usdt = IERC20(usdt_);
        rewardPool = IDDCRewardPool(rewardPool_);
        treasury = treasury_;
        presaleStart = presaleStart_;

        for (uint8 i = 0; i < TOTAL_BATCHES; i++) {
            require(batchPricesUSDT6_[i] > 0, "zero price");
            _prices[i] = batchPricesUSDT6_[i];
        }

        currentBatchId = 1;
        _batches[1] = Batch({
            priceUSDT: _prices[0],
            baseAllocation: BATCH_BASE_ALLOCATION,
            rolloverIn: 0,
            hardCap: BATCH_BASE_ALLOCATION,
            sold: 0,
            startTime: presaleStart_,
            endTime: presaleStart_ + BATCH_DURATION,
            isClosed: false
        });
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setTGE(uint64 tge_) external onlyOwner {
        require(tgeTimestamp == 0, "TGE already set");
        require(tge_ > block.timestamp, "TGE in past");
        tgeTimestamp = tge_;
        emit TgeSet(tge_);
    }

    function batchInfo(uint8 batchId)
        external
        view
        returns (
            uint256 priceUSDT,
            uint256 baseAllocationDDC,
            uint256 rolloverInDDC,
            uint256 hardCapDDC,
            uint256 soldDDC,
            uint64 startTime,
            uint64 endTime,
            bool isActive,
            bool isClosed
        )
    {
        Batch memory b = _batches[batchId];
        priceUSDT = b.priceUSDT;
        baseAllocationDDC = b.baseAllocation;
        rolloverInDDC = b.rolloverIn;
        hardCapDDC = b.hardCap;
        soldDDC = b.sold;
        startTime = b.startTime;
        endTime = b.endTime;
        isClosed = b.isClosed;
        isActive =
            !finalized &&
            batchId == _effectiveCurrentBatchId() &&
            block.timestamp >= b.startTime &&
            !b.isClosed;
    }

    function totalBatches() external pure returns (uint8) {
        return TOTAL_BATCHES;
    }

    function currentBatch() external view returns (uint8) {
        return _effectiveCurrentBatchId();
    }

    function claimable(address user) public view returns (uint256) {
        uint256 unlocked = _unlockedTotal(vestingPrincipal[user]);
        uint256 alreadyClaimed = claimed[user];
        return unlocked > alreadyClaimed ? unlocked - alreadyClaimed : 0;
    }

    function locked(address user) external view returns (uint256) {
        uint256 unlocked = _unlockedTotal(vestingPrincipal[user]);
        uint256 principal = vestingPrincipal[user];
        return principal > unlocked ? principal - unlocked : 0;
    }

    function userPurchases(address user, uint256 offset, uint256 limit)
        external
        view
        returns (Purchase[] memory)
    {
        Purchase[] storage arr = _userPurchases[user];
        uint256 len = arr.length;
        if (offset >= len) return new Purchase[](0);
        uint256 end = offset + limit;
        if (end > len) end = len;
        Purchase[] memory out = new Purchase[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            out[i - offset] = arr[i];
        }
        return out;
    }

    function buyWithUSDT(uint256 usdtAmount, bytes32 txId)
        external
        nonReentrant
        whenNotPaused
    {
        require(txId != bytes32(0), "txId required");
        require(!_usedTxIds[txId], "txId used");
        _usedTxIds[txId] = true;
        require(!finalized, "finalized");
        _syncBatches();

        uint8 batchId = currentBatchId;
        Batch storage b = _batches[batchId];
        require(block.timestamp >= b.startTime, "batch not started");
        require(block.timestamp <= b.endTime, "batch ended");
        require(!b.isClosed, "batch closed");

        require(usdtAmount >= MIN_PURCHASE_USDT, "below min");
        uint256 newSpent = spentUsdtPerBatch[batchId][msg.sender] + usdtAmount;
        require(newSpent <= MAX_PURCHASE_USDT, "above max");

        uint256 ddcAmount = (usdtAmount * 1 ether) / b.priceUSDT;
        require(ddcAmount > 0, "zero purchase");
        require(b.sold + ddcAmount <= b.hardCap, "hard cap");

        spentUsdtPerBatch[batchId][msg.sender] = newSpent;
        b.sold += ddcAmount;
        totalPurchased[msg.sender] += ddcAmount;
        totalNominalSold += ddcAmount;

        uint256 buyerPart = ddcAmount / 2;
        uint256 burnPart = ddcAmount - buyerPart;
        vestingPrincipal[msg.sender] += buyerPart;
        totalBuyerPrincipal += buyerPart;
        totalBurnLockedFromSales += burnPart;

        _userPurchases[msg.sender].push(
            Purchase({
                timestamp: uint64(block.timestamp),
                batchId: batchId,
                amountDDC: ddcAmount,
                paidUSDT: usdtAmount,
                txId: txId
            })
        );

        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);

        emit Purchased(msg.sender, batchId, ddcAmount, usdtAmount, true, txId);
        _syncBatches();
    }

    function claim() external nonReentrant {
        uint256 amt = claimable(msg.sender);
        require(amt > 0, "nothing claimable");

        claimed[msg.sender] += amt;
        ddc.safeTransfer(msg.sender, amt);

        emit Claimed(msg.sender, amt);
    }

    function finalize() external nonReentrant {
        require(!finalized, "already finalized");
        require(currentBatchId == TOTAL_BATCHES, "not last batch");
        _syncBatches();
        require(currentBatchId == TOTAL_BATCHES, "not last batch");

        Batch storage lastBatch = _batches[TOTAL_BATCHES];
        require(
            lastBatch.isClosed || block.timestamp > lastBatch.endTime,
            "last batch active"
        );

        finalized = true;

        uint256 remainingPresaleAllocation =
            PRESALE_NOMINAL_TOTAL - totalBuyerPrincipal;
        uint256 residualToRewardPool = remainingPresaleAllocation;

        require(
            ddc.balanceOf(address(this)) >= residualToRewardPool,
            "insufficient DDC funded"
        );

        ddc.safeTransfer(address(rewardPool), residualToRewardPool);

        uint256 burnTarget = rewardPool.PRESALE_BURN_TARGET();
        uint256 burnTopUp =
            totalBurnLockedFromSales >= burnTarget
                ? 0
                : burnTarget - totalBurnLockedFromSales;

        if (burnTopUp > residualToRewardPool) burnTopUp = residualToRewardPool;

        rewardPool.accountPresaleReconciliation(
            residualToRewardPool,
            burnTopUp
        );

        emit PresaleFinished(totalNominalSold, residualToRewardPool);
    }

    
    function sweepRaisedFundsToTreasury() external nonReentrant {
        uint256 usdtBal = usdt.balanceOf(address(this));
        require(usdtBal >= TREASURY_SWEEP_THRESHOLD_USDT, "threshold not reached");

        usdt.safeTransfer(treasury, usdtBal);

        emit RaisedFundsWithdrawn(treasury, usdtBal, 0);
    }

function withdrawRaisedFunds() external nonReentrant {
        require(msg.sender == treasury, "not treasury");
        require(finalized, "not finalized");

        uint256 usdtBal = usdt.balanceOf(address(this));
        if (usdtBal > 0) {
            usdt.safeTransfer(treasury, usdtBal);
        }

        uint256 nativeBal = address(this).balance;
        if (nativeBal > 0) {
            (bool ok,) = treasury.call{value: nativeBal}("");
            require(ok, "native withdraw failed");
        }

        emit RaisedFundsWithdrawn(treasury, usdtBal, nativeBal);
    }

    function _syncBatches() internal {
        // === DDC FIX: deterministic rollover ===
        {
            Batch storage bRef = _batches[currentBatchId];

            if (bRef.sold > bRef.hardCap) {
                revert("invalid batch state");
            }

            uint256 unsoldLocal = bRef.hardCap > bRef.sold ? bRef.hardCap - bRef.sold : 0;

            uint8 nextIdLocal = currentBatchId + 1;
            if (nextIdLocal <= TOTAL_BATCHES) {
                Batch storage nRef = _batches[nextIdLocal];
                nRef.rolloverIn += unsoldLocal;
                nRef.hardCap += unsoldLocal;
            }
        }
        // === END FIX ===


while (!finalized && currentBatchId <= TOTAL_BATCHES) {
            Batch storage b = _batches[currentBatchId];
            bool soldOut = b.sold >= b.hardCap;
            bool expired = block.timestamp > b.endTime;

            if (!soldOut && !expired) break;
            if (b.isClosed) break;

            b.isClosed = true;

            if (currentBatchId == TOTAL_BATCHES) {
                break;
            }

            uint8 nextId = currentBatchId + 1;
            uint256 unsold = b.hardCap > b.sold ? b.hardCap - b.sold : 0;
            uint64 nextStart = soldOut ? uint64(block.timestamp) : b.endTime;
            uint64 nextEnd = nextStart + BATCH_DURATION;

            Batch storage n = _batches[nextId];
            if (n.startTime == 0) {
                n.priceUSDT = _prices[nextId - 1];
                n.baseAllocation = BATCH_BASE_ALLOCATION;
                n.rolloverIn = unsold;
                n.hardCap = BATCH_BASE_ALLOCATION + unsold;
                n.sold = 0;
                n.startTime = nextStart;
                n.endTime = nextEnd;
                n.isClosed = false;
            } else {
                n.rolloverIn += unsold;
                n.hardCap += unsold;
                if (soldOut && block.timestamp < n.startTime) {
                    n.startTime = nextStart;
                    n.endTime = nextEnd;
                }
            }

            emit BatchRollover(currentBatchId, nextId, unsold);
            emit BatchAdvanced(currentBatchId, nextId);
            currentBatchId = nextId;
        }
    }

    function _effectiveCurrentBatchId() internal view returns (uint8) {
        uint8 id = currentBatchId;

        while (id <= TOTAL_BATCHES) {
            Batch memory b = _batches[id];
            if (b.startTime == 0) break;

            bool soldOut = b.sold >= b.hardCap;
            bool expired = block.timestamp > b.endTime;

            if (!b.isClosed && !soldOut && !expired) return id;
            if (id == TOTAL_BATCHES) return id;

            id++;
        }

        return currentBatchId;
    }

    function _unlockedTotal(uint256 principal) internal view returns (uint256) {
        if (principal == 0) return 0;
        if (tgeTimestamp == 0 || block.timestamp < tgeTimestamp) return 0;

        uint256 unlocked = (principal * 10) / 100;
        uint256 elapsed = block.timestamp - tgeTimestamp;

        if (elapsed < PHASE_DURATION) {
            unlocked += (principal * 45 * elapsed) / (100 * PHASE_DURATION);
            return unlocked;
        }

        unlocked += (principal * 45) / 100;

        if (elapsed < 2 * PHASE_DURATION) {
            uint256 e2 = elapsed - PHASE_DURATION;
            unlocked += (principal * 30 * e2) / (100 * PHASE_DURATION);
            return unlocked;
        }

        unlocked += (principal * 30) / 100;

        if (elapsed < 3 * PHASE_DURATION) {
            uint256 e3 = elapsed - (2 * PHASE_DURATION);
            unlocked += (principal * 15 * e3) / (100 * PHASE_DURATION);
            return unlocked;
        }

        return principal;
    }
}
