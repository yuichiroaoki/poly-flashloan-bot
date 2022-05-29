import { BigNumber } from "ethers";

export interface IRoute {
  name: string;
  toTokenAddress: string;
}

export interface Hop {
  protocol: number;
  data: string;
  path: string[];
}

export interface IFlashloanRoute {
  hops: Hop[];
  part: number;
}

export interface IParams {
  flashLoanPool: string;
  loanAmount: BigNumber;
  routes: IFlashloanRoute[];
}
