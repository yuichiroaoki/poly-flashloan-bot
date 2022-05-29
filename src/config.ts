import { ERC20Token } from "./constants/addresses";
import { ITrade } from "./interfaces/trade";
import { getBigNumber } from "./utils";

export const renderInterval = 1 * 1000;

// interval of price check (ms)
export const interval = 4 * 1000;

export const diffPercentage = 0.03;

//export const chainId = 1;// Ethereum
//export const chainId = 56;// Binance Smart Chain
export const chainId = 137; // Polygon

export const explorerURL = "https://polygonscan.com";

export const tradingRoutes: ITrade[] = [
  {
    path: [ERC20Token.USDC, ERC20Token.DAI, ERC20Token.USDC],
    protocols: [2, 0],
    amountIn: getBigNumber(20000, ERC20Token.USDC.decimals),
  },
];

/**
 * @type {string} public flashloan contract address
 * Polyscan: https://polygonscan.com/address/0x568a23ad22041683468cd1d3a6968d7e7dc20d40
 * if you have deployed your own contract, you can use it instead of the default one
 */
export const flashloanAddress: string =
  "0x33d8d437796bd43bdccc6740c585f4a15d1070b7";

/**
 * The bot can trade on UniswapV2 fork dexes(ex. SushiSwap) and UniswapV3
 * For UniswapV2, you can trade between any token pair, but for UniswapV3, you have to check their pool fees and list them on src/price/uniswap/v3/fee.ts.
 */

export const gasLimit = 15000000;
