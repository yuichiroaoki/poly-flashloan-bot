import { BigNumber, ethers } from "ethers";
import * as FlashloanJson from "./abis/Flashloan.json";
import { flashloanAddress } from "./config";
import { dodoV2Pool, uniswapRouter } from "./constrants/addresses";
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

export const flashloan = async (
  tokenIn: string,
  tokenOut: string,
  firstRoutes: IRoute[],
  secondRoutes: IRoute[]
) => {
  let params: IParams;

  params = {
    flashLoanPool: dodoV2Pool.WETH_USDC,
    loanAmount: getBigNumber(10000, 6),
    firstRoutes: changeToFlashloanRoute(tokenIn, firstRoutes),
    secondRoutes: changeToFlashloanRoute(tokenOut, secondRoutes),
  };

  console.log("Calling flashloan", tokenOut);
  const tx = await Flashloan.connect(signer).dodoFlashLoan(params, {
    gasLimit: 15000000,
  });
  const polyscanURL = "https://polygonscan.com/tx/" + tx.hash;
  console.log("Flashloan tx: ", tx.hash);
  console.log("Polyscan URL: ", polyscanURL);
};

const changeToFlashloanRoute = (
  tokenIn: string,
  routes: IRoute[]
): IFlashloanRoute[] => {
  let firstRoute: IFlashloanRoute = {
    path: [tokenIn],
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
