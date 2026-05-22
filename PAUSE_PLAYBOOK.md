# DDC Pause Playbook

Purpose:
Emergency response procedure for presale incidents.

Scope:
- DDCPresaleVesting
- Treasury Safe
- Recorder
- Treasury vaults
- Frontend

## Authorized emergency actors

Current:
- deployer owner wallet

Production:
- Treasury Safe 3/5

## Pause conditions

Trigger pause immediately if:

- unexpected treasury movement
- abnormal buy activity
- replay anomaly
- frontend compromise
- RPC poisoning suspicion
- signer compromise
- accounting mismatch
- exploit suspicion
- unauthorized ownership change
- unexpected finalize behavior

## Immediate actions

1. Pause presale contract.
2. Verify Treasury Safe balances.
3. Verify ownership addresses.
4. Freeze frontend deploys.
5. Disable public announcements until verification complete.
6. Snapshot:
   - current batch
   - total sold
   - treasury balances
   - reward balances
   - recorder latest entries

## Verification checklist

- owner unchanged
- treasury unchanged
- rewardPool unchanged
- recorder writer unchanged
- no abnormal transfers
- no unexpected approvals
- no unauthorized finalize

## Recovery rules

Unpause ONLY after:
- root cause identified
- treasury verified
- ownership verified
- signer integrity verified
- frontend integrity verified

## Communication rules

Never:
- speculate publicly
- estimate losses before verification
- expose signer details

Always:
- publish verified facts only
- publish tx hashes
- publish recovery status
