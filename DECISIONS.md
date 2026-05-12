
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


## 2026-05-12 — Recorder sync strategy for v1

Issue:
- BSC testnet RPC used in staging rejects eth_getLogs requests with "limit exceeded"
- This affects both wide event scanning and single-block polling

Decision:
- DDCPresaleRecorder remains the on-chain audit mirror
- Presale contract remains source-of-truth and emits Purchased events
- For v1 staging, recorder sync uses known buy transaction hashes via sync_recorder_from_txhashes.js
- Realtime event relayer is deferred until a reliable RPC/indexer provider is configured

Impact:
- /my-record and /public-ddc-token work from recorder storage
- Historical records can be backfilled by tx hash
- Buy flow remains uncoupled from recorder external calls

Files:
- contracts/DDCPresaleRecorder.sol
- scripts/sync_recorder_from_txhashes.js
- scripts/recorder_relayer.js
- app/my-record/page.tsx
- app/public-ddc-token/page.tsx

