export interface exchangeRateInterface {
  buy: number;
  sell: number;
}

export interface TokenInterface {
  address: string;
  decimal: number;
  symbol: string;
  midAddress?: string;
  midDecimal?: number;
}

enum Status {
  Stay = 0,
  Buy,
  Sell,
}

export interface IPriveChangeInfo {
  base: number;
  change: number;
  status: Status;
}

export interface IRoute {
  name: string;
  toTokenAddress: string;
}
