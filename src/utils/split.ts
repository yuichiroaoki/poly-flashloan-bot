import { BigNumber } from "ethers";
import { routeParts } from "../config";

export const getRouteParts = (length: number) => {
  try {
    return routeParts[length - 1];
  } catch {
    throw new Error(`Route length ${length} is not supported`);
  }
};

export const toInt = (float: number) => {
  return float * 100;
};

export const splitLoanAmount = (
  loanAmount: BigNumber,
  part: number
): BigNumber => {
  return loanAmount.mul(part).div(10000);
};
