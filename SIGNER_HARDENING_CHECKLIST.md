# DDC Signer Hardening Checklist

Purpose:
Verify operational signer security before mainnet launch.

---

# Signer Inventory

For each signer verify:

- [ ] signer identity confirmed
- [ ] hardware wallet initialized
- [ ] recovery phrase stored offline
- [ ] device dedicated/preferred
- [ ] disk encryption enabled
- [ ] browser updated
- [ ] unnecessary extensions removed
- [ ] phishing awareness confirmed
- [ ] Safe access verified
- [ ] signing flow tested

---

# Hardware Wallet Verification

Required:
- [ ] Ledger/Trezor firmware updated
- [ ] address verified on device screen
- [ ] chainId verified before signing
- [ ] transaction preview verified

Never:
- [ ] blind-sign unknown tx
- [ ] bypass address verification

---

# Multisig Verification

Verify:
- [ ] Safe threshold correct
- [ ] all signer addresses correct
- [ ] no unexpected signer present
- [ ] Safe ownership verified
- [ ] timelock ownership verified

---

# Recovery Drill

Verify:
- [ ] signer replacement procedure understood
- [ ] emergency contacts verified
- [ ] pause authority verified
- [ ] compromised signer procedure reviewed

---

# RPC Safety

Verify:
- [ ] primary RPC configured
- [ ] fallback RPC configured
- [ ] chain state cross-check procedure known

---

# Treasury Security

Verify:
- [ ] no EOA treasury control
- [ ] treasury tx archival procedure known
- [ ] timelock treasury flow verified

---

# Final Verification

Before mainnet launch:

- [ ] all signers available
- [ ] quorum verified
- [ ] rehearsal completed
- [ ] no unresolved incident
- [ ] no unresolved accounting warning

