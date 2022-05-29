import { BigNumber } from "ethers";

export const toInt = (float: number) => {
  return float * 100;
};

export const splitLoanAmount = (
  loanAmount: BigNumber,
  part: number
): BigNumber => {
  return loanAmount.mul(part).div(10000);
};
