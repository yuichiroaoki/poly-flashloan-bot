import { config as dotEnvConfig } from "dotenv";
import { BigNumber, ethers } from "ethers";
dotEnvConfig();
import * as UniswapV2Router from "../../abis/IUniswapV2Router02.json";

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

export const getPriceOnUniV2 = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  routerAddress: string
) => {
  const V2Router = new ethers.Contract(
    routerAddress,
    UniswapV2Router.abi,
    maticProvider
  );
  const amountOut = await V2Router.getAmountsOut(amountIn, [
    tokenIn,
    tokenOut,
  ])[1];
  return amountOut;
};
