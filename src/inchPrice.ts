import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import chalk = require("chalk");
import { BigNumber, ethers } from "ethers";
import axios from "axios";
import { chainId, protocols, initialAmount, diffAmount } from "./config";
import { IRoute } from "./interfaces/main";
import { IToken } from "./constrants/addresses";

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
    "https://api.1inch.exchange/v4.0/" +
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
    "https://api.1inch.exchange/v4.0/" +
    chainId +
    "/quote" +
    "?" +
    // contract address of a token to sell
    "fromTokenAddress=" +
    fromTokenAddress +
    "&" +
    // contract address of a token to buy
    "toTokenAddress=" +
    toTokenAddress +
    "&" +
    // amount of a token to sell
    "amount=" +
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
 * @param fromToken token symbol you're swapping from
 * @param toToken token symbol you're swapping to
 * @param fromTokenDecimal number of decimal places of the token you're swapping from
 * @returns
 */
export async function checkArbitrage(
  fromToken: IToken,
  toToken: IToken,
  updateRow: Function
): Promise<
  [boolean, IRoute[] | null, IRoute[] | null, string?, string?, string?]
> {
  // Reset the row to default values.
  updateRow(
    {
      log: ``,
    },
    {
      color: "white",
    }
  );

  const fromTokenDecimal = fromToken.decimals;

  const amount = ethers.utils.parseUnits(
    initialAmount.toString(),
    fromTokenDecimal
  );
  const amountDiff = ethers.utils.parseUnits(
    (initialAmount + diffAmount).toString(),
    fromTokenDecimal
  );

  const firstCallURL = get1inchQuoteCallUrl(
    chainId,
    fromToken.address,
    toToken.address,
    amount
  );

  updateRow({
    log: `Getting quote for ${fromToken.symbol} → ${toToken.symbol}…`,
  });

  const resultData1 = await sendRequest(firstCallURL);
  if (!!resultData1.isAxiosError) {
    const e = resultData1;

    updateRow(
      {
        fromToken: fromToken.symbol.padEnd(6),
        toToken: toToken.symbol.padEnd(6),

        fromAmount: Number(ethers.utils.formatUnits(amount, fromTokenDecimal))
          .toFixed(2)
          .padStart(7),

        log:
          e.response.status +
          ": " +
          e.response.statusText +
          " (" +
          e.response.data.error +
          ")",
      },
      {
        color: "red",
      }
    );

    return [false, null, null];
  }

  const firstRoute = getProtocols(resultData1.protocols);
  const returnAmount = resultData1.toTokenAmount;
  const secondCallURL = get1inchQuoteCallUrl(
    chainId,
    toToken.address,
    fromToken.address,
    returnAmount
  );

  updateRow({
    log: `Getting quote for ${toToken.symbol} → ${fromToken.symbol}…`,
  });

  const resultData2 = await sendRequest(secondCallURL);
  if (!!resultData2.isAxiosError) {
    const e = resultData2;

    updateRow(
      {
        fromToken: resultData1.fromToken.symbol.padEnd(6),
        toToken: toToken.symbol.padEnd(6),

        fromAmount: Number(
          ethers.utils.formatUnits(
            resultData1.fromTokenAmount,
            resultData1.fromToken.decimals
          )
        )
          .toFixed(2)
          .padStart(7),

        log:
          e.response.status +
          ": " +
          e.response.statusText +
          " (" +
          e.response.data.error +
          ")",
      },
      {
        color: "red",
      }
    );

    return [false, null, null];
  }
  const secondRoute = getProtocols(resultData2.protocols);

  const isProfitable = amountDiff.lt(
    ethers.BigNumber.from(resultData2.toTokenAmount)
  );
  // isProfitable && console.log({ firstRoute, secondRoute });

  const fromTokenAmount = Number(
    ethers.utils.formatUnits(
      resultData1.fromTokenAmount,
      resultData1.fromToken.decimals
    )
  );
  const toTokenAmount = Number(
    ethers.utils.formatUnits(
      resultData2.toTokenAmount,
      resultData2.toToken.decimals
    )
  );
  const difference = Number(toTokenAmount) - Number(fromTokenAmount);
  const percentage = (difference / Number(fromTokenAmount)) * 100;

  updateRow(
    {
      fromToken: resultData1.fromToken.symbol.padEnd(6),
      toToken: resultData1.toToken.symbol.padEnd(6),

      fromAmount: fromTokenAmount.toFixed(2).padStart(7),
      toAmount: toTokenAmount.toFixed(2).padStart(7),

      difference: chalkDifference(difference).padStart(7),
      percentage: chalkPercentage(percentage).padStart(5),

      log: "",
    },
    {
      color: isProfitable ?? "green",
    }
  );

  // isProfitable &&
  //   console.warn(
  //     _initialAmount,
  //     ethers.utils.formatUnits(resultData2.toTokenAmount, resultData2.toToken.decimals)
  //   );

  return [
    isProfitable,
    firstRoute,
    secondRoute,
    toTokenAmount.toFixed(2),
    chalkDifference(difference),
    chalkPercentage(percentage),
  ];
}

const chalkDifference = (difference: number) => {
  const fixedDiff = difference.toFixed(1);
  if (difference < 0) {
    return chalk.red(fixedDiff);
  } else if (difference < diffAmount) {
    return chalk.yellow(fixedDiff);
  } else {
    return chalk.green(fixedDiff);
  }
};

const chalkPercentage = (percentage: number) => {
  const fixedDiff = percentage.toFixed(1);
  if (percentage < 0) {
    return chalk.red(fixedDiff);
  } else {
    return chalk.green(fixedDiff);
  }
};

const sendRequest = async (url: string) => {
  let response: any = await axios
    .get(url)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      return error;
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
