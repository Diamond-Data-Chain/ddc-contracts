# DDC Production Freeze Discipline

## Purpose

This document defines the production freeze rules before presale launch.

The goal is to prevent:
- last-minute feature creep
- unreviewed accounting changes
- ABI drift
- deployment confusion
- launch-time operational mistakes

---

# Freeze Rules

## 1. No Core Accounting Changes

Frozen:
- DDCPresaleVesting accounting
- vesting math
- claim math
- finalize lifecycle
- rollover logic
- replay protection
- allocation totals
- RewardPool reconciliation

Any change requires:
- new invariant run
- new TEST_RUNS entry
- external review
- launch delay decision

---

## 2. No ABI Changes

Frozen ABI targets:
- DDCPresaleVesting
- IDDCPresaleVesting
- DDCRewardPool
- DDCToken
- DDCLinearVestingVault

Allowed:
- documentation
- scripts
- monitoring
- frontend text/FAQ fixes

Not allowed:
- function signature changes
- storage layout changes
- event changes
- constructor argument changes

---

## 3. No Tokenomics Changes

Frozen:
- total supply: 256,000,000 DDC
- Public Presale: 102.4M
- Reward Pool: 51.2M
- Foundation: 38.4M
- Treasury: 19.2M
- Team: 32M
- Advisors: 12.8M

---

## 4. Allowed Changes During Freeze

Allowed:
- verification docs
- monitoring scripts
- typo fixes
- FAQ/content fixes
- deployment evidence
- external review notes
- runbook improvements

---

## 5. Launch Gate

Before mainnet launch:

- [ ] TEST_RUNS.md current
- [ ] allocation check PASS
- [ ] deploy dry-run PASS
- [ ] BscScan verification plan ready
- [ ] Safe signer verification complete
- [ ] frontend env freeze complete
- [ ] public review window complete
- [ ] final launch approval recorded

---

# Final Rule

If a proposed change touches accounting, vesting, allocation, finalize, or ABI:

DO NOT merge without full revalidation.

