import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkArbitrage } from "./inchPrice";
import { baseTokens, interval, tradingTokens } from "./config";
import { flashloan } from "./flashloan";

const readline = require("readline");
const { Table } = require("console-table-printer");

export const main = async () => {
  console.clear();

  const p = new Table({
    // title: "Quotes",
    columns: [
      { name: "index", title: "#", alignment: "right" },

      { name: "fromToken", title: "From", alignment: "left" },
      { name: "toToken", title: "To", alignment: "left" },

      { name: "fromAmount", title: "Amount", alignment: "right" },
      { name: "toAmount", title: "Amount", alignment: "right" },
      { name: "difference", title: "±", alignment: "right" },

      { name: "error", title: "Error", alignment: "left", maxLen: 80 },

      { name: "time", title: "Time", alignment: "right" },
      { name: "timestamp", title: "Timestamp", alignment: "right" },
    ],
  });

  const pp = new Table({
    title: "Flash Loans",
    columns: [
      { name: "baseToken", title: "Base Token", alignment: "left" },
      { name: "tradingToken", title: "Trading Token", alignment: "left" },

      {
        name: "firstRoutes",
        title: "First Routes",
        alignment: "left",
        maxLen: 50,
      },
      {
        name: "secondRoutes",
        title: "Second Routes",
        alignment: "left",
        maxLen: 50,
      },

      {
        name: "txHash",
        title: "Transaction Hash",
        alignment: "left",
      },

      { name: "timestamp", title: "Timestamp", alignment: "right" },
    ],
  });

  baseTokens.forEach(async (baseToken, x, array) => {
    tradingTokens.forEach(async (tradingToken, y) => {
      p.addRow({
        index: x * array.length + y,

        fromToken: (baseToken === tradingToken ? "" : baseToken.symbol).padEnd(
          6
        ),
        toToken: (baseToken === tradingToken ? "" : tradingToken.symbol).padEnd(
          6
        ),

        fromAmount: "".padStart(7),
        toAmount: "".padStart(7),
        difference: "".padStart(7),

        time: "".padStart(5),
        timestamp: "".padStart(25),
      });
    });
  });

  const renderTables = () => {
    // console.clear();
    readline.cursorTo(process.stdout, 0, 0);

    p.printTable();

    if (pp.table.rows.length > 0) {
      pp.printTable();
    }
  };

  renderTables();

  setInterval(async () => {
    baseTokens.forEach(async (baseToken, x, array) => {
      tradingTokens.forEach(async (tradingToken, y) => {
        // prevent swapping the same token
        if (baseToken === tradingToken) return;

        const i = x * array.length + y;

        const [isProfitable, firstRoutes, secondRoutes] = await checkArbitrage(
          baseToken,
          tradingToken,
          {
            addRow: (text: any, options?: any) => {
              text.index = i;
              p.table.createColumnFromRow(text);
              p.table.rows[i] = {
                color: options?.color || "white",
                separator:
                  options?.separator !== undefined
                    ? options?.separator
                    : p.table.rowSeparator,
                text: text,
              };
            },
          }
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

              firstRoutes: firstRoutes.toString(),
              secondRoutes: secondRoutes.toString(),

              txHash: tx.hash,

              timestamp: new Date().toISOString(),
            });
          } else {
            // console.log("No routes found");
          }
        }

        renderTables();
      });
    });

    renderTables();
  }, interval);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
