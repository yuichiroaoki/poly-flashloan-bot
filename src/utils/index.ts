import { ethers } from "ethers";

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
