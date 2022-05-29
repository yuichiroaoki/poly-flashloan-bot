import { BigNumber } from "ethers";
import { IToken } from "../constants/addresses";

export interface ITrade {
  path: IToken[];
  amountIn: BigNumber;
  protocols: number[];
}
