import { ethers } from "ethers";
import * as FlashloanJson from "./abis/Flashloan.json";
import { flashloanAddress, loanAmount, gasLimit, gasPrice } from "./config";
import { IToken, dodoV2Pool, uniswapRouter } from "./constrants/addresses";
import { IFlashloanRoute, IParams, IRoute } from "./interfaces/main";
import { getUniswapV3PoolFee } from "./uniswap/v3/fee";
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
  USDT: [dodoV2Pool.USDT_DAI],
  WMATIC: [dodoV2Pool.WMATIC_USDC],
};

/**
 * borrow token from one of the tested dodo pools
 * @param borrowingToken token to borrow from dodo pool
 * @returns
 */
const getLendingPool = (borrowingToken: IToken) => {
  return testedPools[borrowingToken.symbol][0];
};

export const flashloan = async (
  tokenIn: IToken,
  tokenOut: IToken,
  firstRoutes: IRoute[],
  secondRoutes: IRoute[]
) => {
  let params: IParams;

  params = {
    flashLoanPool: getLendingPool(tokenIn),
    loanAmount: getBigNumber(loanAmount, 6),
    firstRoutes: changeToFlashloanRoute(tokenIn, firstRoutes),
    secondRoutes: changeToFlashloanRoute(tokenOut, secondRoutes),
  };

  return Flashloan.connect(signer).dodoFlashLoan(params, {
    gasLimit: gasLimit,
    gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
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
  tokenIn: IToken,
  routes: IRoute[]
): IFlashloanRoute[] => {
  let flashloanRoutes: IFlashloanRoute[] = getInitialFlashloanRoutes(
    tokenIn,
    routes[0]
  );
  let previousProtocol = routes[0].name;
  let currentIndex = 0;

  for (const swap of routes) {
    if (previousProtocol === swap.name) {
      flashloanRoutes[currentIndex].path.push(swap.toTokenAddress);
      if (swap.name == "POLYGON_UNISWAP_V3") {
        flashloanRoutes[currentIndex].fee = getUniswapV3PoolFee(
          flashloanRoutes[currentIndex].path
        );
      }
    } else {
      const lastPath = flashloanRoutes[currentIndex].path;
      const fromToken = lastPath[lastPath.length - 1];
      const path = [fromToken, swap.toTokenAddress];
      const protocol = pickProtocol(swap.name);
      flashloanRoutes.push({
        path: path,
        protocol: protocol,
        pool: pickPoolAddress(protocol, swap),
        fee: protocol === 2 ? getUniswapV3PoolFee(path) : [0],
      });
      currentIndex++;
      previousProtocol = swap.name;
    }
  }
  return flashloanRoutes;
};

const getInitialFlashloanRoutes = (
  tokenIn: IToken,
  route: IRoute
): IFlashloanRoute[] => {
  const protocol = pickProtocol(route.name);
  const firstRoute: IFlashloanRoute = {
    path: [tokenIn.address],
    protocol: pickProtocol(route.name),
    pool: pickPoolAddress(protocol, route),
    fee: [0],
  };
  return [firstRoute];
};

const pickProtocol = (protocol_name: string) => {
  if (protocol_name === "POLYGON_UNISWAP_V3") {
    return 2;
  }
  return 1;
};

const pickPoolAddress = (protocol: number, route: IRoute) => {
  switch (protocol) {
    case 1:
      return uniswapRouter[route.name];
    default:
      return uniswapRouter.POLYGON_SUSHISWAP;
  }
};
