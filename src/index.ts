import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkArbitrage } from "./inchPrice";
import { baseTokens, interval, tradingTokens } from "./config";
import { flashloan } from "./flashloan";

const readline = require("readline");
const { Table } = require("console-table-printer");

export const main = async () => {
  console.clear();

  const pp = new Table({
    title: "Flash Loans",
    columns: [
      { name: "baseToken", title: "Base Token", alignment: "left" },
      { name: "tradingToken", title: "Trading Token", alignment: "left" },

      { name: "firstRoutes", title: "First Routes", alignment: "left" },
      { name: "secondRoutes", title: "Second Routes", alignment: "left" },

      {
        name: "txHash",
        title: "Transaction Hash",
        alignment: "left",
        maxLen: 80,
      },

      { name: "timestamp", title: "Timestamp", alignment: "right" },
    ],
  });

  setInterval(async () => {
    const p = new Table({
      title: "Quotes [" + new Date().toISOString() + "]",
      columns: [
        { name: "fromToken", title: "From", alignment: "left" },
        { name: "toToken", title: "To", alignment: "left" },

        { name: "fromAmount", title: "Amount", alignment: "right" },
        { name: "toAmount", title: "Amount", alignment: "right" },
        { name: "difference", title: "+/-", alignment: "right" },

        { name: "error", title: "Error", alignment: "left", maxLen: 80 },

        { name: "time", title: "Time", alignment: "right" },
        { name: "timestamp", title: "Timestamp", alignment: "right" },
      ],
    });

    for (const baseToken of baseTokens) {
      for (const tradingToken of tradingTokens) {
        // prevent swapping the same token
        if (baseToken === tradingToken) continue;

        const [isProfitable, firstRoutes, secondRoutes] = await checkArbitrage(
          baseToken,
          tradingToken,
          p
        );

        if (isProfitable) {
          // console.log("Arbitrage detected!");
          if (firstRoutes && secondRoutes) {
            const tx = await flashloan(
              baseToken,
              tradingToken,
              firstRoutes,
              secondRoutes
            );

            pp.addRow({
              baseToken: baseToken,
              tradingToken: tradingToken,

              firstRoutes: firstRoutes,
              secondRoutes: secondRoutes,

              txHash: tx.hash,

              timestamp: new Date().toISOString(),
            });
          } else {
            // console.log("No routes found");
          }
        }
      }
    }

    readline.cursorTo(process.stdout, 0, 0);

    p.printTable();

    if (pp.table.rows.length > 0) {
      pp.printTable();
    }
  }, interval);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
