import { BigNumber, ethers } from "ethers";
import { Hop, IFlashloanRoute, Swap } from "./interfaces/main";
import { getPriceOnUniV2 } from "./price/uniswap/v2/getPrice";
import { getUniswapV3PoolFee } from "./price/uniswap/v3/fee";
import { getPriceOnUniV3 } from "./price/uniswap/v3/getPrice";
import { findRouterFromProtocol, getBigNumber } from "./utils";
import { splitLoanAmount } from "./utils/split";

export const expectAmountOut = async (
  flashloanRoutes: IFlashloanRoute[],
  totalAmountIn: BigNumber
) => {
  let amountOut = getBigNumber(0);
  for (const route of flashloanRoutes) {
    const part = route.part;
    const amountIn = splitLoanAmount(totalAmountIn, part);
    const hopsAmountOut = await getHopsAmountOut(route.hops, amountIn);
    if (hopsAmountOut) {
      amountOut = amountOut.add(await getHopsAmountOut(route.hops, amountIn));
    }
  }
  return amountOut;
};

const getHopsAmountOut = async (hops: Hop[], initialAmount: BigNumber) => {
  let amountIn = initialAmount;
  for (const hop of hops) {
    const swaps = hop.swaps;
    const path = hop.path;
    const swapsAmountOut = await getSwapsAmountOut(swaps, amountIn, path);
    amountIn = swapsAmountOut ? swapsAmountOut : getBigNumber(0);
  }

  return amountIn;
};

const getSwapsAmountOut = async (
  swaps: Swap[],
  totalAmountIn: BigNumber,
  path: string[]
) => {
  let amountOut = getBigNumber(0);
  for (const swap of swaps) {
    const protocol = swap.protocol;
    const part = swap.part;
    const amountIn = splitLoanAmount(totalAmountIn, part);
    const price = await expectPriceOnDex(protocol, amountIn, path[0], path[1]);
    if (ethers.BigNumber.isBigNumber(price)) {
      amountOut = amountOut.add(price);
    }
  }
  return amountOut;
};

export const expectPriceOnDex = async (
  protocol: number,
  amountIn: BigNumber,
  tokenIn: string,
  tokenOut: string
) => {
  if (!amountIn || amountIn.eq(getBigNumber(0))) {
    return getBigNumber(0);
  }
  if (protocol === 0) {
    const fee = getUniswapV3PoolFee([tokenIn, tokenOut])[0];
    return await getPriceOnUniV3(tokenIn, tokenOut, amountIn, fee);
  } else {
    const routerAddress = findRouterFromProtocol(protocol);
    return await getPriceOnUniV2(tokenIn, tokenOut, amountIn, routerAddress);
  }
};
