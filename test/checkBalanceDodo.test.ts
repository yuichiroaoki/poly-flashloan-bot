import { ethers } from "ethers";
import { getBigNumber } from "../src/utils";
import { dodoV2Pool, ERC20Token } from "../src/constants/addresses";
import { polygonChainID } from "../src/constants/chainId";
import * as DodoPool from "../src/abis/IDODO.json";
import { Network } from "@ethersproject/networks";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

describe("DODO pool check", () => {
  const matic: Network = {
    name: "matic",
    chainId: polygonChainID,
    _defaultProvider: (providers) =>
      new providers.JsonRpcProvider(process.env.ALCHEMY_POLYGON_RPC_URL),
  };
  const provider = ethers.getDefaultProvider(matic);

  describe("Check if dodo pools have enough tokens", () => {
    for (const [name, poolAddr] of Object.entries(dodoV2Pool)) {
      test(name, async () => {
        const dodoPool = new ethers.Contract(poolAddr, DodoPool.abi, provider);
        expect(
          (await dodoPool._BASE_RESERVE_()).gt(getBigNumber(10000, 6))
        ).toBe(true);
        expect(
          (await dodoPool._QUOTE_RESERVE_()).gt(getBigNumber(10000, 6))
        ).toBe(true);
      });
    }
  });
});
