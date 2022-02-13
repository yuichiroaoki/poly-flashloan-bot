import { ethers } from "ethers";
import { ERC20Token, uniswapRouter } from "../src/constants/addresses";
import {
  getUniswapV3PoolFee,
  getUniswapV3PoolFeeArray,
  uniswapV3Fee,
} from "../src/price/uniswap/v3/fee";
import { findToken } from "../src/utils";

describe("UniswapV3 pool fee test", () => {
  describe("Check if it returns the correct a pool fee.", () => {
    test("DAI - USDC", () => {
      expect(
        getUniswapV3PoolFeeArray([
          ERC20Token.DAI.address,
          ERC20Token.USDC.address,
        ])
      ).toStrictEqual([500]);
    });

    test("DAI - USDC", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ERC20Token.USDC.address])
      ).toStrictEqual(500);
    });

    test("DAI - WMATIC", () => {
      expect(
        getUniswapV3PoolFeeArray([
          ERC20Token.DAI.address,
          ERC20Token.WMATIC.address,
        ])
      ).toStrictEqual([500]);
    });

    test("DAI - WMATIC", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ERC20Token.WMATIC.address])
      ).toStrictEqual(500);
    });

    test("UNI - WMATIC", () => {
      expect(
        getUniswapV3PoolFeeArray([
          ERC20Token.UNI.address,
          ERC20Token.USDC.address,
        ])
      ).toStrictEqual([3000]);
    });

    test("UNI - WMATIC", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.UNI.address, ERC20Token.USDC.address])
      ).toStrictEqual(3000);
    });

    test("WETH - USDT", () => {
      expect(
        getUniswapV3PoolFeeArray([
          ERC20Token.WETH.address,
          ERC20Token.USDT.address,
        ])
      ).toStrictEqual([3000]);
    });

    test("WETH - WMATIC- USDT", () => {
      expect(
        getUniswapV3PoolFeeArray([
          ERC20Token.WETH.address,
          ERC20Token.WMATIC.address,
          ERC20Token.USDT.address,
        ])
      ).toStrictEqual([500, 500]);
    });
  });

  describe("pool fee error check", () => {
    test("invalid BigNumber value", () => {
      expect(() => {
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint24"],
          [uniswapRouter.POLYGON_UNISWAP_V3, undefined]
        );
      }).toThrowError("invalid BigNumber value");
    });

    test("find WBTC", () => {
      expect(findToken(ERC20Token.WBTC.address)).toStrictEqual("WBTC");
    });

    test("USDC - WBTC", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ERC20Token.WBTC.address])
      ).not.toStrictEqual(undefined);
    });

    test("USDC - undefined", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ""])
      ).not.toStrictEqual(undefined);
    });

    test("USDC - LINK", () => {
      expect(
        getUniswapV3PoolFee([ERC20Token.DAI.address, ERC20Token.LINK.address])
      ).not.toStrictEqual(undefined);
    });

    test("undefined fee", () => {
      expect(uniswapV3Fee["USDC"]["WBTC"]).not.toStrictEqual(undefined);
    });
  });
});
