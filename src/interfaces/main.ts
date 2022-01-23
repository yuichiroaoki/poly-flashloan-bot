import { BigNumber } from "ethers";

export interface IRoute {
  name: string;
  toTokenAddress: string;
}

export interface Swap {
  protocol: number;
  part: number;
}

export interface Hop {
  swaps: Swap[];
  path: string[];
}

export interface IFlashloanRoute {
  hops: Hop[];
  part: number;
}

export interface IParams {
  flashLoanPool: string;
  loanAmount: BigNumber;
  firstRoutes: IFlashloanRoute[];
  secondRoutes: IFlashloanRoute[];
}
