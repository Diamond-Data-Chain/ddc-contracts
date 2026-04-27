# DDC Multisig Deployment Policy

## Rule

Production deployment MUST use a 3-of-5 multisig as:

- Presale owner
- RewardPool owner
- Treasury address

No single EOA may remain the final production owner.

## Required Post-Deploy Steps

After deployment:

1. Deploy contracts
2. Set RewardPool presale link if required
3. Fund Presale with DDC allocation
4. Transfer Presale ownership to 3-of-5 multisig
5. Transfer RewardPool ownership to 3-of-5 multisig
6. Verify owner() on-chain
7. Publish owner/treasury verification result

## Controlled Functions

The multisig controls:

- pause()
- unpause()
- setTGE()
- withdrawRaisedFunds()

## Treasury Rule

All raised USDT must flow only to the registered treasury multisig.

Operational, Adamas, development or other expense wallets must not receive direct presale withdrawals unless registered in treasury policy and executed through the approved treasury process.

## DAO Transition

The multisig is an early-stage security control.

Long-term control is intended to transition to DAO/timelock governance after:

- DDC network is live
- validator set is stable
- DAO contracts are implemented and audited
- treasury policy execution is tested
