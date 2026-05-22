# DDC Presale v1 Deploy Runbook

## Scope
Live presale v1, USDT-only.

## Deploy order
1. Deploy / confirm DDC token.
2. Deploy / confirm USDT address.
3. Deploy DDCRewardPool.
4. Deploy DDCPresaleVesting.
5. Link RewardPool to Presale with setPresaleOnce().
6. Fund Presale with required DDC reserve.
7. Deploy DDCPresaleRecorder.
8. Set Recorder writer.
9. Configure frontend env.
10. Run staging E2E.
11. Activate Safe when ready.
12. Transfer ownership to Treasury Safe.

## Treasury
- Presale receives USDT only.
- Auto sweep sends exact 10,000 USDT chunks to Treasury Safe.
- Residual below 10,000 USDT remains buffered.
- Treasury Safe is 3/5.

## Required frontend env
NEXT_PUBLIC_CHAIN_ID
NEXT_PUBLIC_RPC_URL
NEXT_PUBLIC_WC_PROJECT_ID
NEXT_PUBLIC_PRESALE_ADDRESS
NEXT_PUBLIC_USDT_ADDRESS
NEXT_PUBLIC_REWARD_POOL_ADDRESS
NEXT_PUBLIC_RECORDER_ADDRESS
NEXT_PUBLIC_PROJECT_KEY
NEXT_PUBLIC_TREASURY_ADDRESS

## E2E checklist
- Connect wallet.
- Correct chain.
- Read batch status.
- Read USDT balance.
- Approve USDT.
- Buy USDT.
- Verify Purchased event.
- Verify Recorder entry.
- Verify My DDC Token record.
- Verify Public DDC Token feed.
- Verify treasury sweep only after 10,000 USDT buffer.

## Ownership migration
Only after staging E2E:
- Presale owner -> Treasury Safe
- RewardPool owner -> Treasury Safe
- Recorder owner -> Treasury Safe
- Recorder writer -> relayer wallet or approved ops signer

## Emergency
- Pause blocks buy.
- Claim/vesting unaffected.
- Unpause only owner/Safe.

## Safe ownership transfer rehearsal

Current staging owner:
0xA94568bF1B50a06efDebc5846A1252410A65CA32

Target Safe:
0x08cF1a271b5a05165bBac6D655dD351F7eD61F1f

Owner-only functions:
- Presale: pause(), unpause(), setTGE(), transferOwnership()
- RewardPool: setPresaleOnce(), transferOwnership()
- Recorder: setWriter(), transferOwnership()

Planned production ownership:
- Presale owner -> Treasury Safe 3/5
- RewardPool owner -> Treasury Safe 3/5
- Recorder owner -> Treasury Safe 3/5
- Recorder writer -> approved relayer/ops signer

Rehearsal result:
- Ownership currently remains on deployer during staging.
- Safe transfer is intentionally NOT executed yet.
- Pause/unpause staging check passed.
- Auto-sweep to Treasury Safe address passed.
- Final transfer should be executed only after final frontend E2E and Safe activation.
