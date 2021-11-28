import { calcProfit } from "../src/utils";

test("calcProfit", async () => {
  expect(calcProfit(1500, 1480, 30)).toBe(-50.75);
});
