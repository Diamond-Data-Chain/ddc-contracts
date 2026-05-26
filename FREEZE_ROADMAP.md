# DDC Freeze Roadmap

Purpose:
Define which protocol components are considered frozen/stable and which areas remain upgradeable.

---

# Phase Classification

## Phase A — Core Accounting Freeze

Status:
ACTIVE

Frozen components:

- DDCPresaleVesting accounting logic
- vesting allocation math
- claim accounting
- finalize lifecycle
- replay protection
- rollover accounting
- RewardPool reconciliation assumptions

Rules:
- no silent accounting modifications
- no storage layout mutation
- no changing finalized semantics
- no changing vesting conservation assumptions

Any modification requires:
- invariant re-validation
- adversarial review
- changelog update
- new deployment review

---

## Phase B — Operational Hardening

Allowed:
- multisig improvements
- timelock improvements
- monitoring
- frontend RPC failover
- operational tooling
- documentation
- observability

These changes must NOT:
- alter accounting
- alter vesting state
- alter finalize semantics

---

## Phase C — UI/Frontend Evolution

Allowed:
- UX improvements
- performance optimizations
- analytics
- additional monitoring views

Forbidden:
- local accounting math divergence
- frontend-derived balances
- client-side allocation logic

Frontend must remain:
- thin-client
- chain-derived
- readonly for critical accounting

---

## Phase D — Governance Evolution

Future optional phase:
- DAO governance
- protocol voting
- advanced treasury governance

NOT part of current production readiness scope.

---

# Freeze Philosophy

The protocol should evolve by:
- operational hardening
- monitoring
- verification
- governance discipline

NOT by:
- continuous accounting rewrites
- ad-hoc state mutations
- emergency feature additions

---

# Critical Freeze Targets

The following invariants are considered critical:

- vesting conservation
- global vesting conservation
- finalize irreversibility
- replay protection
- deterministic rollover
- treasury solvency assumptions

Any modification impacting these areas requires:
- full invariant rerun
- independent review
- deployment reassessment

