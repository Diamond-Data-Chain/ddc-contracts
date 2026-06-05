# BscScan Verify Procedure

npx hardhat verify --network bsc <DDC_TOKEN>

npx hardhat verify --network bsc <REWARD_POOL> \
<OWNER> \
<DDC_TOKEN>

npx hardhat verify --network bsc <PRESALE> \
<OWNER> \
<DDC_TOKEN> \
<USDT> \
<REWARD_POOL> \
<TREASURY> \
<PRESALE_START> \
<PRICES_ARRAY>

npx hardhat verify --network bsc <RECORDER> \
<OWNER> \
<WRITER>

Verify all contracts immediately after deployment.
