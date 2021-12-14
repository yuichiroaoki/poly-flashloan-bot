import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkArbitrage } from "./inchPrice";
import { baseTokens, interval, tradingTokens } from "./config";
import { flashloan } from "./flashloan";

export const main = async () => {
  setInterval(async () => {
    for (const baseToken of baseTokens) {
      for (const tradingToken of tradingTokens) {
        // prevent swapping the same token
        if (baseToken === tradingToken) continue;

        const [isProfitable, firstRoutes, secondRoutes] = await checkArbitrage(
          baseToken,
          tradingToken,
          18
        );

        if (isProfitable) {
          console.log("Arbitrage detected!");
          if (firstRoutes && secondRoutes) {
            await flashloan(baseToken, tradingToken, firstRoutes, secondRoutes);
          } else {
            console.log("No routes found");
          }
        }
      }
    }
  }, interval);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
