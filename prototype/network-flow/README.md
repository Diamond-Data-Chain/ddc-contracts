# DDC Network Message Flow Prototype

Local message-flow prototype.

It is not real P2P networking and not a live DDC testnet.

## Demonstrates

- node A proposes block
- node B/C receive block proposal
- receiving nodes validate across 256 branches
- signed branch attestations are produced
- aggregator computes finality proof
- attack scenario fails finality

## Run

node prototype/network-flow/ddc_network_flow.js normal
node prototype/network-flow/ddc_network_flow.js attack
node prototype/network-flow/ddc_network_flow.js timeout
