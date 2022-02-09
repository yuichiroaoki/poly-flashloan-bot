import { getBigNumber } from "../src/utils";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { getPriceOnDODOV2 } from "../src/price/dodo/getPrice";
import { DODOV2Pool } from "../src/price/dodo/pool";
import { ERC20Token } from "../src/constants/addresses";

describe("DODOV2 price check", () => {
  for (const pool of DODOV2Pool) {
    const [base, quote] = pool.pair;
    test(`${base} - ${quote}`, async () => {
      const price = await getPriceOnDODOV2(
        ERC20Token[base].address,
        ERC20Token[quote].address,
        getBigNumber(1, 6)
      );

      // expect(price.gt(getBigNumber(0))).toBe(true);
    });
  }
});
