# Poly Flashloan Bot

An open source flashloan bot on polygon network

## Installation

### 1. Install [Node.js](https://nodejs.org/en/) & [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable), if you haven't already.

### 2. Clone This Repo
Run the following command.
```bash
https://github.com/yuichiroaoki/poly-flashloan-bot.git
cd poly-flashloan-bot
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

*Note: If using metamask, you'll have to add a ```0x``` to the start of your private key)

### 2. Install Dependencies
Run the following command.
```bash
yarn install
```
