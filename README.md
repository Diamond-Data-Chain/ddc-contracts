
## Ownership & Treasury Policy

Production deployment MUST follow strict multisig control.

- The `owner` of DDCPresaleVesting MUST be a 3-of-5 multisig wallet.
- The `owner` of DDCRewardPool MUST be transferred to the same multisig after `setPresaleOnce`.
- The `treasury` address MUST be the same 3-of-5 multisig wallet.

This ensures:

- no single point of failure
- no unilateral control over funds or critical functions
- all sensitive actions require multisig approval

### Controlled Functions

The multisig exclusively controls:

- `pause()` / `unpause()`
- `setTGE()`
- `withdrawRaisedFunds()`

### Notes

- The deployer (Adamas System Architect) is NOT the final owner.
- Ownership MUST be transferred to multisig immediately after deployment.
- TGE will be set only once, via multisig, when the DDC network launch date is known.


## Trust Model

The DDC Presale v1 is designed to minimize trust assumptions and eliminate unilateral control.

### Core Principles

- No single actor can control funds or critical contract behavior.
- All sensitive actions are governed by multisig consensus.
- Smart contracts enforce deterministic behavior wherever possible.

### Ownership

- The `owner` of all production contracts MUST be a 3-of-5 multisig wallet.
- The deployer has no permanent control and must transfer ownership immediately after deployment.
- The multisig acts as the sole administrative authority.

### Treasury Control

- All raised funds are either:
  - automatically swept to treasury, or
  - withdrawable only by the treasury address
- The treasury MUST be a 3-of-5 multisig wallet
- No contract allows arbitrary fund redirection

### Presale Guarantees

- Token supply is fixed at deployment
- No post-deploy minting is possible
- No manual batch manipulation exists
- No hidden admin functions or override paths

### Vesting & TGE

- Vesting is fully on-chain and deterministic
- No tokens are claimable before TGE
- TGE can be set only once and only by multisig
- No retroactive changes to vesting are possible

### Reward System (v1 Scope)

- RewardPool does not distribute rewards in v1
- No manual reward payout exists
- Reward logic is reserved for future network phase

### Security Summary

- No rug-pull vector via admin privileges
- No mint exploit possible
- No fund redirection outside treasury
- No upgradeability backdoors

### Limitations

The following are intentionally NOT implemented in Presale v1:

- DDC network activation (TGE execution layer)
- Validator reward distribution
- Team/Advisor token release systems
- Treasury operational automation

These components will be implemented in future protocol phases.


## Future DAO Transition

Production control starts with a 3-of-5 multisig for security during presale and early launch.

After the DDC network is live and governance infrastructure is ready, administrative authority is intended to transition from multisig control to DAO governance.

DAO transition is not part of Presale v1 and will be implemented in a future protocol phase.
