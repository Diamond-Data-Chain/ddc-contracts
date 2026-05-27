# DDC Mainnet Launch Checklist

## 1. Contract Deployment
- [ ] Deploy DDCToken
- [ ] Deploy DDCRewardPool
- [ ] Deploy DDCPresaleVesting
- [ ] Deploy DDCPresaleRecorder
- [ ] Deploy TeamVault
- [ ] Deploy AdvisorsVault

---

## 2. Genesis Allocation Verification
- [ ] Verify totalSupply == 256M
- [ ] Verify Presale allocation == 102.4M
- [ ] Verify RewardPool allocation == 51.2M
- [ ] Verify Foundation allocation == 38.4M
- [ ] Verify Treasury allocation == 19.2M
- [ ] Verify TeamVault allocation == 32M
- [ ] Verify AdvisorsVault allocation == 12.8M
- [ ] Run check_allocation_balances.js
- [ ] Confirm total checked == totalSupply

---

## 3. Ownership & Multisig
- [ ] Verify current deployer owner
- [ ] Transfer ownership to Safe 3/5
- [ ] Verify ownership transfer on-chain
- [ ] Verify pause/unpause permissions
- [ ] Verify signer hardware wallets
- [ ] Verify signer recovery procedures

---

## 4. Frontend Production Environment
- [ ] Set NEXT_PUBLIC_CHAIN_ID=56
- [ ] Set NEXT_PUBLIC_PRESALE_ADDRESS
- [ ] Set NEXT_PUBLIC_DDC_TOKEN_ADDRESS
- [ ] Set NEXT_PUBLIC_REWARD_POOL_ADDRESS
- [ ] Set NEXT_PUBLIC_TEAM_VAULT_ADDRESS
- [ ] Set NEXT_PUBLIC_ADVISORS_VAULT_ADDRESS
- [ ] Set NEXT_PUBLIC_USDT_ADDRESS
- [ ] Set NEXT_PUBLIC_RPC_URL
- [ ] Verify WalletConnect project ID
- [ ] Redeploy production frontend

---

## 5. Explorer Verification
- [ ] Verify DDCToken source on BscScan
- [ ] Verify DDCRewardPool source
- [ ] Verify DDCPresaleVesting source
- [ ] Verify DDCPresaleRecorder source
- [ ] Verify TeamVault source
- [ ] Verify AdvisorsVault source

---

## 6. Operational Monitoring
- [ ] Verify owner() monitoring
- [ ] Verify paused() monitoring
- [ ] Verify finalized() monitoring
- [ ] Verify allocation balances
- [ ] Verify RPC redundancy
- [ ] Verify frontend availability

---

## 7. Final Presale Smoke Test
- [ ] WalletConnect connect
- [ ] MetaMask connect
- [ ] Buy with BNB
- [ ] Buy with USDT
- [ ] Verify on-chain accounting
- [ ] Verify frontend status updates
- [ ] Verify explorer transactions

---

## 8. Launch Discipline
- [ ] Freeze contracts
- [ ] Freeze frontend env
- [ ] Freeze deployment scripts
- [ ] No additional feature changes
- [ ] Public review window completed
- [ ] Mainnet launch approval recorded

