import { ethers } from "ethers";
import { checkIfProfitable, getBigNumber } from "../src/utils";

describe("Utils tests", () => {
  test("getBigNumber", () => {
    expect(getBigNumber(10, 6)).toStrictEqual(
      ethers.BigNumber.from("10000000")
    );
  });

  describe("checkIfProfitable", () => {
    test("6 decimals", () => {
      expect(
        checkIfProfitable(getBigNumber(10000, 6), 0.02, getBigNumber(10011, 6))
      ).toBe(true);
    });

    test("18 decimals", () => {
      expect(
        checkIfProfitable(getBigNumber(10000), 0.43, getBigNumber(10091))
      ).toBe(true);
    });
  });
});
