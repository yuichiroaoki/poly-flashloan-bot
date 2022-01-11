import { getUniswapV3PoolFee } from "../src/uniswap/v3/fee";

describe("UniswapV3 pool fee test", () => {
  describe("Check if it returns the correct a pool fee.", () => {
    test("DAI - USDC", () => {
      expect(getUniswapV3PoolFee(["DAI", "USDC"])).toStrictEqual([500]);
    });

    test("DAI - WMATIC", () => {
      expect(getUniswapV3PoolFee(["DAI", "WMATIC"])).toStrictEqual([500]);
    });

    test("UNI - WMATIC", () => {
      expect(getUniswapV3PoolFee(["UNI", "USDC"])).toStrictEqual([3000]);
    });

    test("WETH - USDT", () => {
      expect(getUniswapV3PoolFee(["WETH", "USDT"])).toStrictEqual([3000]);
    });

    test("WETH - WMATIC- USDT", () => {
      expect(getUniswapV3PoolFee(["WETH", "WMATIC", "USDT"])).toStrictEqual([
        500, 500,
      ]);
    });
  });
});
