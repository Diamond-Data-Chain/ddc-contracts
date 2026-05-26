# DDC Mainnet Rehearsal Checklist

Purpose:
Simulate operational incidents and validate response procedures before mainnet launch.

---

# Scenario 1 — Multisig Ownership Verification

Goal:
Verify all production contracts are controlled by expected multisig/timelock.

Checks:
- verify owner()
- verify Safe signers
- verify threshold
- verify timelock owner
- verify no unexpected admin

PASS condition:
All ownership paths verified.

---

# Scenario 2 — Emergency Pause Drill

Goal:
Verify emergency pause works operationally.

Procedure:
1. execute pause()
2. verify buy blocked
3. verify claim unaffected
4. verify frontend reflects state
5. execute unpause()

PASS condition:
Pause flow deterministic.

---

# Scenario 3 — Finalize Rehearsal

Goal:
Simulate full finalize lifecycle.

Procedure:
1. verify finalizeFundingStatus()
2. execute finalize()
3. verify finalized == true
4. verify reward reconciliation
5. verify treasury balances
6. verify replay blocked

PASS condition:
Finalize irreversible and deterministic.

---

# Scenario 4 — RPC Failure Drill

Goal:
Verify frontend survives RPC outage.

Procedure:
1. disable primary RPC
2. verify fallback RPC activates
3. compare state consistency
4. verify no stale batch display

PASS condition:
Frontend remains operational.

---

# Scenario 5 — Signer Replacement Drill

Goal:
Verify compromised signer recovery procedure.

Procedure:
1. remove signer
2. add replacement signer
3. verify threshold integrity
4. verify timelock ownership intact

PASS condition:
Safe remains operational.

---

# Scenario 6 — Treasury Withdrawal Drill

Goal:
Verify treasury flow under multisig/timelock.

Procedure:
1. queue treasury action
2. verify timelock delay
3. execute after delay
4. archive tx hashes

PASS condition:
No direct instant treasury execution.

---

# Scenario 7 — Frontend State Consistency

Goal:
Verify frontend reflects chain state.

Checks:
- finalized state
- batch state
- claimable values
- reward balances
- rollover state

PASS condition:
Frontend state matches on-chain state.

