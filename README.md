# Poly Flashloan Bot

![test](https://github.com/yuichiroaoki/poly-flashloan-bot/actions/workflows/node.js.yaml/badge.svg)

An open source flashloan bot on polygon network

[Documentation](https://github.com/yuichiroaoki/poly-flashloan-bot/wiki)

Note: This bot just demonstrates how you can run a flashloan bot on polygon and is not designed to make profits ([Reasons why my flashloan bot didn't work](https://youtu.be/JYKuNp4D2Ig)).

## Prerequisites

This flashloan bot works with [the smart contract](https://github.com/yuichiroaoki/poly-flash/blob/main/contracts/Flashloan.sol).

You need to deploy your own smart contract on polygon mainnet if you want to run this bot.

## Installation

### 1. Install [Node.js](https://nodejs.org/en/) & [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable), if you haven't already.

### 2. Clone This Repo

Run the following command.

```bash
$ git clone https://github.com/yuichiroaoki/poly-flashloan-bot.git
$ cd poly-flashloan-bot
```

## Quickstart

### 1. Setup Environment Variables

You'll need an ALCHEMY_POLYGON_RPC_URL environment variable. You can get one from [Alchemy website](https://alchemy.com/?r=33851811-6ecf-40c3-a36d-d0452dda8634) for free.

Then, you can create a .env file with the following.

```
ALCHEMY_POLYGON_RPC_URL='<your-own-alchemy-polygon-mainnet-rpc-url>'
```

If you want to execute flashloan on the polygon mainnet, you need to add your PRIVATE_KEY environment variable as well, [with a private key from your wallet](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).

```
PRIVATE_KEY='your-PRIVATE_KEY'
```

\*Note: If using metamask, you'll have to add a `0x` to the start of your private key)

### 2. Install Dependencies

Run the following command.

```bash
yarn install
```

### 3.Build

```bash
yarn build
```

### 4. Run Bot

```bash
yarn start
```

## Configuration

Edit [src/config.ts](https://github.com/yuichiroaoki/poly-flashloan-bot/blob/main/src/config.ts)

[Optimal Bot Configuration](https://github.com/yuichiroaoki/poly-flashloan-bot/wiki/Optimal-Bot-Configuration)

If you have deployed your own contract, replace `flashloan address` to your deployed smart contract address.

```typescript
export const flashloanAddress = "<your-deployed-contract-address>";
```

Note: If you update the flashloan smart contract, you need to replace [this ABI](https://github.com/yuichiroaoki/poly-flashloan-bot/blob/main/src/abis/Flashloan.json) to the new one.

## ABI

This flashloan bot uses an ABI from [this flashloan smart contract](https://github.com/yuichiroaoki/poly-flash/blob/main/contracts/Flashloan.sol).

If you update the flashloan smart contract, you need to replace [this ABI](https://github.com/yuichiroaoki/poly-flashloan-bot/blob/main/src/abis/Flashloan.json) to the new one.

## Docker

```bash
source startup.sh
```

## All supported liquidity protocols

```bash
curl -X GET "https://api.1inch.exchange/v3.0/137/protocols" -H  "accept: application/json"
curl -X GET "https://api.1inch.exchange/v4.0/137/liquidity-sources" -H  "accept: application/json"
```

```json
{
  "protocols": [
    "POLYGON_SAFE_SWAP",
    "POLYGON_APESWAP",
    "IRONSWAP",
    "POLYGON_JETSWAP",
    "POLYGON_DODO",
    "POLYGON_DODO_V2",
    "POLYGON_KYBER_DMM",
    "POLYGON_BALANCER_V2",
    "POLYGON_WAULTSWAP",
    "DFYN",
    "POLYGON_ONE_INCH_LIMIT_ORDER",
    "POLYDEX_FINANCE",
    "ONESWAP",
    "FIREBIRD_FINANCE",
    "POLYGON_MSTABLE",
    "POLYGON_SUSHISWAP",
    "POLYGON_QUICKSWAP",
    "WMATIC",
    "POLYGON_CURVE",
    "POLYGON_AAVE_V2",
    "COMETH",
    "POLYGON_DFX_FINANCE",
    "POLYGON_CURVE_V2"
  ]
}
```

## All supported tokens

```bash
curl -X GET "https://api.1inch.exchange/v3.0/137/tokens" -H  "accept: application/json"
curl -X GET "https://api.1inch.exchange/v4.0/137/tokens" -H  "accept: application/json"
```

## Debug transactions

```bash
ts-node src/debug.ts 0xc3ec5defe7b6b8a5e4a4f083b5d67110637f3074c84a4808c607cca1f544daa8
```

```json
{
  hash: '0xc3ec5defe7b6b8a5e4a4f083b5d67110637f3074c84a4808c607cca1f544daa8',
  from: '0x4d844504470f7E43740af80BD5462022F69FeFB0',
  to: '0xe43A0003955f8745c77A2A987Afa316D6B9828B3',
  gasPrice: 30000000000,
  gasLimit: 15000000,
  nonce: 46,
  blockNumber: 22593589
}
{
  name: 'dodoFlashLoan',
  params: {
    flashLoanPool: 'USDC_DAI',
    loanAmount: 10000000000,
    firstRoutes: [
      'POLYGON_QUICKSWAP: DAI → WETH',
      'POLYGON_APESWAP: WETH → MATIC',
      'POLYGON_QUICKSWAP: MATIC → USDT'
    ],
    secondRoutes: [
      'POLYGON_SUSHISWAP: USDT → WETH',
      'POLYGON_QUICKSWAP: WETH → MATIC',
      'POLYGON_APESWAP: MATIC → DAI'
    ]
  }
}
```

```
0xc3ec5defe7b6b8a5e4a4f083b5d67110637f3074c84a4808c607cca1f544daa8

MATIC: eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
USDT: c2132d05d31c914a87c6611c10748aeb04b58e8f
WETH: 7ceb23fd6bc0add59e62ac25578270cff1b9f619
DAI: 8f3cf7ad23cd3cadbd9735aff958023239c6a063

USDC_DAI: aaE10Fa31E73287687ce56eC90f81A800361B898

firstRoutes
POLYGON_QUICKSWAP: a5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff DAI
POLYGON_APESWAP: C0788A3aD43d79aa53B09c2EaCc313A787d1d607
POLYGON_QUICKSWAP: a5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff

secondRoutes
POLYGON_SUSHISWAP: 1b02dA8Cb0d097eB8D57A175b88c7D8b47997506
POLYGON_QUICKSWAP: a5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
POLYGON_APESWAP: C0788A3aD43d79aa53B09c2EaCc313A787d1d607

b27f6a250000000000000000000000000000000000000000000000000000000000000020000000000000000000000000aae10fa31e73287687ce56ec90f81a800361b89800000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000a5e0829caced8ffdd4de3c43696c57f7d7a678ff00000000000000000000000000000000000000000000000000000000000000020000000000000000000000008f3cf7ad23cd3cadbd9735aff958023239c6a0630000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f6190000000000000000000000000000000000000000000000000000000000000040000000000000000000000000c0788a3ad43d79aa53b09c2eacc313a787d1d60700000000000000000000000000000000000000000000000000000000000000020000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f619000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000a5e0829caced8ffdd4de3c43696c57f7d7a678ff0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000001b02da8cb0d097eb8d57a175b88c7d8b479975060000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f0000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f6190000000000000000000000000000000000000000000000000000000000000040000000000000000000000000a5e0829caced8ffdd4de3c43696c57f7d7a678ff00000000000000000000000000000000000000000000000000000000000000020000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f619000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000c0788a3ad43d79aa53b09c2eacc313a787d1d6070000000000000000000000000000000000000000000000000000000000000002000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000008f3cf7ad23cd3cadbd9735aff958023239c6a063
```

## References

- [Flashloan Arbitrage Trades are Still Profitable](https://medium.com/coinmonks/flashloan-arbitrage-trades-are-still-profitable-28db937f1a43)
- [Reasons why my flashloan bot didn't work](https://youtu.be/JYKuNp4D2Ig)
