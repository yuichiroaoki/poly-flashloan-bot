import { getBigNumber } from "../src/utils";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { getPriceOnDODOV2 } from "../src/price/dodo/getPrice";
import { baseTokens, tradingTokens } from "../src/config";

describe("DODOV2 price check", () => {
  for (const baseToken of baseTokens) {
    for (const quoteToken of tradingTokens) {
      if (baseToken.symbol === quoteToken.symbol) continue;
      test(`${baseToken.symbol} -> ${quoteToken.symbol}`, async () => {
        const price = await getPriceOnDODOV2(
          baseToken.address,
          quoteToken.address,
          getBigNumber(1, 6)
        );

        expect(price.gt(getBigNumber(0))).toBe(true);
      });
    }
  }
});
