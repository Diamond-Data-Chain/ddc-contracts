# DDC OpenZeppelin Defender / Monitor Setup

Purpose:
- operational contract monitoring
- admin proposal workflow
- Safe-based execution support
- automated alerting

OpenZeppelin Defender/Monitor provides contract monitoring and alerting for contract risks, behavior, and anomalies.

## Contracts to register
- DDCPresaleVesting
- DDCRewardPool
- DDCPresaleRecorder
- DDCMonthlyOpsVault
- DDCAdamasGrantVault
- Treasury Safe

## Monitors

### Presale monitor
Events:
- Purchased
- Paused
- Unpaused
- PresaleFinished
- RaisedFundsWithdrawn

Functions:
- buyWithUSDT
- pause
- unpause
- setTGE
- finalize

### Ownership monitor
Check:
- owner()
- recorder writer()
- Safe threshold
- Safe owners

### Treasury monitor
Check:
- USDT balance on Presale
- USDT balance on Treasury Safe
- USDT balance on payout vaults

### Failure monitor
Alert on:
- reverted buyWithUSDT
- reverted finalize
- reverted claim
- reverted payout claim

## Admin workflow
Production admin actions should be executed via Safe 3/5:
- pause
- unpause
- setTGE
- ownership transfer
- emergency operations

## Rule
Defender must not become a privileged owner.
Safe remains the authority.
