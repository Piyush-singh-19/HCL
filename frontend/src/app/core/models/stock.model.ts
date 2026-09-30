export interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  week52High: number;
  week52Low: number;
  eps: number;
  beta: number;
  dividendYield: number;
  isActive: boolean;
  updatedAt?: string;
  sparkline?: number[];
}

export interface StockPriceHistory {
  date: string;
  formattedDate?: string;
  timestamp?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
