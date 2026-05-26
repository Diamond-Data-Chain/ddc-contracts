
## 2026-05-26 — Invariant Presale Fuzz Check PASS

Scope:
- randomized USDT buys
- randomized time jumps
- batch transition attempts
- finalize attempts
- accounting invariant checks

Result:
- invariant_presale_fuzz_check.js passed
- handled expected reverts: above max, finalized
- no accounting invariant failure detected

Status:
PASS


## 2026-05-26 — Batch Boundary Attack Check PASS

Scope:
- buy immediately before batch boundary
- time jump across boundary
- advanceIfEnded execution
- buy immediately after boundary
- post-boundary accounting check
- finalize replay protection check

Result:
- batch advanced from #1 to #2
- pre-boundary buy accounted
- post-boundary buy accounted
- finalize replay blocked

Status:
PASS


## 2026-05-26 — Finalize Race Condition Check PASS

Scope:
- repeated batch time jumps
- advanceIfEnded attempts
- finalize attempts during transitions
- buy-after-finalize protection
- finalize replay protection
- reward pool balance validation

Result:
- finalize succeeded
- buy after finalize blocked
- finalize replay blocked
- reward pool received residual DDC

Status:
PASS


## 2026-05-26 — Reward Insolvency Simulation

Scope:
- intentionally underfunded presale DDC reserve
- finalize execution under insufficient DDC backing
- reward reconciliation dependency validation

Observed:
- buy path still operational
- finalize remained blocked
- reward pool reconciliation could not complete
- reward pool received zero residual

Conclusion:
Finalize currently requires full DDC funding consistency.
This is an operational solvency dependency, not an arbitrary finalize path.

Risk Classification:
MEDIUM (operational insolvency risk)

Mitigation:
- mandatory pre-launch funding verification
- finalizeFundingStatus() validation before production
- multisig operational checklist

Status:
EXPECTED FAIL


## 2026-05-26 — Vesting Conservation Invariant PASS

Scope:
- buyer purchase accounting
- TGE activation
- partial claim attempt
- claimed / claimable / locked conservation

Invariant:
claimed + claimable + locked <= vestingPrincipal

Result:
- invariant held for all tested users
- no vesting over-allocation detected

Status:
PASS


## 2026-05-26 — Global Vesting Conservation PASS

Scope:
- multiple buyers
- cumulative vestingPrincipal accounting
- totalBuyerPrincipal reconciliation
- post-TGE claim attempt
- totalClaimed bound check

Invariants:
- sum(user vestingPrincipal) == totalBuyerPrincipal
- totalClaimed <= totalBuyerPrincipal

Status:
PASS

