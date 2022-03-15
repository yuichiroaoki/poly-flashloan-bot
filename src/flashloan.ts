import { ethers } from "ethers";
import * as FlashloanJson from "./abis/Flashloan.json";
import { flashloanAddress, loanAmount, gasLimit, gasPrice } from "./config";
import { IToken, dodoV2Pool } from "./constants/addresses";
import { IFlashloanRoute, IParams } from "./interfaces/main";
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
  WETH: [dodoV2Pool.WETH_USDC],
  USDC: [dodoV2Pool.WETH_USDC],
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
  firstRoutes: IFlashloanRoute[],
  secondRoutes: IFlashloanRoute[]
) => {
  let params: IParams;

  params = {
    flashLoanPool: getLendingPool(tokenIn),
    loanAmount: getBigNumber(loanAmount, tokenIn.decimals),
    firstRoutes: firstRoutes,
    secondRoutes: secondRoutes,
  };

  return Flashloan.connect(signer).dodoFlashLoan(params, {
    gasLimit: gasLimit,
    gasPrice: ethers.utils.parseUnits(`${gasPrice}`, "gwei"),
  });
};
