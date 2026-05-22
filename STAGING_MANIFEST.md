# DDC Staging Manifest

Network: BNB Testnet
Chain ID: 97

Treasury Safe:
0x08cF1a271b5a05165bBac6D655dD351F7eD61F1f

Contracts:
DDC: 0xc79C38f01B6845cca08886bEa7f234525D597cfA
USDT: 0x225064Ea7c9077763059AE8C22553790F6f4661c
DDCRewardPool: 0xF9e6629025a36818cFb8371af75eFa4394a1d8B9
DDCPresaleVesting: 0xC4b27D4aF9008930405CF4fdEA4D7EB07f543C7b
DDCPresaleRecorder: 0xEa154Aea5B9D6D0De50A0E796E84054191fd2ecC

E2E Buy:
Buyer: 0xA94568bF1B50a06efDebc5846A1252410A65CA32
Approve tx: 0x36d2409c095e51c1bf08d2bcb0a37881ea378fb7d41e90b5af90cf68124c705f
Buy tx: 0x0be1ff02e12880cd25707234b2c180cb8223b5330f785e22b6e8a8f503fc95c3
Purchased: 10000 DDC
Locked: 5000 DDC
Claimable: 0
TGE: 0

Frontend:
Build: PASS
My DDC Token: PASS
Public DDC Token autoload: PASS
RewardPool status ABI: PASS
Finalize status ABI: PASS

Status:
staging E2E: PASS

Staging pause check:
Pause tx: 0xbd7a66bc135f50eb21a600a63cff56405bebef098359da3cbe2fb8e5866e1b28
Unpause tx: 0x93c155c76bf72f3e028233472b2cd7a6a406f55298809e2991cdd69123b1cf0a
Result: PASS

Staging auto-sweep check:
Buyer1: 0xA94568bF1B50a06efDebc5846A1252410A65CA32
Buyer2: 0xc89BA85A4ca0190c7ab7437D4DCa2986Fb3d95ed
Buy1 tx: 0xe91c41aed05e44292c900b3ee2ebe2583eac0c5c327a22d1239b09a92587a27e
Buy2 tx: 0x009b48360ae3a2694f9118ccb7ce43ff9266ff2c0cc4ee7528ae442a2c12c6cf
Presale USDT before: 100.0
Treasury USDT before: 0.0
Presale USDT after: 0.0
Treasury USDT after: 10000.0
Treasury delta: 10000.0
Result: PASS

Staging recorder sync:
Tx1: 0xe91c41aed05e44292c900b3ee2ebe2583eac0c5c327a22d1239b09a92587a27e
Buyer1 DDC: 490000.0
Buyer1 paid: 4900.0 USDT

Tx2: 0x009b48360ae3a2694f9118ccb7ce43ff9266ff2c0cc4ee7528ae442a2c12c6cf
Buyer2 DDC: 500000.0
Buyer2 paid: 5000.0 USDT

Recorder sync result: PASS

Safe ownership transfer rehearsal:
Current owner: 0xA94568bF1B50a06efDebc5846A1252410A65CA32
Target Safe: 0x08cF1a271b5a05165bBac6D655dD351F7eD61F1f
Actual transfer executed: NO
Reason: Safe 3/5 activation intentionally deferred until final launch readiness.
Result: DOCUMENTED / PENDING FINAL EXECUTION

BscScan verification:
DDCToken:
https://testnet.bscscan.com/address/0xc79C38f01B6845cca08886bEa7f234525D597cfA#code

DDCRewardPool:
https://testnet.bscscan.com/address/0xF9e6629025a36818cFb8371af75eFa4394a1d8B9#code

DDCPresaleVesting:
https://testnet.bscscan.com/address/0xC4b27D4aF9008930405CF4fdEA4D7EB07f543C7b#code

DDCPresaleRecorder:
https://testnet.bscscan.com/address/0xEa154Aea5B9D6D0De50A0E796E84054191fd2ecC#code

DDCMonthlyOpsVault:
https://testnet.bscscan.com/address/0xF23563841d40d00DE14c80b4798f741cDb20d0C1#code

DDCAdamasGrantVault:
https://testnet.bscscan.com/address/0xe1cb2a83B71562636F01c17Bb66970AE9d4a5968#code

Verification result: PASS
