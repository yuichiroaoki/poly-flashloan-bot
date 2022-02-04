import { BigNumber } from "ethers";
import { protocols } from "../../config";

/**
 * Will get the 1inch API call URL for a trade
 * @param chainId chain id of the network
 * @param fromTokenAddress token address of the token you want to sell
 * @param toTokenAddress token address of the token you want to buy
 * @param amount amount of the token you want to sell
 * @returns call URL for 1inch API
 */
export function get1inchQuoteCallUrl(
  chainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: BigNumber
): string {
  const params = {
    fromTokenAddress: fromTokenAddress,
    toTokenAddress: toTokenAddress,
    amount: amount.toString(),
    protocols: protocols,
  };
  const apiURL = "https://api.1inch.exchange/v4.0/";
  const searchString = new URLSearchParams(params);
  const callURL = `${apiURL}${chainId}/quote?${searchString}`;
  return callURL;
}
