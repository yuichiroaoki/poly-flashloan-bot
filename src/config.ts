import { ethers } from "ethers";
import { erc20Address } from "./constrants/addresses";

//  fixed thresholds for buying and selling
export const threshold = 0.03;

// interval of price check (ms)
export const interval = 10 * 1000;

// amount of DAI token trading per a single buy/sell action
export const baseTradingAmount = ethers.utils.parseUnits("3.0", 18);

export const chainId = 137;

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

export const explorerURL = "https://polygonscan.com";

// Token pair the bot trading
export const baseToken = erc20Address.USDC;
export const tradingTokens = [
  erc20Address.DAI,
  erc20Address.WMATIC,
  erc20Address.USDT,
  erc20Address.WETH,
];

export const flashloanAddress = "<your-deployed-contract-address>";

export const protocols =
  "POLYGON_SUSHISWAP,POLYGON_QUICKSWAP,POLYGON_APESWAP,POLYGON_JETSWAP,POLYGON_WAULTSWAP";
