import { Table } from "console-table-printer";

export const priceTable = (maxX: number) =>
  new Table({
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

export const flashloanTable = (maxX: number) =>
  new Table({
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
