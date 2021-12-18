import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkArbitrage } from "./inchPrice";
import { baseTokens, interval, tradingTokens, renderInterval } from "./config";
import { flashloan } from "./flashloan";
import chalk = require("chalk");

const readline = require("readline");
const { Table } = require("console-table-printer");

export const main = async () => {
  console.clear();

  let isFlashLoaning = false;

  const [maxX, _] = process.stdout.getWindowSize();

  const p = new Table({
    // title: "Quotes",
    columns: [
      { name: "index", title: "#", alignment: "right" },

      { name: "fromToken", title: "From", alignment: "left" },
      { name: "fromAmount", title: "Amount", alignment: "right" },

      { name: "toToken", title: "To", alignment: "left" },
      { name: "toAmount", title: "Amount", alignment: "right" },

      { name: "difference", title: "±", alignment: "right" },
      { name: "percentage", title: "%", alignment: "right" },

      { name: "log", title: "Log", alignment: "left", maxLen: maxX - 101 },

      { name: "time", title: "Time", alignment: "right" },
      { name: "timestamp", title: "Timestamp", alignment: "right" },
    ],
  });

  const pp = new Table({
    title: "Flash Loans",
    columns: [
      { name: "baseToken", title: "From", alignment: "left" },
      { name: "tradingToken", title: "To", alignment: "left" },

      { name: "amount", title: "Amount", alignment: "right" },

      { name: "difference", title: "±", alignment: "right" },
      { name: "percentage", title: "%", alignment: "right" },

      {
        name: "firstRoutes",
        title: "First Routes",
        alignment: "left",
        maxLen: maxX / 2 - 78,
      },
      {
        name: "secondRoutes",
        title: "Second Routes",
        alignment: "left",
        maxLen: maxX / 2 - 79,
      },

      {
        name: "txHash",
        title: "Transaction Hash",
        alignment: "left",
      },

      { name: "time", title: "Time", alignment: "right" },
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
        percentage: "".padStart(5),

        time: "".padStart(6),
        timestamp: "".padStart(24),
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

  const chalkTime = (time: number) => {
    if (time < 0.1) {
      return "";
    }
    const timeStr = time.toFixed(1) + "s";
    if (time < 30) {
      return timeStr;
    } else if (time < 60) {
      return chalk.yellow(timeStr);
    } else {
      return chalk.red(timeStr);
    }
  };

  // const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  setInterval(() => {
    renderTables();
  }, renderInterval);

  baseTokens.forEach(async (baseToken, x) => {
    tradingTokens.forEach(async (tradingToken, y) => {
      // prevent swapping the same token
      if (baseToken === tradingToken) return;

      const i = x * baseTokens.length + y;

      // await delay(interval / (baseTokens.length * tradingTokens.length) * i)

      const func = async () => {
        const startTime = Date.now();

        const [
          isProfitable,
          firstRoutes,
          secondRoutes,
          amount,
          difference,
          percentage,
        ] = await checkArbitrage(
          baseToken,
          tradingToken,

          (text: any, options?: any) => {
            text.time = chalkTime((Date.now() - startTime) / 100).padStart(6);
            text.timestamp = new Date().toISOString();

            p.table.createColumnFromRow(text);
            p.table.rows[i] = {
              color: options?.color || p.table.rows[i].color,
              separator:
                options?.separator !== undefined
                  ? options?.separator
                  : p.table.rows[i].separator,
              text: { ...p.table.rows[i].text, ...text },
            };
          }
        );

        renderTables();

        if (isProfitable && !isFlashLoaning) {
          // console.log("Arbitrage detected!");
          if (firstRoutes && secondRoutes) {
            isFlashLoaning = true;

            const startTime = Date.now();

            const tx = await flashloan(
              baseToken,
              tradingToken,
              firstRoutes,
              secondRoutes
            );

            pp.addRow({
              baseToken: baseToken.symbol.padEnd(6),
              tradingToken: tradingToken.symbol.padEnd(6),

              amount: (amount || "").padStart(7),
              difference: (difference || "").padStart(6),
              percentage: (percentage || "").padStart(4),

              firstRoutes: firstRoutes
                .map((route) => route.name.replace("POLYGON_", ""))
                .join(" → "),
              secondRoutes: secondRoutes
                .map((route) => route.name.replace("POLYGON_", ""))
                .join(" → "),

              txHash: tx.hash.padStart(66),

              time: chalkTime((Date.now() - startTime) / 100).padStart(6),
              timestamp: new Date().toISOString(),
            });

            isFlashLoaning = false;

            renderTables();
          } else {
            // console.log("No routes found");
          }
        }
      };

      func();

      setInterval(func, interval);
    });
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
