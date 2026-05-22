# DDC Alert Matrix

| Severity | Trigger | Action |
|---|---|---|
| P0 | Treasury Safe unexpected outgoing transfer | Pause, verify Safe, publish internal incident |
| P0 | Presale owner changed unexpectedly | Pause if possible, verify Safe, incident call |
| P0 | Safe signer/threshold changed unexpectedly | Freeze admin ops, Safe review |
| P0 | Unauthorized setTGE/finalize | Pause, forensic review |
| P1 | Autosweep failed | Check Presale USDT balance, simulate next buy |
| P1 | Recorder desync | Stop relayer, rebuild from tx hashes |
| P1 | Frontend contract address mismatch | Pull frontend, correct env, redeploy |
| P1 | Failed buy spike | Check RPC, contract state, allowance issues |
| P2 | RPC outage | switch RPC provider |
| P2 | UI display mismatch | compare direct chain state |
| P2 | delayed public feed | manual recorder sync |
