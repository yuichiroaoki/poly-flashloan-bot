import { ERC20Token } from "../src/constants/addresses";
import { getUniswapV3PoolFee } from "../src/price/uniswap/v3/fee";

describe("UniswapV3 pool fee test", () => {
  describe("Check if it returns the correct a pool fee.", () => {
    test("DAI - USDC", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ERC20Token.USDC.address])
      ).toStrictEqual([500]);
    });

    test("DAI - WMATIC", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ERC20Token.WMATIC.address])
      ).toStrictEqual([500]);
    });

    test("UNI - WMATIC", () => {
      const UNI = "0xb33eaad8d922b1083446dc23f610c2567fb5180f";
      expect(getUniswapV3PoolFee([UNI, ERC20Token.USDC.address])).toStrictEqual(
        [3000]
      );
    });

    test("WETH - USDT", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.WETH.address, ERC20Token.USDT.address])
      ).toStrictEqual([3000]);
    });

    test("WETH - WMATIC- USDT", () => {
      expect(
        getUniswapV3PoolFee([
          ERC20Token.WETH.address,
          ERC20Token.WMATIC.address,
          ERC20Token.USDT.address,
        ])
      ).toStrictEqual([500, 500]);
    });
  });
});
