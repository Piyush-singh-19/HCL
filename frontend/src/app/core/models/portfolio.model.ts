export interface Holding {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  allocationPercent: number;
}

export interface PortfolioSummary {
  cashBalance: number;
  totalInvested: number;
  currentHoldingsValue: number;
  netWorth: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  totalPnl: number;
  totalReturnPercent: number;
  holdings: Holding[];
  allocationLabels: string[];
  allocationValues: number[];
  sectorLabels: string[];
  sectorValues: number[];
}
