import { ethers } from "ethers";
import * as FlashloanJson from "./abis/Flashloan.json";
import { flashloanAddress, gasLimit } from "./config";
import { IToken, dodoV2Pool } from "./constants/addresses";
import { IParams } from "./interfaces/main";
import { ITrade } from "./interfaces/trade";
import { passRoutes } from "./routes";

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

export const flashloan = async (trade: ITrade) => {
  let params: IParams;
  const tokenIn = trade.path[0];
  const gasPrice = await maticProvider.getGasPrice();
  const extraGas = ethers.utils.parseUnits("100", "gwei");
  params = {
    flashLoanPool: getLendingPool(tokenIn),
    loanAmount: trade.amountIn,
    routes: passRoutes(trade),
  };

  return Flashloan.connect(signer).dodoFlashLoan(params, {
    gasLimit: gasLimit,
    gasPrice: gasPrice.add(extraGas),
  });
};
