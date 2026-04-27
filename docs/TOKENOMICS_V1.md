# DDC Tokenomics & Data Flow (v1)

## Scope

This document defines:

- DDC economic role
- DDT data role
- fee flow
- validator incentives (future)
- system boundaries

---

## DDC (Core Token)

DDC is the core economic unit of the protocol.

Functions:

- transaction fees
- validator staking (future)
- validation incentives (future)
- governance (future)
- network security

DDC is NOT:

- equity
- profit share
- guaranteed yield instrument

---

## DDT (Data Token / Object)

DDT represents structured data objects and dataset references.

DDT is used for:

- dataset identification
- provenance tracking
- validation state linking
- access metadata

DDT is NOT:

- a financial asset
- a claim on profits
- a guaranteed revenue source

---

## DDC ↔ DDT Interaction

DDC is used to:

- pay for data submission
- pay for validation
- pay for execution

DDT is used to:

- represent data
- track validation state
- reference datasets

Flow:

User → submits data → pays fee (DDC)  
→ data recorded → DDT created  
→ validators verify → DDT state updated  

---

## Fee Flow (Target Model)

Fees are split between:

- validators
- treasury
- burn mechanism

Example (future model):

- 60% validators
- 20% treasury
- 20% burn

Dynamic burn phases apply as defined in protocol spec.

---

## Presale (Current State)

Current implementation includes:

- on-chain presale (BNB Testnet)
- vesting model
- treasury-controlled funds
- no reward distribution active

---

## Validator Rewards (Future)

Planned:

- rewards from fees
- rewards from validation
- potential delegation model

Not implemented yet.

---

## Economic Boundaries

System does NOT guarantee:

- token price
- demand
- profit
- liquidity

System DOES guarantee:

- transparent accounting
- deterministic rules
- on-chain verifiability (where implemented)

---

## Current Limitations

- no live validator rewards
- no staking active
- no DDT marketplace
- no DAO governance

---

## Future Work

- full validator incentive model
- staking implementation
- DDT lifecycle (mint / transfer / revoke)
- fee routing contracts
- DAO-controlled economics

