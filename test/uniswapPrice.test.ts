import { findRouter, findRouterFromProtocol, getBigNumber } from "../src/utils";
import { uniswapRouter } from "../src/constants/addresses";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { expectPriceOnDex } from "../src/expect";
import { baseTokens, tradingTokens } from "../src/config";

describe("Uniswap price check", () => {
  for (let i = 0; i < Object.keys(uniswapRouter).length; i++) {
    const routerAddress = findRouterFromProtocol(i);
    const routerName = findRouter(routerAddress);
    describe(routerName, () => {
      for (let i = 0; i < Object.keys(uniswapRouter).length; i++) {
        baseTokens.forEach(async (baseToken) => {
          tradingTokens.forEach(async (tradingToken) => {
            test(`${baseToken.symbol} -> ${tradingToken.symbol}`, async () => {
              const price = await expectPriceOnDex(
                i,
                getBigNumber(1, 6),
                baseToken.address,
                tradingToken.address
              );
              expect(price.gt(getBigNumber(0))).toBe(true);
            });
          });
        });
      }
    });
  }
});
