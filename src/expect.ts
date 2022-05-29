import { BigNumber, ethers } from "ethers";
import { getPriceOnUniV2 } from "./price/uniswap/v2/getPrice";
import { getPriceOnUniV3 } from "./price/uniswap/v3/getPrice";
import { findRouterFromProtocol, getBigNumber } from "./utils";

export const expectPriceOnDex = async (
  protocol: number,
  amountIn: BigNumber,
  tokenIn: string,
  tokenOut: string
): Promise<BigNumber> => {
  if (!amountIn || amountIn.eq(getBigNumber(0))) {
    return getBigNumber(0);
  }
  if (protocol === 0) {
    return await getPriceOnUniV3(tokenIn, tokenOut, amountIn);
  } else {
    const routerAddress = findRouterFromProtocol(protocol);
    return await getPriceOnUniV2(tokenIn, tokenOut, amountIn, routerAddress);
  }
};
