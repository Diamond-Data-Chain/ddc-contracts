# DDC Verification Commands

## BSC Testnet

### DDCToken
npx hardhat verify --network bscTestnet <DDC_ADDRESS> <OWNER_ADDRESS>

### DDCRewardPool
npx hardhat verify --network bscTestnet <REWARD_POOL_ADDRESS> <OWNER_ADDRESS> <DDC_ADDRESS>

### DDCPresaleVesting
npx hardhat verify --network bscTestnet <PRESALE_ADDRESS> \
<OWNER_ADDRESS> \
<DDC_ADDRESS> \
<USDT_ADDRESS> \
<REWARD_POOL_ADDRESS> \
<TREASURY_ADDRESS> \
<PRESALE_START> \
'[10000,10500,11000,11500,12000,12500,13000,13500,14000,14500,15000,15500,16000,16500,17000,17500,18000,18500,19000,19500,20000,20500,21000,21500,22000,22500,23000,23500,24000,24500,25000,25500,26000,26500,27000,27500,28000,28500,29000,29500]'

### DDCPresaleRecorder
npx hardhat verify --network bscTestnet <RECORDER_ADDRESS> <OWNER_ADDRESS> <OPERATOR_ADDRESS>

### TeamVault
npx hardhat verify --network bscTestnet <TEAM_VAULT_ADDRESS> \
<OWNER_ADDRESS> \
<DDC_ADDRESS> \
<BENEFICIARY_ADDRESS> \
<START_TIMESTAMP> \
<24_MONTH_DURATION>

### AdvisorsVault
npx hardhat verify --network bscTestnet <ADVISORS_VAULT_ADDRESS> \
<OWNER_ADDRESS> \
<DDC_ADDRESS> \
<BENEFICIARY_ADDRESS> \
<START_TIMESTAMP> \
<ADVISOR_DURATION>

---

## BSC Mainnet

Replace:
- bscTestnet → bsc
- testnet addresses → mainnet addresses

