import { ethers } from "ethers";
import * as FlashloanJson from "./abis/Flashloan.json";
import { flashloanAddress, loanAmount, gasLimit, gasPrice } from "./config";
import {
  IToken,
  dodoV2Pool,
  uniswapRouter,
  ERC20Token,
} from "./constants/addresses";
import { IProtocol } from "./interfaces/inch";
import { Hop, IFlashloanRoute, IParams, Swap } from "./interfaces/main";
import { getBigNumber, replaceTokenAddress } from "./utils/index";
import { getRouteParts, toInt } from "./utils/split";

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
  firstProtocols: IProtocol[][][],
  secondProtocols: IProtocol[][][]
) => {
  let params: IParams;

  params = {
    flashLoanPool: getLendingPool(tokenIn),
    loanAmount: getBigNumber(loanAmount, tokenIn.decimals),
    firstRoutes: createRoutes(firstProtocols),
    secondRoutes: createRoutes(secondProtocols),
  };

  return Flashloan.connect(signer).dodoFlashLoan(params, {
    gasLimit: gasLimit,
    gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
  });
  // const polyscanURL = "https://polygonscan.com/tx/" + tx.hash;
  // console.log("Flashloan tx: ", tx.hash);
  // console.log("Polyscan URL: ", polyscanURL);
};

const protocolNameToNumber = (protocolName: string): number => {
  let protocolNumber = 0;
  for (const name of Object.keys(uniswapRouter)) {
    if (name === protocolName) {
      return protocolNumber;
    }
    protocolNumber++;
  }
  throw new Error(`Unknown protocol name: ${protocolName}`);
};

const createRoutes = (routes: IProtocol[][][]): IFlashloanRoute[] => {
  let flashloanRoutes: IFlashloanRoute[] = [];
  let i = 0;
  const routeParts = getRouteParts(routes.length);
  for (const hops of routes) {
    const part = routeParts[i];
    let route: IFlashloanRoute = {
      part: part,
      hops: toHops(hops),
    };
    flashloanRoutes.push(route);
    i++;
  }
  return flashloanRoutes;
};

const toSwaps = (results: IProtocol[]) => {
  let swaps: Swap[] = [];
  for (const result of results) {
    swaps.push({
      protocol: protocolNameToNumber(result.name),
      part: toInt(result.part),
    });
  }
  return swaps;
};

const toHops = (results: IProtocol[][]) => {
  let hops: Hop[] = [];
  for (const result of results) {
    const path = [result[0].fromTokenAddress, result[0].toTokenAddress].map(
      (token) => {
        return replaceTokenAddress(
          token,
          ERC20Token.MATIC.address,
          ERC20Token.WMATIC.address
        );
      }
    );
    let hop: Hop = {
      path: path,
      swaps: toSwaps(result),
    };
    hops.push(hop);
  }
  return hops;
};
