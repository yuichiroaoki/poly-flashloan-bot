import { BigNumber, ethers } from "ethers";
import * as FlashloanJson from "./abis/Flashloan.json";
import { flashloanAddress, gasLimit } from "./config";
import {
  dodoV2Pool,
  erc20Address,
  uniswapRouter,
} from "./constrants/addresses";
import { IRoute } from "./interfaces/main";
import { getBigNumber } from "./utils/index";

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

if (process.env.PRIVATE_KEY === undefined) {
  throw new Error("Private key is not defined");
}

const private_key = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(private_key, maticProvider);
const Flashloan = new ethers.Contract(
  flashloanAddress,
  FlashloanJson.abi,
  maticProvider
);

type testedPoolMap = { [erc20Address: string]: string[] };

const testedPools: testedPoolMap = {
  DAI: [dodoV2Pool.USDC_DAI],
  WETH: [dodoV2Pool.WETH_USDC],
  USDC: [dodoV2Pool.WETH_USDC, dodoV2Pool.USDC_DAI],
  USDT: [dodoV2Pool.WMATIC_USDT],
  WMATIC: [dodoV2Pool.WMATIC_USDT],
};

/**
 * borrow token from one of the tested dodo pools
 * @param borrowingToken token to borrow from dodo pool
 * @returns
 */
const getLendingPool = (borrowingToken: string) => {
  return testedPools[borrowingToken][0];
};

export const flashloan = async (
  tokenIn: string,
  tokenOut: string,
  firstRoutes: IRoute[],
  secondRoutes: IRoute[]
) => {
  let params: IParams;

  params = {
    flashLoanPool: getLendingPool(tokenIn),
    loanAmount: getBigNumber(10000, 6),
    firstRoutes: changeToFlashloanRoute(tokenIn, firstRoutes),
    secondRoutes: changeToFlashloanRoute(tokenOut, secondRoutes),
  };

  // console.log("Calling flashloan", `${tokenIn} <-> ${tokenOut}`);
  return Flashloan.connect(signer).dodoFlashLoan(params, {
    gasLimit: gasLimit,
  });
  // const polyscanURL = "https://polygonscan.com/tx/" + tx.hash;
  // console.log("Flashloan tx: ", tx.hash);
  // console.log("Polyscan URL: ", polyscanURL);
};

/**
 * change 1inch route to flashloan route
 * @param tokenIn token to borrow from dodo pool
 * @param routes
 * @returns
 */
const changeToFlashloanRoute = (
  tokenIn: string,
  routes: IRoute[]
): IFlashloanRoute[] => {
  let firstRoute: IFlashloanRoute = {
    path: [erc20Address[tokenIn]],
    router: uniswapRouter[routes[0].name],
  };
  let flashloanRoutes: IFlashloanRoute[] = [firstRoute];
  let previosProtocol = routes[0].name;
  let currentIndex = 0;

  for (const swap of routes) {
    if (previosProtocol === swap.name) {
      flashloanRoutes[currentIndex].path.push(swap.toTokenAddress);
    } else {
      const lastPath = flashloanRoutes[currentIndex].path;
      const fromToken = lastPath[lastPath.length - 1];
      flashloanRoutes.push({
        path: [fromToken, swap.toTokenAddress],
        router: uniswapRouter[swap.name],
      });
      currentIndex++;
      previosProtocol = swap.name;
    }
  }
  return flashloanRoutes;
};

interface IFlashloanRoute {
  path: string[];
  router: string;
}

interface IParams {
  flashLoanPool: string;
  loanAmount: BigNumber;
  firstRoutes: IFlashloanRoute[];
  secondRoutes: IFlashloanRoute[];
}
