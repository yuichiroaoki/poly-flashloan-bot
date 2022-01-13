import { BigNumber } from "ethers";

export interface IRoute {
  name: string;
  toTokenAddress: string;
}

export interface IFlashloanRoute {
  path: string[];
  protocol: number;
  pool: string;
  fee: number[];
}

export interface IParams {
  flashLoanPool: string;
  loanAmount: BigNumber;
  firstRoutes: IFlashloanRoute[];
  secondRoutes: IFlashloanRoute[];
}
