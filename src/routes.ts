import { ethers } from "ethers";
import { IToken } from "./constants/addresses";
import { Hop, IFlashloanRoute } from "./interfaces/main";
import { ITrade } from "./interfaces/trade";
import { getUniswapV3PoolFee } from "./price/uniswap/v3/fee";
import { findRouterFromProtocol } from "./utils";

const getDataBytesForProtocol = (
  tokenIn: IToken,
  tokenOut: IToken,
  protocol: number
) => {
  switch (protocol) {
    // uniswap V3
    case 0:
      return ethers.utils.defaultAbiCoder.encode(
        ["address", "uint24"],
        [
          findRouterFromProtocol(0),
          getUniswapV3PoolFee([tokenIn.address, tokenOut.address]),
        ]
      );
    // uniswap V2
    default:
      return ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [findRouterFromProtocol(protocol)]
      );
  }
};

export const passRoutes = (trade: ITrade): IFlashloanRoute[] => {
  let hops: Hop[] = [];
  trade.protocols.forEach((protocol, i) => {
    const tokenIn = trade.path[i];
    const tokenOut = trade.path[i + 1];
    const hop: Hop = {
      protocol: protocol,
      data: getDataBytesForProtocol(tokenIn, tokenOut, protocol),
      path: [tokenIn.address, tokenOut.address],
    };
    hops.push(hop);
  });
  return [
    {
      hops: hops,
      part: 10000,
    },
  ];
};
