# DDC Phase 2 Node Architecture

## Goal

Move from local simulations to real node software.

Phase 2 target:

- node process
- peer messaging
- local private network
- validator runtime
- block proposal
- branch attestation exchange
- deterministic aggregation proof

## Non-Goals

Phase 2 does not claim:

- public mainnet
- production validator economy
- audited consensus implementation
- DAO governance execution

## Node Components

Each DDC node must include:

1. P2P layer
2. mempool
3. block builder
4. branch validator
5. attestation signer
6. aggregation engine
7. state store
8. sync module
9. RPC/API interface

## Minimum Private Testnet

A minimum private testnet requires:

- 3 nodes
- independent node IDs
- shared genesis config
- peer discovery config
- block proposal
- branch attestations
- finality proof
- local logs/metrics

## Message Types

Required messages:

- HELLO
- PEER_LIST
- TX_BROADCAST
- BLOCK_PROPOSAL
- BRANCH_ASSIGNMENT
- BRANCH_ATTESTATION
- FINALITY_PROOF
- STATE_SYNC_REQUEST
- STATE_SYNC_RESPONSE

## Validator Runtime

Validator runtime must:

- load validator key
- receive branch assignments
- validate block/data object
- sign branch attestation
- submit attestation
- detect conflicting assignments

## State Store

Initial implementation can use local JSON/LevelDB.

Required state:

- blocks
- transactions
- data objects
- branch attestations
- finality proofs
- validator registry snapshot

## Finality

A block is final only if:

- at least 172/256 branches confirm
- attestations are valid
- proof root is reproducible
- block hash matches proposal

## Phase 2 Exit Criteria

Phase 2 is complete when:

- three local nodes run as separate processes
- node A proposes a block
- node B/C validate and attest
- aggregator produces finality proof
- npm test includes node-level integration check
