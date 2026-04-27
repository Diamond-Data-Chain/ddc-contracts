# DDC Security & Limitations

## Current Status

This repository contains:

- on-chain presale contracts (BNB Testnet)
- protocol specification (DDC-256)
- consensus prototype
- validator simulation
- mini-node prototype
- multi-node simulation
- network message flow prototype
- reproducible test suite (`npm test`)

---

## What is Tested

The following components are tested via `npm test`:

- contract compilation (Hardhat)
- DDC-256 consensus prototype
- validator simulation (normal / attack / downtime)
- mini-node finality behavior
- multi-node simulation
- network message flow

All tests verify:

- deterministic finality threshold (172/256)
- failure under adversarial conditions
- correct behavior under partial faults

---

## What is NOT Implemented

The following components are not yet implemented:

- DDC node software (real execution client)
- peer-to-peer networking (TCP/WebSocket)
- real validator network
- block propagation over network
- persistent state storage
- full mempool synchronization
- DAO governance contracts
- validator reward distribution
- DDT production lifecycle

---

## What is NOT Audited

- smart contracts are not formally audited
- consensus prototype is not audited
- validator simulation is not audited
- economic model is not audited

---

## Assumptions

The protocol currently assumes:

- less than 33% malicious validation power
- deterministic validator assignment correctness
- honest majority in normal conditions
- reproducible hashing and signature simulation

---

## Important Notes

- this repository is a prototype and research implementation
- it is not production-ready software
- it must not be used as a live financial system
- behavior is simulated and not executed on a real network

---

## Future Security Work

Planned:

- formal smart contract audit
- validator slashing specification refinement
- network-level attack simulation
- cryptographic proof standardization
- consensus formal verification (if applicable)

