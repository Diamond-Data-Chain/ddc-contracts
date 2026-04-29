# DDC Data Layer Schema v1

## Principle

Recorded data is not automatically true.

A data object becomes accepted only if it passes schema, provenance, replay, conflict and verification checks.

## Required Fields

- datasetId
- submitterId
- submitterType
- contentHash
- sourceRef
- timestamp
- schemaVersion

## Submitter Types

- human_kyc
- organization
- device
- qr_reader
- oracle_api
- onchain_contract
- ai_assisted

## Validation Rules

- same object hash cannot be submitted twice
- same datasetId cannot silently accept conflicting contentHash
- human_kyc requires kycRef
- device requires deviceSignature
- oracle_api requires oracleProof
- real_world_fact requires verificationRefs

## Status

This is a prototype schema and validation model.
It is not yet a production DDC data layer.
