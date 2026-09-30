import { StockPriceHistory } from './stock.model';

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export interface TechnicalAnalysis {
  symbol: string;
  name: string;
  currentPrice: number;
  
  // Moving Averages
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  
  // Oscillators
  rsi14: number;
  rsiCondition: string; // 'Overbought' | 'Oversold' | 'Neutral'
  
  // MACD
  macdLine: number;
  signalLine: number;
  macdHistogram: number;
  macdSignal: string;
  
  // Bollinger Bands
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbCondition: string;

  // Overall Signal & Summary
  overallSignal: SignalType;
  bullishScore: number; // out of 100
  signalReason: string;
  signalBreakdown: string[];
  history: StockPriceHistory[];
}
