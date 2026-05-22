# DDC Monitoring Architecture

## Goal
Detect presale, treasury, ownership, recorder, frontend, and payout-vault anomalies early.

## Tools
Primary:
- Tenderly Alerts + Simulations
- OpenZeppelin Defender / OpenZeppelin Monitor

Optional later:
- Grafana dashboard
- custom webhook collector

## Monitored contracts
- DDCPresaleVesting
- DDCRewardPool
- DDCPresaleRecorder
- DDCMonthlyOpsVault
- DDCAdamasGrantVault
- Treasury Safe

## Critical alerts

### Presale
- Purchased event
- Paused / Unpaused
- PresaleFinished
- RaisedFundsWithdrawn
- failed buyWithUSDT tx
- abnormal buy spike
- ownership transfer

### Treasury
- any USDT transfer out of Treasury Safe
- any incoming autosweep
- monthly payout claim
- Adamas grant claim
- unexpected vault balance change

### Recorder
- writer changed
- global purchase count changed
- recorder write failure
- mismatch between presale tx and recorder record

### Ownership
- owner changed on Presale
- owner changed on RewardPool
- owner changed on Recorder
- Safe signer/threshold changed

### Frontend / RPC
- env mismatch
- RPC outage
- contract read failure
- wrong chain ID

## Required notification channels
- email
- Telegram/Discord/Slack
- emergency phone/manual escalation

## Response severity

P0:
- treasury drain
- ownership mismatch
- signer compromise
- exploit suspicion

P1:
- failed autosweep
- failed buy flow
- recorder desync
- frontend compromise

P2:
- RPC instability
- delayed recorder sync
- UI display mismatch

## Rule
No unpause or recovery action without:
- tx hash review
- Safe balance review
- ownership review
- frontend integrity review
