import { findToken } from "../../../utils";

type FeeMap = {
  [pair: string]: {
    [pair: string]: number;
  };
};

/**
 * ref. https://info.uniswap.org/#/polygon/
 * Solidity does not support float values, so pool fees are multiplied by 10^4
 * 0.05% -> 500
 * 0.3% -> 3000
 */
export const uniswapV3Fee: FeeMap = {
  DAI: {
    USDC: 500,
    USDT: 500,
    WETH: 3000,
    WMATIC: 500,
    WBTC: 3000,
  },
  USDC: {
    DAI: 500, // https://info.uniswap.org/#/polygon/pools/0x5f69c2ec01c22843f8273838d570243fd1963014
    USDT: 500,
    WETH: 500,
    WMATIC: 500,
    WBTC: 3000,
  },
  USDT: {
    DAI: 500, // https://info.uniswap.org/#/polygon/pools/0x42f0530351471dab7ec968476d19bd36af9ec52d
    USDC: 500, // https://info.uniswap.org/#/polygon/pools/0x3f5228d0e7d75467366be7de2c31d0d098ba2c23
    WETH: 3000,
    WMATIC: 500,
  },
  WBTC: {
    WMATIC: 500,
    WETH: 500,
  },
  WETH: {
    DAI: 3000, // https://info.uniswap.org/#/polygon/pools/0x6bad0f9a89ca403bb91d253d385cec1a2b6eca97
    USDC: 500, // https://info.uniswap.org/#/polygon/pools/0x45dda9cb7c25131df268515131f647d726f50608
    USDT: 3000, // https://info.uniswap.org/#/polygon/pools/0x4ccd010148379ea531d6c587cfdd60180196f9b1
    WMATIC: 500,
  },
  WMATIC: {
    DAI: 500, // https://info.uniswap.org/#/polygon/pools/0x0f663c16dd7c65cf87edb9229464ca77aeea536b
    USDC: 500, // https://info.uniswap.org/#/polygon/pools/0xa374094527e1673a86de625aa59517c5de346d32
    USDT: 500, // https://info.uniswap.org/#/polygon/pools/0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7
    WETH: 500, // https://info.uniswap.org/#/polygon/pools/0x86f1d8390222a3691c28938ec7404a1661e618e0
  },
};

export const getUniswapV3PoolFee = (tokenAddresses: string[]): number => {
  const tokens = tokenAddresses.map(findToken).sort();
  try {
    const fee = uniswapV3Fee[tokens[0]][tokens[1]];
    if (!fee) {
      throw new Error("No fee found");
    }
    return fee;
  } catch (error) {
    // set default as 0.3%
    return 3000;
  }
};

export const getUniswapV3PoolFeeArray = (
  tokenAddresses: string[]
): number[] => {
  let feeArray = [];
  const tokens = tokenAddresses.map(findToken);
  for (let i = 0; i < tokens.length - 1; i++) {
    try {
      feeArray.push(uniswapV3Fee[tokens[i]][tokens[i + 1]]);
    } catch (error) {
      // set default as 0.3%
      feeArray.push(3000);
    }
  }
  return feeArray;
};
