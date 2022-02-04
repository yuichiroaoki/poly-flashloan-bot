import { findRouterFromProtocol, getBigNumber } from "../src/utils";
import { uniswapRouter } from "../src/constants/addresses";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { expectPriceOnDex } from "../src/expect";
import { baseTokens, tradingTokens } from "../src/config";

describe("Uniswap price check", () => {
  describe("Check if dodo pools have enough tokens", () => {
    baseTokens.forEach(async (baseToken) => {
      tradingTokens.forEach(async (tradingToken) => {
        for (let i = 0; i < Object.keys(uniswapRouter).length; i++) {
          const router = findRouterFromProtocol(i);
          test(`${router}: ${baseToken} -> ${tradingToken}`, async () => {
            const price = await expectPriceOnDex(
              i,
              getBigNumber(1, 6),
              baseToken.address,
              tradingToken.address
            );
            expect(price.gt(getBigNumber(0))).toBe(true);
          });
        }
      });
    });
  });
});
