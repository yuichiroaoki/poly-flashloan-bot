import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { BigNumber, ethers } from "ethers";
import axios from "axios";
import { chainId, protocols } from "./config";
import { IRoute } from "./interfaces/main";

/**
 * Will get the 1inch API call URL for a trade
 * @param chainId chain id of the network
 * @param fromTokenAddress token address of the token you want to sell
 * @param toTokenAddress token address of the token you want to buy
 * @param amount amount of the token you want to sell
 * @returns call URL for 1inch API
 */
function get1inchQuoteCallUrl(
  chainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: BigNumber
): string {
  const callURL =
    "https://api.1inch.exchange/v3.0/" +
    chainId +
    "/quote?" +
    "fromTokenAddress=" +
    fromTokenAddress +
    "&toTokenAddress=" +
    toTokenAddress +
    "&amount=" +
    amount.toString() +
    "&mainRouteParts=50" +
    "&protocols=" +
    protocols;

  return callURL;
}

/**
 * Will call the api and return the current price
 * @param fromTokenAddress token address you're swapping from
 * @param toTokenAddress token address you're swapping to
 * @param amount amount of token you're swappping from
 * @returns the current token price
 */
export async function get1inchQuote(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string = ethers.utils.parseUnits("1.0", 18).toString()
): Promise<number | null> {
  let callURL =
    "https://api.1inch.exchange/v3.0/" +
    chainId +
    "/quote?" +
    "fromTokenAddress=" +
    fromTokenAddress +
    "&toTokenAddress=" +
    toTokenAddress +
    "&amount=" +
    amount;

  const result = await sendRequest(callURL);
  if (!result) {
    return null;
  }
  let tokenAmount = result.toTokenAmount;

  const rate = ethers.utils.formatUnits(tokenAmount, 18).slice(0, 9);

  return parseFloat(rate);
}

/**
 * Will check if there's an arbitrage opportunity using the 1inch API
 * @param fromTokenAddress token address you're swapping from
 * @param toTokenAddress token address you're swapping to
 * @param fromTokenDecimal number of decimal places of the token you're swapping from
 * @returns
 */
export async function checkArbitrage(
  fromTokenAddress: string,
  toTokenAddress: string,
  fromTokenDecimal: number = 18
): Promise<[boolean, IRoute[] | null, IRoute[] | null]> {
  const initialAmount = "1000";
  const amount = ethers.utils.parseUnits(initialAmount, fromTokenDecimal);
  const firstCallURL = get1inchQuoteCallUrl(
    chainId,
    fromTokenAddress,
    toTokenAddress,
    amount
  );

  const resultData1 = await sendRequest(firstCallURL);
  if (!resultData1) {
    return [false, null, null];
  }

  const firstRoute = getProtocols(resultData1.protocols);
  const returnAmount = resultData1.toTokenAmount;
  const secondCallURL = get1inchQuoteCallUrl(
    chainId,
    toTokenAddress,
    fromTokenAddress,
    returnAmount
  );

  const resultData2 = await sendRequest(secondCallURL);
  if (!resultData2) {
    return [false, null, null];
  }
  const secondRoute = getProtocols(resultData2.protocols);

  const isProfitable = amount.lt(
    ethers.BigNumber.from(resultData2.toTokenAmount)
  );
  isProfitable && console.log({ firstRoute, secondRoute });

  isProfitable &&
    console.log(
      initialAmount,
      ethers.utils.formatUnits(resultData2.toTokenAmount, 18).slice(0, 9)
    );

  return [isProfitable, firstRoute, secondRoute];
}

const sendRequest = async (url: string) => {
  let response: any = await axios
    .get(url)
    .then((result) => {
      return result.data;
    })
    .catch(() => {
      console.log("Error: Failed to fetch data from 1inch");
      return null;
    });

  return response;
};

interface IProtocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

const getProtocols = (protocols: IProtocol[][][]): IRoute[] => {
  let route: IRoute[] = [];
  const mainRoute = protocols[0];
  for (const onehop of mainRoute) {
    const besthop = getMaxPart(onehop);
    route.push({
      name: besthop.name,
      toTokenAddress: besthop.toTokenAddress,
    });
  }
  return route;
};

const getMaxPart = (onehop: IProtocol[]): IProtocol => {
  let maxPart = 0;
  let key = 0;
  onehop.forEach((protocol, index) => {
    if (maxPart < protocol.part) {
      maxPart = protocol.part;
      key = index;
    }
  });
  return onehop[key];
};
