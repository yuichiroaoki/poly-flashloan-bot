import { Contract, ethers } from "ethers";

export const getNativeBalance = async (
  provider: ethers.providers.JsonRpcProvider,
  address: string
) => {
  const balance = await provider.getBalance(address).then((bigNumBalance) => {
    const strBalance = ethers.utils.formatUnits(bigNumBalance, 18).slice(0, 9);
    return parseFloat(strBalance);
  });
  return balance;
};

export const getErc20Balance = async (
  contract: Contract,
  address: string,
  decimals: number
) => {
  const balance = await contract
    .balanceOf(address)
    .then((bigNumBalance: any) => {
      const strBalance = ethers.utils
        .formatUnits(bigNumBalance, decimals)
        .slice(0, 9);
      return parseFloat(strBalance);
    });
  return balance;
};
