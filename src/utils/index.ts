import { BigNumber, ethers } from "ethers";
import { dodoV2Pool, ERC20Token, uniswapRouter } from "../constants/addresses";

export const getBigNumber = (amount: number, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
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

/**
 *
 * @param token address
 * @returns token symbol
 */
export const findToken = (token: string): string => {
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

/**
 * @param protocol
 * @returns router address
 */
export const findRouterFromProtocol = (protocol: number) => {
  return uniswapRouter[Object.keys(uniswapRouter)[protocol]];
};

export const checkIfProfitable = (
  loanAmount: BigNumber,
  diffPercentage: number,
  expectedAmountOut: BigNumber
) => {
  const preventUnderflow = 1_000_000;
  const isOpportunity = loanAmount
    .mul((diffPercentage / 100 + 1) * preventUnderflow)
    .div(preventUnderflow)
    .lt(expectedAmountOut);
  return isOpportunity;
};
