import { ethers } from "ethers";
import { ERC20Token, uniswapRouter } from "../../constants/addresses";
import { IProtocol } from "../../interfaces/inch";
import { Hop, IFlashloanRoute, Swap } from "../../interfaces/main";
import { findRouterFromProtocol, replaceTokenAddress } from "../../utils";
import { getRouteParts, toInt } from "../../utils/split";
import { getUniswapV3PoolFee } from "../uniswap/v3/fee";

const protocolNameToNumber = (protocolName: string): number => {
  let protocolNumber = 0;
  for (const name of Object.keys(uniswapRouter)) {
    if (name === protocolName) {
      return protocolNumber;
    }
    protocolNumber++;
  }
  throw new Error(`Unknown protocol name: ${protocolName}`);
};

export const createRoutes = (routes: IProtocol[][][]): IFlashloanRoute[] => {
  let flashloanRoutes: IFlashloanRoute[] = [];
  let i = 0;
  const routeParts = getRouteParts(routes.length);
  for (const hops of routes) {
    const part = routeParts[i];
    let route: IFlashloanRoute = {
      part: part,
      hops: toHops(hops),
    };
    flashloanRoutes.push(route);
    i++;
  }
  return flashloanRoutes;
};

const toHops = (results: IProtocol[][]) => {
  let hops: Hop[] = [];
  for (const result of results) {
    const path = [result[0].fromTokenAddress, result[0].toTokenAddress].map(
      (token) => {
        return replaceTokenAddress(
          token,
          ERC20Token.MATIC.address,
          ERC20Token.WMATIC.address
        );
      }
    );
    let hop: Hop = {
      path: path,
      swaps: toSwaps(result),
    };
    hops.push(hop);
  }
  return hops;
};

const toSwaps = (results: IProtocol[]) => {
  let swaps: Swap[] = [];
  for (const result of results) {
    const protocol = protocolNameToNumber(result.name);
    swaps.push({
      protocol: protocol,
      part: toInt(result.part),
      data: getProtocolData(
        protocol,
        replaceTokenAddress(
          result.fromTokenAddress,
          ERC20Token.MATIC.address,
          ERC20Token.WMATIC.address
        ),
        replaceTokenAddress(
          result.toTokenAddress,
          ERC20Token.MATIC.address,
          ERC20Token.WMATIC.address
        )
      ),
    });
  }
  return swaps;
};

const getProtocolData = (
  protocol: number,
  fromToken: string,
  toToken: string
) => {
  if (protocol === 0) {
    // uniswap V3
    return ethers.utils.defaultAbiCoder.encode(
      ["address", "uint24"],
      [
        findRouterFromProtocol(protocol),
        getUniswapV3PoolFee([fromToken, toToken]),
      ]
    );
  } else {
    // uniswap V2
    return ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [findRouterFromProtocol(protocol)]
    );
  }
};
