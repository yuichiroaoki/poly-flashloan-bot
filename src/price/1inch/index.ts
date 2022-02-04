import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { BigNumber, ethers } from "ethers";
import { chainId, protocols, diffAmount, loanAmount } from "../../config";
import { IRoute } from "../../interfaces/main";
import { ERC20Token, IToken } from "../../constants/addresses";
import { replaceTokenAddress } from "../../utils";
import { IProtocol } from "../../interfaces/inch";
import { sendRequest } from "../../utils/request";
import { chalkDifference, chalkPercentage } from "../../utils/chalk";
import { get1inchQuoteCallUrl } from "./url";

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
): Promise<[boolean, IProtocol[][][] | null, IProtocol[][][] | null, string?]> {
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
    loanAmount.toString(),
    fromTokenDecimal
  );
  const amountDiff = ethers.utils.parseUnits(
    (loanAmount + diffAmount).toString(),
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
          e.response !== undefined
            ? e.response.status +
              ": " +
              e.response.statusText +
              " (" +
              e.response.data.error +
              ")"
            : "",
      },
      {
        color: "red",
      }
    );

    return [false, null, null];
  }

  const firstProtocols = resultData1.protocols;
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
          e.response !== undefined
            ? e.response.status +
              ": " +
              e.response.statusText +
              " (" +
              e.response.data.error +
              ")"
            : "",
      },
      {
        color: "red",
      }
    );

    return [false, null, null];
  }
  const secondProtocols = resultData2.protocols;

  const isProfitable = amountDiff.lt(
    ethers.BigNumber.from(resultData2.toTokenAmount)
  );

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
  //     _loanAmount,
  //     ethers.utils.formatUnits(resultData2.toTokenAmount, resultData2.toToken.decimals)
  //   );

  return [
    isProfitable,
    firstProtocols,
    secondProtocols,
    toTokenAmount.toFixed(2),
  ];
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

const getRoutes = (protocols: IProtocol[][][]): IRoute[] => {
  let routes = getProtocols(protocols);
  for (const route of routes) {
    route.toTokenAddress = replaceTokenAddress(
      route.toTokenAddress,
      ERC20Token.MATIC.address,
      ERC20Token.WMATIC.address
    );
  }
  return routes;
};
