import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkArbitrage } from "./inchPrice";
import { baseToken, interval, tradingTokens } from "./config";
import { flashloan } from "./flashloan";

export const main = async () => {
  setInterval(async () => {
    for (const tradingToken of tradingTokens) {
      const [isProfitable, firstRoutes, secondRoutes] = await checkArbitrage(
        baseToken,
        tradingToken,
        18
      );

      if (isProfitable) {
        console.log("Arbitrage detected!", tradingToken);
        if (firstRoutes && secondRoutes) {
          await flashloan(baseToken, tradingToken, firstRoutes, secondRoutes);
        } else {
          console.log("No routes found");
        }
      }
    }
  }, interval);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
