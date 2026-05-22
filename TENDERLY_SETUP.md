# DDC Tenderly Setup

Tenderly purpose:
- transaction simulation
- revert debugging
- event alerts
- treasury monitoring
- pending/admin tx simulation

Tenderly supports alerts, webhooks, simulations, and monitoring workflows for smart contracts and wallets.

## Add contracts
Add the following BNB Testnet / BSC Mainnet contracts:

- DDCPresaleVesting
- DDCRewardPool
- DDCPresaleRecorder
- DDCMonthlyOpsVault
- DDCAdamasGrantVault
- Treasury Safe

## Alerts to configure

### Presale
- Purchased event
- Paused event
- Unpaused event
- PresaleFinished event
- RaisedFundsWithdrawn event
- failed tx to Presale
- successful tx to Presale

### Treasury Safe
- any USDT outgoing transfer
- any USDT incoming transfer
- Safe threshold change
- Safe signer change

### Payout vaults
- MonthlyClaim event
- GrantClaimed event
- balance change

### Recorder
- purchase record write
- writer change
- failed recorder tx

## Simulations
Before executing production admin tx:
- simulate pause
- simulate unpause
- simulate setTGE
- simulate ownership transfer
- simulate finalize
- simulate payout claim

## Incident workflow
If alert fires:
1. open tx trace
2. inspect decoded logs
3. compare expected state
4. verify Safe balance
5. follow INCIDENT_RUNBOOK.md
