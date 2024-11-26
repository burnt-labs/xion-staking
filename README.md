# XION Staking & Governance

A proof of concept application to stake tokens in XION, using the native
authentication via the dashboard.

## Development

The only dependency to run the project locally is Node.js. It has been tested
with Node.js v20. Once you have it installed, you can run:

```bash
npm install

npm run dev
```

It integrates the `@burnt-labs/abstraxion` library from
[xion.js](https://github.com/burnt-labs/xion.js).

The main part of the business logic that queries and interacts with XION
is in:

- [./src/features/staking/lib](./src/features/staking/lib)


## Setting up a proposal to test voting
You can make a new proposal to test voting with the following commands:

`xiond tx gov draft-proposal`


and choose text and then fill in details. Make sure the deposit is at least 10000000uxion for a slow proposal

Then submit with

`xiond tx gov submit-proposal draft_proposal.json --node https://rpc.xion-testnet-1.burnt.com:443 --from xion-testnet-faucet --chain-id xion-testnet-1 --gas auto --gas-adjustment 1.1`
