
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


## 2026-05-26 — Finalize Irreversibility Invariant PASS

Scope:
- finalize execution
- post-finalize buy attempt
- post-finalize advance attempt
- finalize replay attempt
- batch immutability after finalize

Invariants:
- finalized state is one-way
- buy is blocked after finalize
- advance is blocked after finalize
- finalize replay is blocked
- current batch does not mutate after finalize

Status:
PASS


## 2026-05-26 — Timelock Execution Check PASS

Scope:
- deploy DDCTimelock
- transfer controlled contract ownership to timelock
- queue admin action
- block early execution
- execute after 24h delay

Result:
- early execution blocked
- delayed execution succeeded
- ownership transfer executed through timelock

Status:
PASS


## 2026-05-26 — Mainnet Rehearsal Scenario 1 PASS

Scenario:
Ownership verification

Verified:
- DDCPresaleVesting owner == DDC Treasury Safe
- DDCRewardPool owner == DDC Treasury Safe

Safe:
0x08cF1a271b5a05165bBac6D655dD351F7eD61F1f

Status:
PASS


## 2026-05-26 — Mainnet Rehearsal Scenario 2 PASS

Scenario:
Emergency pause state verification

Verified:
- DDCPresaleVesting paused == false
- DDCPresaleVesting owner == DDC Treasury Safe

Note:
Active pause/unpause execution requires Safe transaction execution.

Status:
PASS


## 2026-05-26 — Mainnet Rehearsal Scenario 3 PASS

Scenario:
Finalize readiness verification

Verified:
- finalized == false
- currentBatchId == 3
- totalRequired == actualBalance
- finalize funding status healthy

Status:
PASS


## 2026-05-26 — Linear Vesting Vault Check PASS

Scenario:
DDCLinearVestingVault behavior verification

Verified:
- early claim blocked
- unauthorized attacker claim blocked
- beneficiary claim succeeds
- linear vesting accounting valid
- claimed amount matches beneficiary balance

Result:
PASS


## 2026-05-27 — Deploy Dry-Run PASS

Scope:
- local hardhat deploy_prod.js execution
- total supply verification
- deterministic 256M allocation funding
- TeamVault deployment
- AdvisorsVault deployment
- RewardPool funding
- Foundation allocation funding
- Treasury allocation funding

Result:
- Expected Total Allocation == Actual Total Supply
- all allocation funding tx paths executed
- deploy script completed successfully

Status:
PASS


## 2026-05-27 — Staging Allocation Balance Check PASS

Scope:
- new BSC Testnet staging deployment
- full 256M DDC allocation verification
- Presale allocation
- RewardPool allocation
- Treasury/Foundation Safe allocation
- TeamVault allocation
- AdvisorsVault allocation

Result:
- Total checked == Total supply
- 256M DDC fully distributed deterministically

Status:
PASS

