require("dotenv").config();
import { ethers } from "ethers";
import * as ABI from "./abis/Flashloan.json";
import { ERC20Token, dodoV2Pool, uniswapRouter } from "./constrants/addresses";
import { IFlashloanRoute } from "./interfaces/main";
import { findPool, findRouter, findToken } from "./utils";

if (process.env.ALCHEMY_POLYGON_RPC_URL === undefined) {
  throw new Error("Please set ALCHEMY_POLYGON_RPC_URL environment variable.");
}

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

const inter = new ethers.utils.Interface(ABI.abi);

const router = (route: IFlashloanRoute) => {
  return `${findRouter(route.pool)}: ${findToken(route.path[0])} → ${findToken(
    route.path[1]
  )}`;
};

export const main = async () => {
  var args = process.argv.slice(2);

  const tx = await maticProvider.getTransaction(args[0]);
  console.log({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,

    gasPrice: tx.gasPrice?.toNumber(),
    gasLimit: tx.gasLimit?.toNumber(),

    nonce: tx.nonce,
    blockNumber: tx.blockNumber,
  });

  const decodedInput = inter.parseTransaction({
    data: tx.data,
    value: tx.value,
  });
  console.log({
    name: decodedInput.name,

    params: {
      flashLoanPool: findPool(decodedInput.args.params.flashLoanPool),
      loanAmount: decodedInput.args.params.loanAmount.toNumber(),
      firstRoutes: decodedInput.args.params.firstRoutes.map(
        (route: IFlashloanRoute) => router(route)
      ),
      secondRoutes: decodedInput.args.params.secondRoutes.map(
        (route: IFlashloanRoute) => router(route)
      ),
    },
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
