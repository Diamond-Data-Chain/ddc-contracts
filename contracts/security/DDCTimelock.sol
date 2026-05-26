// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DDCTimelock is Ownable {
    uint256 public constant MIN_DELAY = 24 hours;

    struct QueuedTx {
        address target;
        uint256 value;
        bytes data;
        uint256 executeAfter;
        bool executed;
    }

    uint256 public nextTxId;

    mapping(uint256 => QueuedTx) public queued;

    event Queued(
        uint256 indexed txId,
        address indexed target,
        uint256 value,
        uint256 executeAfter
    );

    event Executed(
        uint256 indexed txId
    );

    event Cancelled(
        uint256 indexed txId
    );

    constructor(address owner_)
        Ownable(owner_)
    {}

    function queue(
        address target,
        uint256 value,
        bytes calldata data
    )
        external
        onlyOwner
        returns (uint256 txId)
    {
        require(target != address(0), "zero target");

        txId = ++nextTxId;

        queued[txId] = QueuedTx({
            target: target,
            value: value,
            data: data,
            executeAfter: block.timestamp + MIN_DELAY,
            executed: false
        });

        emit Queued(
            txId,
            target,
            value,
            block.timestamp + MIN_DELAY
        );
    }

    function execute(
        uint256 txId
    )
        external
        payable
        onlyOwner
    {
        QueuedTx storage q = queued[txId];

        require(!q.executed, "already executed");
        require(q.executeAfter != 0, "missing tx");
        require(
            block.timestamp >= q.executeAfter,
            "timelocked"
        );

        q.executed = true;

        (bool ok,) = q.target.call{value:q.value}(q.data);

        require(ok, "execution failed");

        emit Executed(txId);
    }

    function cancel(
        uint256 txId
    )
        external
        onlyOwner
    {
        QueuedTx storage q = queued[txId];

        require(!q.executed, "already executed");
        require(q.executeAfter != 0, "missing tx");

        delete queued[txId];

        emit Cancelled(txId);
    }
}
