import chalk = require("chalk");

// export const chalkDifference = (difference: number) => {
//   const fixedDiff = difference.toFixed(1);
//   if (difference < 0) {
//     return chalk.red(fixedDiff);
//   } else if (difference < diffAmount) {
//     return chalk.yellow(fixedDiff);
//   } else {
//     return chalk.green(fixedDiff);
//   }
// };

export const chalkPercentage = (percentage: number) => {
  const fixedDiff = percentage.toFixed(1);
  if (percentage < 0) {
    return chalk.red(fixedDiff);
  } else {
    return chalk.green(fixedDiff);
  }
};

export const chalkTime = (time: number) => {
  if (time < 0.1) {
    return "";
  }
  const timeStr = time.toFixed(1) + "s";
  if (time < 3) {
    return timeStr;
  } else if (time < 6) {
    return chalk.yellow(timeStr);
  } else {
    return chalk.red(timeStr);
  }
};
