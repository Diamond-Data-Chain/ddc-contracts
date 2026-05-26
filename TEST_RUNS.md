
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

