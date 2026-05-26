# DDC Signer Security Policy

## Purpose

This document defines mandatory signer operational security rules for:
- multisig signers
- treasury operators
- timelock operators
- emergency responders

---

# 1. Mandatory Rules

Required for all production signers:

- hardware wallet mandatory
- no browser hot-wallet admin signing
- no seed phrase screenshots
- no cloud seed storage
- no plaintext seed backups
- no shared devices
- no public WiFi signing
- no remote desktop signing
- dedicated browser/profile preferred

---

# 2. Wallet Policy

Approved:
- Ledger
- Trezor

Not approved:
- browser-only hot wallets
- exchange wallets
- custodial wallets

---

# 3. Device Hygiene

Signer devices must:
- use disk encryption
- use strong OS password
- use updated OS/browser
- avoid unnecessary extensions
- avoid gaming/software piracy
- avoid shared family usage

---

# 4. Signer Separation

Recommended:
- geographically separated signers
- independent devices
- independent internet providers

Avoid:
- all signers in same room
- all signers on same machine
- all signers on same seed storage method

---

# 5. Recovery Procedure

If signer compromised:
1. freeze operations
2. notify all signers
3. pause protocol if needed
4. rotate compromised signer
5. verify Safe threshold
6. verify timelock ownership
7. archive incident evidence

---

# 6. Signing Rules

Before signing:
- verify target contract
- verify calldata
- verify chainId
- verify recipient
- verify amount
- verify timelock queue if applicable

Never sign:
- blind transactions
- unknown calldata
- unverified contracts
- rushed emergency requests without quorum

---

# 7. Treasury Rules

Treasury actions require:
- multisig approval
- tx archival
- post-execution verification

Never:
- move treasury from EOA
- bypass timelock without incident justification

---

# 8. Incident Severity

Critical:
- seed compromise
- signer malware
- unauthorized transaction
- unexpected ownership change

High:
- RPC spoof suspicion
- phishing attempt
- unexplained Safe proposal

