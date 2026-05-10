
## 2026-05-10 — Finalize batch sync ordering fix

Issue:
- finalize() checked currentBatchId == TOTAL_BATCHES before _syncBatches()
- expired batches could not advance during finalize flow
- finalize execution test exposed real lifecycle failure

Resolution:
- moved _syncBatches() before final batch validation

Impact:
- finalize lifecycle now advances expired batches correctly
- finalize execution coverage added
- replay finalize protection verified
- reward residual distribution verified

Files:
- contracts/presale/DDCPresaleVesting.sol
- test/finalize_execution_check.js
- test/run_all.js

Commits:
- fff2e7d finalize lifecycle fix
- 8143023 deploy script constructor arguments fix

