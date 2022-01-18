import { ethers } from "ethers";
import { dodoV2Pool, ERC20Token, uniswapRouter } from "../constants/addresses";

const { BigNumber } = ethers;

const BASE_TEN = 10;

// Defaults to e18 using amount * 10^18
export const getBigNumber = (amount: number, decimals = 18) => {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
};

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const preventUnderflow = (amount: number, decimals: number): string => {
  if (amount.toString().length > decimals) {
    return amount.toFixed(decimals).toString();
  }
  return amount.toString();
};

export const replaceTokenAddress = (
  token: string,
  address: string,
  newAddress: string
) => {
  return token === address ? newAddress : token;
};

export const findRouter = (router: string) => {
  for (let k of Object.keys(uniswapRouter)) {
    if (router.toLowerCase() === uniswapRouter[k].toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};

export const findToken = (token: string) => {
  for (let k of Object.keys(ERC20Token)) {
    if (token.toLowerCase() === ERC20Token[k].address.toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};

export const findPool = (pool: string) => {
  for (let k of Object.keys(dodoV2Pool)) {
    if (pool.toLowerCase() === dodoV2Pool[k].toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};
