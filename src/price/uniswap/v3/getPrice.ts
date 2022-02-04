import { BigNumber, ethers } from "ethers";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { config as dotEnvConfig } from "dotenv";
import { getBigNumber } from "../../../utils";
dotEnvConfig();

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);
// https://polygonscan.com/address/0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const quoterContract = new ethers.Contract(
  quoterAddress,
  QuoterABI,
  maticProvider
);

export const getPriceOnUniV3 = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  fee: number
): Promise<BigNumber> => {
  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    tokenIn,
    tokenOut,
    fee,
    amountIn.toString(),
    0
  );
  if (!ethers.BigNumber.isBigNumber(quotedAmountOut)) {
    return getBigNumber(0);
  }
  return quotedAmountOut;
};
