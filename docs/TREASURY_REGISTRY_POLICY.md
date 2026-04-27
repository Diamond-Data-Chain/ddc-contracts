# DDC Treasury Registry Policy

## Purpose

Treasury transparency requires more than showing balances.

Every treasury destination must be registered with:

- wallet address
- role
- active/inactive status
- purpose
- ownership/control proof
- update history

## Standard Roles

Allowed role categories:

- TREASURY
- OPERATIONS
- DEVELOPMENT
- MARKETING
- LIQUIDITY
- PAYROLL
- ADAMAS
- CEX
- OTHER

## Undeclared Wallet Rule

Transfers to undeclared wallets are non-compliant.

A wallet used for Adamas, operational costs or project expenses must be registered before use.

## Required Outflow Metadata

Every treasury outflow should include:

- destination wallet
- role
- purpose
- amount
- transaction hash
- approval reference
- reporting period

## Implementation Status

Presale v1 enforces that funds can only move to the immutable treasury address.

Full treasury registry enforcement is a future phase and must not be claimed as implemented until the registry/execution layer exists.
