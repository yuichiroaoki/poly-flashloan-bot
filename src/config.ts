import { ethers } from "ethers";
import { ERC20Symbol } from "./constrants/addresses";

// interval of price check (ms)
export const interval = 10 * 1000;

// polygon chain id
export const chainId = 137;

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

export const explorerURL = "https://polygonscan.com";

// Token pair the bot trading
export const baseTokens = [
  ERC20Symbol.DAI,
  ERC20Symbol.WMATIC,
  ERC20Symbol.USDT,
  ERC20Symbol.USDC,
  ERC20Symbol.WETH,
];

export const tradingTokens = [
  ERC20Symbol.DAI,
  ERC20Symbol.WMATIC,
  ERC20Symbol.USDT,
  ERC20Symbol.USDC,
  ERC20Symbol.WETH,
];

/**
 * @type {string} public flashloan contract address
 * Polyscan: https://polygonscan.com/address/0x0e0ec2c716b5ba2512af9d3790d8804da42ddd58
 * if you have deployed your own contract, you can use it instead of the default one
 */
export const flashloanAddress: string =
  "0x0e0Ec2C716b5Ba2512Af9d3790D8804Da42DDD58";

// protocols the bot will use
export const protocols =
  "POLYGON_SUSHISWAP,POLYGON_QUICKSWAP,POLYGON_APESWAP,POLYGON_JETSWAP,POLYGON_WAULTSWAP";

export const gasLimit = 15000000;
