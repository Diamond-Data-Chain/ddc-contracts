# DDC Core Protocol v1.3

Status: consolidated protocol specification.

This document defines the DDC target protocol architecture and current implementation boundaries.

## 1. Current Status

Implemented today:

- BNB Testnet presale contracts
- fixed-supply DDC token
- vesting accounting
- treasury-controlled presale funds
- DDC-256 consensus prototype
- validator simulation
- mini-node prototype
- multi-node simulation
- network message-flow prototype
- reproducible test suite via `npm test`

Not implemented today:

- production DDC node software
- real peer-to-peer network
- live DDC L1 testnet
- validator runtime
- DAO execution layer
- DDT production lifecycle
- staking/reward contracts

Correct public wording:

DDC currently has an on-chain BNB Testnet presale layer and local protocol prototypes.

Incorrect public wording:

DDC L1 testnet is live.

## 2. Architecture

DDC consists of:

- economic layer
- DDC-256 consensus layer
- validator layer
- data validation layer
- DDT data object layer
- AI advisory layer
- governance layer

## 3. DDC-256 Consensus

DDC uses a 256-branch validation model.

A transaction or data object is final only when at least 67% of branches confirm it.

Calculation:

- total branches: 256
- 67% of 256 = 171.52
- required confirmations: 172

Finality rule:

confirmedBranches >= 172 => final  
confirmedBranches < 172 => not final

## 4. Branch Model

A branch is an independent validation path.

Each branch produces:

- branchId
- validatorId
- objectHash or blockHash
- status: confirmed / rejected / timeout
- signed attestation

Branches do not directly coordinate with each other.

## 5. Aggregator Model

The aggregator is not a trusted authority.

It only:

- collects signed branch attestations
- verifies signatures
- counts confirmations
- produces a proof root
- determines whether threshold is reached

Anyone must be able to recompute the aggregation.

Aggregator cannot:

- change votes
- lower the threshold
- override validators
- force finality

## 6. Validator Model

Validators are responsible for:

- validating assigned branches
- signing attestations
- participating in finality
- maintaining uptime
- following protocol rules

Initial validator requirements:

- minimum stake: 10,000 DDC
- uptime target: at least 95%
- validator key
- compatible node software
- early-phase KYC may be required

Validator assignment:

randomSeed = HASH(previousCheckpointHash, epochId, validatorSetRoot)

branchValidator = WeightedRandom(randomSeed, branchId, validatorSet)

Selection weight:

ValidatorStake / TotalStake

Validators cannot choose branches.

## 7. Finality

DDC targets deterministic finality.

A block/object is final when:

confirmedBranches >= 172

After finality:

- state must be reproducible from proofs
- rollback is not expected
- exceptions require explicitly defined governance/emergency process

Timeouts count as non-confirmations.

## 8. Attack Model

Security assumption:

malicious/faulty validation power remains below one third.

If faulty validators approach or exceed one third:

- finality may halt
- invalid state should not finalize unless threshold is reached
- system prefers no finality over false finality

Attack scenarios:

- double signing
- branch manipulation
- spam
- collusion
- data manipulation
- AI manipulation
- treasury compromise

Mitigations:

- deterministic branch assignment
- 172/256 threshold
- signed attestations
- proof roots
- slashing model
- challenge process
- multisig treasury in early phase
- DAO/timelock in future phase

## 9. Slashing Model

Minor fault:

- missed assignment
- incomplete proof
- low-severity downtime
- penalty: reward reduction or up to 5%

Major fault:

- invalid validation
- repeated downtime
- inconsistent result
- penalty: 20–50% and temporary removal

Critical fault:

- double signing
- proven collusion
- malicious finality attempt
- penalty: up to 100%, permanent removal, DAO review

Exact slashing math remains future implementation work.

## 10. Data Layer Principle

DDC must not treat every submitted statement as truth.

Recorded does not mean true.

Verified means the object passed defined validation rules and attestations.

DDC verifies:

- provenance
- signatures
- schema
- source consistency
- validator attestations
- dispute history

DDC does not claim to prove absolute truth in every real-world situation.

## 11. Data Object

A data object should include:

- datasetId
- submitter address / identity
- submitter type
- content hash
- metadata hash
- source reference
- timestamp
- license/access metadata
- validation status
- validator attestations
- dispute status

Raw data should generally remain off-chain.

The protocol stores hashes, proofs, metadata references and validation states.

## 12. Submitter Types

Supported submitter types:

- human submitter
- verified organization
- machine/device
- QR/barcode/NFC reader
- on-chain submitter
- oracle/API submitter
- AI-assisted submitter

Each submitter type has different trust assumptions and validation requirements.

A QR scan proves that a code was read. It does not automatically prove the physical object is genuine.

## 13. Verification Actors

Verification may involve:

- protocol validators
- domain validators
- source authorities
- challengers
- AI-assisted anomaly detection

No single actor can unilaterally mark data as final truth.

AI is advisory only.

## 14. Accuracy Pipeline

Layer 1: cryptographic verification  
Layer 2: schema verification  
Layer 3: source verification  
Layer 4: cross-reference verification  
Layer 5: validator attestation  
Layer 6: challenge period

## 15. Truth Levels

Level 0: submitted  
Level 1: recorded  
Level 2: format verified  
Level 3: source verified  
Level 4: validator verified  
Level 5: dispute-resistant

## 16. DDT Model

DDT is a structured data claim / dataset reference object.

DDT may represent:

- dataset reference
- provenance object
- access metadata
- license/access right
- validation state reference

DDT does not automatically mean that a dataset is true.

DDT is not equity, profit share or guaranteed yield.

## 17. DDC / DDT Interaction

DDC:

- network economic unit
- fees
- staking
- governance
- validator incentives

DDT:

- data reference object
- provenance/access metadata
- validation state object

DDC pays for execution and validation.

DDT represents data-related state.

## 18. Governance

Phase 1:

- 3-of-5 multisig controls treasury and contract ownership
- deployer must not remain final owner

Phase 2:

- validator onboarding
- timelock preparation
- governance contract preparation

Phase 3:

- DAO governance
- proposal → vote → timelock → execution

Multisig is an early security mechanism, not the final governance target.

## 19. AI Boundary

AI may:

- detect anomalies
- detect duplicates
- score risk
- assist classification
- recommend optimizations

AI must not:

- execute transactions
- move funds
- select validators directly
- override consensus
- approve governance
- finalize data truth

## 20. Roadmap Discipline

Phase 1:

- presale contracts
- BNB Testnet E2E
- protocol prototypes
- reproducible test suite

Phase 2:

- validator simulator expansion
- branch assignment proof
- data validation prototype
- local private network

Phase 3:

- node software
- real P2P
- validator client
- testnet explorer/logging

Phase 4:

- audited node software
- public testnet
- mainnet/TGE preparation
- DAO transition plan

## 21. Minimum Before Claiming DDC L1 Testnet

Required:

- node process
- P2P message layer
- 256-branch assignment implementation
- signed branch attestations
- deterministic aggregation proof
- validator registry
- local/private testnet
- data object schema
- DDT lifecycle spec
- reproducible attack tests

## 22. Final Definition

DDC is specified as a deterministic parallel validation protocol where:

- validation is distributed across 256 branches
- finality requires at least 172 confirmations
- validators are assigned through deterministic stake-weighted randomness
- aggregation is verifiable and non-trusted
- submitted data is not automatically treated as true
- data validity depends on provenance, schema, sources, attestations and challenges
- AI is advisory only
- early control uses multisig
- DAO transition is future phase

