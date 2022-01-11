import { getUniswapV3PoolFee } from "../src/uniswap/v3";

describe("UniswapV3 pool fee test", () => {
  describe("Check if it returns the correct a pool fee.", () => {
    test("DAI - USDC", () => {
      expect(getUniswapV3PoolFee(["DAI", "USDC"])).toBe(500);
    });

    test("DAI - WMATIC", () => {
      expect(getUniswapV3PoolFee(["DAI", "WMATIC"])).toBe(500);
    });

    test("UNI - WMATIC", () => {
      expect(getUniswapV3PoolFee(["UNI", "USDC"])).toBe(3000);
    });

    test("WETH - USDT", () => {
      expect(getUniswapV3PoolFee(["WETH", "USDT"])).toBe(3000);
    });
  });
});
