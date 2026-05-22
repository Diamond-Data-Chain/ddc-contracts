# Diamond Data Chain — Smart Contracts

Official smart contract repository for the Diamond Data Chain (DDC) protocol.

## Overview

This repository contains:

- DDC presale contracts
- Treasury infrastructure contracts
- Reward pool integration
- Vesting contracts
- Deployment scripts
- Verification scripts
- Staging manifests
- Monitoring and operational runbooks

The contracts are built with:

- Solidity
- Hardhat
- ethers.js
- BNB Chain deployment flow

## Current Scope

Implemented infrastructure includes:

- Batch-based presale logic
- USDT purchase flow
- Reward pool reconciliation
- Vesting infrastructure
- Treasury payout vaults
- Pause/unpause controls
- Permissionless finalize flow
- Verification tooling
- Deployment manifests
- Monitoring configuration

## Repository Structure

contracts/ — Solidity smart contracts  
scripts/ — deployment and verification scripts  
test/ — automated contract tests  
docs/ — supporting documentation  

## Core Contracts

Primary production contracts:

- DDCPresaleVesting
- DDCVestingVault
- DDCRewardPool

Treasury infrastructure:

- DDCMonthlyOpsVault
- DDCAdamasGrantVault

## Development

Install dependencies:

npm install

Compile contracts:

npx hardhat compile

Run tests:

npx hardhat test

## Deployment Targets

Current deployment targets:

- BNB Chain Testnet (staging)
- BNB Chain Mainnet (post-freeze production)

## Operational Documentation

Repository includes:

- deployment runbooks
- monitoring architecture
- pause procedures
- defender setup
- verification scripts
- freeze manifests

## Security

Production ownership model:

- multisig-controlled administration
- permissionless finalize flow
- emergency pause support
- ABI freeze process for production releases

## Related Repositories

- ddc-web
- ddc-whitepaper

## Disclaimer

This repository contains infrastructure software and protocol contracts for the Diamond Data Chain ecosystem. Nothing in this repository constitutes investment advice, financial solicitation, or guarantees of future performance or value.

