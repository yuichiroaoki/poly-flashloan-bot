import { ITrade } from "./interfaces/trade";
import { getPriceOnUniV2 } from "./price/uniswap/v2/getPrice";
import { getPriceOnUniV3 } from "./price/uniswap/v3/getPrice";
import { findRouterFromProtocol, getBigNumber } from "./utils";
import * as log4js from "log4js";

const errReport = log4js.getLogger("error");

export const findOpp = async (trade: ITrade) => {
  let amountOut = trade.amountIn;
  for (const [i, protocol] of trade.protocols.entries()) {
    switch (protocol) {
      // uniswap v3
      case 0:
        try {
          amountOut = await getPriceOnUniV3(
            trade.path[i].address,
            trade.path[i + 1].address,
            amountOut
          );
          break;
        } catch (e) {
          logError(e);
          amountOut = getBigNumber(0);
          break;
        }
      // uniswap v2
      default:
        try {
          amountOut = await getPriceOnUniV2(
            trade.path[i].address,
            trade.path[i + 1].address,
            amountOut,
            findRouterFromProtocol(protocol)
          );
          break;
        } catch (e) {
          logError(e);
          amountOut = getBigNumber(0);
          break;
        }
    }
  }

  return amountOut;
};

const logError = (e: any) => {
  errReport.warn("Failed to estimate price: ", e?.reason);
};
