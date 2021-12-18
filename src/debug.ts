require("dotenv").config();
import { ethers } from "ethers";
import * as ABI from "./abis/Flashloan.json";
import { IFlashloanRoute, IParams } from "./flashloan";
import { ERC20Token, dodoV2Pool, uniswapRouter } from "./constrants/addresses";

if (process.env.ALCHEMY_POLYGON_RPC_URL === undefined) {
  throw new Error("Please set ALCHEMY_POLYGON_RPC_URL environment variable.");
}

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

const inter = new ethers.utils.Interface(ABI.abi);

const findRouter = (router: string) => {
  for (let k of Object.keys(uniswapRouter)) {
    if (router.toLowerCase() === uniswapRouter[k].toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};
const findToken = (token: string) => {
  for (let k of Object.keys(ERC20Token)) {
    if (token.toLowerCase() === ERC20Token[k].address.toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};
const findPool = (pool: string) => {
  for (let k of Object.keys(dodoV2Pool)) {
    if (pool.toLowerCase() === dodoV2Pool[k].toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};

const router = (route: IFlashloanRoute) => {
  return `${findRouter(route.router)}: ${findToken(
    route.path[0]
  )} → ${findToken(route.path[1])}`;
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
