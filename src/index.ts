import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import {
  interval,
  renderInterval,
  explorerURL,
  gasLimit,
  tradingRoutes,
  diffPercentage,
} from "./config";
import { flashloan } from "./flashloan";
import { checkIfProfitable, getBigNumber } from "./utils";
import { ethers } from "ethers";
// import { chalkDifference, chalkPercentage, chalkTime } from "./utils/chalk";
import { flashloanTable, priceTable } from "./consoleUI/table";
// import { initPriceTable, renderTables } from "./consoleUI";
import * as log4js from "log4js";
import { findOpp } from "./findOpp";

log4js.configure({
  appenders: {
    flashloan: { type: "file", filename: "log/flashloan.log" },
    error: { type: "file", filename: "log/error.log" },
  },
  categories: {
    default: { appenders: ["flashloan"], level: "info" },
    error: { appenders: ["error"], level: "warn" },
  },
});

const logger = log4js.getLogger("flashloan");
const errReport = log4js.getLogger("error");

export const main = async () => {
  let isFlashLoaning = false;
  tradingRoutes.forEach(async (trade) => {
    const baseToken = trade.path[0];

    const func = async () => {
      const bnLoanAmount = trade.amountIn;
      // estimate the token amount you get atfer swaps
      let bnExpectedAmountOut = await findOpp(trade);
      const isProfitable = checkIfProfitable(
        bnLoanAmount,
        diffPercentage,
        bnExpectedAmountOut
      );

      if (isProfitable && !isFlashLoaning) {
        isFlashLoaning = true;
        try {
          const tx = await flashloan(trade);
          const stDifference = Number(
            ethers.utils.formatUnits(
              bnExpectedAmountOut.sub(bnLoanAmount),
              baseToken.decimals
            )
          ).toFixed(4);
          const amount = Number(
            ethers.utils.formatUnits(bnExpectedAmountOut, baseToken.decimals)
          ).toFixed(4);
          const loanAmount = Number(
            ethers.utils.formatUnits(bnLoanAmount, baseToken.decimals)
          );
          const difference = Number(stDifference);
          const percentage = Number(
            ((difference / loanAmount) * 100).toFixed(2)
          );
          const path = trade.path.map((token) => {
            return token.symbol;
          });
          logger.info("path", path, "protocols", trade.protocols);
          logger.info({ amount, difference, percentage });
          logger.info(`Explorer URL: ${explorerURL}/tx/${tx.hash}`);
        } catch (e) {
          errReport.error(e);
        } finally {
          isFlashLoaning = false;
        }
      }
    };

    func();
    setInterval(func, interval);
  });
};

main().catch((error) => {
  console.error(error);
  errReport.error(error);
  process.exit(1);
});
