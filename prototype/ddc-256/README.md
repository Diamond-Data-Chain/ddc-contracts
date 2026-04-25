# DDC-256 Branch Validation Prototype

This is a local prototype simulator for the DDC-256 Branch Validation Model.

It is NOT node software and does NOT represent a live DDC blockchain testnet.

## What it demonstrates

- 256 validation branches
- 67% confirmation threshold
- minimum required confirmations: 172
- valid / invalid transaction outcome
- timeout and rejection scenarios

## Run

node prototype/ddc-256/ddc256_simulator.js normal
node prototype/ddc-256/ddc256_simulator.js weak
node prototype/ddc-256/ddc256_simulator.js attack
node prototype/ddc-256/ddc256_simulator.js high_timeout

## Interpretation

A transaction is valid only if at least 172 of 256 branches confirm it.

## Protocol Prototype

The extended prototype demonstrates:

- validator registry
- stake-weighted deterministic branch assignment
- 256 branch validation
- signed branch attestations
- aggregation proof root
- 172/256 finality threshold
- basic data-object schema validation

Run:

node prototype/ddc-256/ddc256_protocol_prototype.js normal
node prototype/ddc-256/ddc256_protocol_prototype.js attack
node prototype/ddc-256/ddc256_protocol_prototype.js timeout
