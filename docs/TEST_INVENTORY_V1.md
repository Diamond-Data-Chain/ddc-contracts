# DDC Test Inventory v1

## Presale / Smart Contract

Covered:

- presale rule static checks
- USDT-only buy path
- txId replay protection
- min/max buy limits
- batch count and allocation checks
- deterministic batch rollover checks
- economic math checks
- finalize / treasury liveness checks

Relevant files:

- test/presale_rules_check.js
- test/presale_economic_math_check.js
- test/batch_rollover_timing_check.js
- test/finalize_liveness_check.js

## Script-Level Presale Operations

Covered:

- USDT approve
- buyWithUSDT
- buyer state check
- presale state check
- treasury/reward checks

Relevant files:

- scripts/buy_usdt_prod.js
- scripts/check_buyer_prod.js
- scripts/check_prod_state.js
- scripts/check_presale_treasury.js
- scripts/check_reward_presale_link.js
- scripts/fund_prod_presale.js
- scripts/deploy_prod.js

## Not Yet Covered for Presale E2E

Missing:

- frontend wallet connect
- WalletConnect v2 browser flow
- MetaMask / EIP-1193 browser flow
- UI approve + buy flow
- UI status update after purchase
- live BSC testnet deployed address validation

## Core / L1 / Runtime Tests

Covered:

- consensus attack checks
- validator fairness
- validator downtime
- validator signatures
- validator registry
- storage persistence
- fork choice
- slashing
- global slashing evidence
- evidence gossip
- stake economics
- stake-weighted consensus
- round-based consensus
- lock/unlock rules
- network gossip
- network attack simulation
- chaos simulation
- partition/fork/merge safety
- validator daemon runtime
- peer scoring / anti-eclipse
- async network runtime
- long-running daemon simulation
- real TCP P2P socket layer

Relevant files:

- test/consensus_attack_check.js
- test/validator_fairness_check.js
- test/validator_downtime_check.js
- test/validator_signature_check.js
- test/validator_registry_check.js
- test/storage_persistence_check.js
- test/fork_choice_check.js
- test/slashing_check.js
- test/slashing_evidence_check.js
- test/evidence_gossip_check.js
- test/stake_economics_check.js
- test/stake_weighted_consensus_check.js
- test/round_consensus_check.js
- test/lock_rules_check.js
- test/network_gossip_check.js
- test/network_attack_sim_check.js
- test/chaos_sim_check.js
- test/partition_fork_merge_check.js
- test/validator_daemon_check.js
- test/peer_scoring_check.js
- test/async_network_check.js
- test/long_running_daemon_check.js
- test/p2p_socket_node_check.js

## Current Priority

Return focus to presale E2E:

1. BSC testnet deploy
2. env/address config
3. frontend wallet connect
4. USDT approve + buy
5. on-chain UI status update
