import { Table } from "console-table-printer";
const readline = require("readline");

// export const initPriceTable = (p: Table, idx: number) => {
//   baseTokens.forEach(async (baseToken) => {
//     tradingTokens.forEach(async (tradingToken) => {
//       if (baseToken.address > tradingToken.address) {
//         p.addRow({
//           index: idx,

//           fromToken: (baseToken === tradingToken
//             ? ""
//             : baseToken.symbol
//           ).padEnd(6),
//           toToken: (baseToken === tradingToken
//             ? ""
//             : tradingToken.symbol
//           ).padEnd(6),

//           fromAmount: "".padStart(7),
//           toAmount: "".padStart(7),

//           difference: "".padStart(7),
//           percentage: "".padStart(5),

//           time: "".padStart(6),
//           timestamp: "".padStart(24),
//         });

//         idx++;
//       }
//     });
//   });
// };

// export const renderTables = (p: Table, pp: Table) => {
//   // console.clear();
//   readline.cursorTo(process.stdout, 0, 0);

//   p.printTable();

//   if (pp.table.rows.length > 0) {
//     pp.printTable();
//   }
// };
