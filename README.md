# Blob Transaction Demo

This project shows how to send and verify blobs on Ethereum

It creates mock blobs, KZG commitment and proof, and send them through a transaction type 3 on a smart contract that will verify them.

## Project structure

- `BlobTxDemo.sol`: Contract containing the logic to check the blobs on chain
- `tasks/commitAndVerifyBlob.ts`: Script creating the blobs and verification data, sending the transaction and collecting emitted events

[C-KZG library](https://github.com/ethereum/c-kzg-4844/blob/main/bindings/node.js/README.md) is used to create KZG commitments and proofs.

## Installation

The project uses Hardhat to compile and deploy the contract, as well as running the script.

You will also need Foundry to run the script localy as Anvil supports blob transaction better than Hardhat node.

Install Foundry if needed

> https://book.getfoundry.sh/getting-started/installation

Install packages

```bash
npm i
```

## Usage

### Locally

Run a local node

```bash
npm run node
```

Set your local private key from provided ones

```bash
npx hardhat vars set ANVIL_PRIVATE_KEY
```

Run the script (it will deploy the contract automatically)

```bash
npx hardhat commitAndVerifyBlob --blob-count <BLOB_COUNT> --network local
```

### On testnet

Holesky testnet is supported.

A verifier contract is already deployed there and used in config. If you to use it, you can skip the deploy and update config steps.

Set your private key, RPC and Etherscan API key

```bash
npx hardhat vars set HOLESKY_PRIVATE_KEY
npx hardhat vars set HOLESKY_RPC_URL
npx hardhat vars set ETHERSCAN_API_KEY
```

Deploy and verify the contract

```bash
npx hardhat ignition deploy ignition/modules/BlobTxDemo.ts --network holesky --verify
```

Update config with deployed address in `config/blobTxDemoAddress.json`

Run the script

```bash
npx hardhat commitAndVerifyBlob --blob-count <BLOB_COUNT> --network holesky
```
