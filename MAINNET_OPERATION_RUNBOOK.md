# DDC Mainnet Operation Runbook

## Purpose

This document defines the operational procedures for:
- presale launch
- multisig execution
- emergency handling
- finalize lifecycle
- treasury handling
- signer management
- RPC failure handling

---

# 1. Pre-Launch Checklist

Required before mainnet launch:

- [ ] contracts compiled from clean commit
- [ ] reproducible deployment verified
- [ ] BscScan verification complete
- [ ] multisig ownership verified
- [ ] timelock ownership verified
- [ ] production env verified
- [ ] RPC redundancy verified
- [ ] frontend production build verified
- [ ] testnet rehearsal completed
- [ ] signer hardware wallets verified
- [ ] recovery contacts verified
- [ ] treasury funding verified
- [ ] presale DDC funding verified
- [ ] finalizeFundingStatus() verified
- [ ] WalletConnect production verified

---

# 2. Signer Rules

Mandatory:
- hardware wallets only
- no browser hot-wallet admin usage
- no seed phrase screenshots
- no cloud seed storage
- separate devices preferred

Minimum signer policy:
- 3/5 multisig
- geographically separated signers

---

# 3. Emergency Pause Procedure

Conditions:
- active exploit
- accounting inconsistency
- RPC desync producing invalid UI state
- unexpected token movement
- finalize inconsistency

Procedure:
1. multisig initiates pause()
2. verify on-chain pause state
3. disable frontend buy UI
4. publish incident notice
5. freeze treasury movement
6. preserve logs and tx hashes

---

# 4. Finalize Procedure

Preconditions:
- batch 40 completed
- finalizeFundingStatus() healthy
- DDC funding verified
- no unresolved accounting incident
- no pending emergency pause

Procedure:
1. multisig review
2. execute finalize()
3. verify finalized == true
4. verify reward pool reconciliation
5. verify treasury balances
6. archive tx hashes

---

# 5. RPC Failure Procedure

If RPC becomes unstable:
- rotate to fallback RPC
- verify latest finalized block
- compare state across providers
- disable buy UI if state divergence detected

---

# 6. Signer Loss Procedure

If signer compromised:
1. freeze operations
2. rotate signer through multisig
3. re-verify quorum
4. publish operational update
5. verify timelock ownership integrity

---

# 7. Treasury Movement Rules

Rules:
- treasury movements logged
- multisig approval mandatory
- no direct EOA treasury control
- archive all treasury tx hashes

---

# 8. Post-Finalize Monitoring

Monitor:
- claim accounting
- reward pool balances
- treasury balances
- RPC consistency
- frontend stale-state issues
- unusual claim patterns

