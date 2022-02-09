import { config as dotEnvConfig } from "dotenv";
import { BigNumber, ethers } from "ethers";
dotEnvConfig();
import * as DODOV2Json from "../../abis/IDODOV2.json";
import { flashloanAddress } from "../../config";
import { findToken, getBigNumber } from "../../utils";
import { DODOV2Pool } from "./pool";

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

const getDODOV2Pool = (tokenIn: string, tokenOut: string) => {
  const tokenInSymbol = findToken(tokenIn);
  const tokenOutSymbol = findToken(tokenOut);
  const pair = [tokenInSymbol, tokenOutSymbol].sort();

  for (const dodoPair of DODOV2Pool) {
    if (dodoPair.pair.join() === pair.join()) {
      return dodoPair.address[0];
    }
  }
  throw new Error(`Could not find pool for ${pair.join()}`);
};

/**
 *
 * @param tokenIn address of token to convert from
 * @param tokenOut address of token to convert to
 * @param amountIn amount of token to convert from
 * @returns
 */
export const getPriceOnDODOV2 = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber
): Promise<BigNumber> => {
  const dodoV2Pool = getDODOV2Pool(tokenIn, tokenOut);
  const DODOV2 = new ethers.Contract(dodoV2Pool, DODOV2Json.abi, maticProvider);
  const baseTokenAddress = await DODOV2._BASE_TOKEN_();
  const amountsOut =
    baseTokenAddress.toLowerCase() === tokenIn.toLowerCase()
      ? await DODOV2.querySellBase(flashloanAddress, amountIn)
      : await DODOV2.querySellQuote(flashloanAddress, amountIn);

  if (!amountsOut || amountsOut.length !== 2) {
    return getBigNumber(0);
  }
  return amountsOut[0];
};
