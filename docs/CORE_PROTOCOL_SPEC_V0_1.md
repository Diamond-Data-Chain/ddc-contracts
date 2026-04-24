# DDC Core Protocol Specification v0.1

Status: Design specification, not yet implemented as node software.

## Current Implementation Status

Implemented today:
- BNB Testnet presale smart contracts
- DDC fixed-supply token
- vesting accounting
- treasury sweep/control
- E2E presale validation

Not implemented today:
- DDC node software
- peer-to-peer network
- block/DAG production
- validator client
- native DDC mainnet
- DAO execution layer
- validator reward distribution

## Core Architecture Target

DDC is intended to become a Layer-1 protocol based on a Diamond-DAG execution model.

The target architecture separates:

1. Base execution / consensus layer
2. Data provenance layer
3. AI advisory analytics layer
4. Application / marketplace layer
5. Governance layer

## Consensus Direction

DDC targets a deterministic validator-based consensus model.

Working terms from the whitepaper:
- Diamond-DAG
- Proof of Efficiency (PoE)
- Delegated Performance-Based Delegation (DPD)

Current status:
- concept defined in whitepaper
- final validator algorithm not yet implemented
- final slashing, validator rotation and finality rules remain TODO(WP)

TODO(WP):
- validator eligibility rules
- staking requirements
- block/DAG object format
- finality rule
- validator scoring formula
- slashing conditions
- fork / conflict resolution
- network message protocol

## Data Layer Direction

DDC data layer is intended to support verifiable dataset references and provenance.

DDT is not a currency token. It is intended as a dataset-reference / access-right / provenance metadata object.

Current target functions:
- dataset registration
- provenance anchoring
- access/license metadata
- AI-training eligibility metadata
- usage accounting

Current status:
- conceptual model exists
- production data-layer contract/client not implemented

TODO(WP):
- dataset object schema
- DDT issuance rules
- DDT transfer restrictions
- dataset hash format
- off-chain storage requirements
- proof format
- revocation/update lifecycle
- marketplace interaction rules

## DDC / DDT Interaction

DDC:
- native network coin
- staking
- fees
- governance
- validator incentives

DDT:
- dataset reference token
- metadata / provenance / access rights
- non-financial protocol object

Interaction model:
- DDC pays for network execution and protocol fees
- DDT records data-related rights and metadata
- marketplace activity may generate DDC-denominated fees
- DDT does not represent profit-share, equity, or financial yield

TODO(WP):
- exact fee routing
- fee burn / treasury / validator split
- DDT mint/burn lifecycle
- DDT access control model
- bridge between marketplace events and protocol accounting

## AI Layer Boundary

AI is advisory only.

AI must not:
- execute transactions
- change balances
- select validators directly
- override consensus
- approve governance actions
- enforce protocol state

AI may:
- analyze network performance
- flag anomalies
- suggest optimizations
- provide non-binding governance inputs

## Roadmap Discipline

Presale v1 validates only the economic/distribution layer.

It does not prove:
- L1 consensus
- node operation
- validator decentralization
- data marketplace execution

The next technical milestone must be a minimal protocol prototype containing:
- node process
- P2P communication
- DAG/block object
- validator simulation
- transaction validation
- deterministic finality test
- local/private testnet

## Public Disclosure Rule

DDC must not describe the current BNB Testnet presale E2E as a DDC blockchain testnet.

Correct wording:
"BNB Testnet presale E2E."

Incorrect wording:
"DDC L1 testnet is live."

