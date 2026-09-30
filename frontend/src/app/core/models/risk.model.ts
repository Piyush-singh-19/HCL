export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface RiskReport {
  portfolioVolatility: number;       // Annualized Standard Deviation %
  concentrationRiskIndex: number;    // Top asset % weight
  maxDrawdown: number;               // Max drawdown %
  valueAtRisk95: number;             // 1-Day 95% Parametric VaR (₹)
  valueAtRisk95Percent: number;      // 1-Day 95% VaR (%)
  portfolioBeta: number;             // Weighted beta relative to market
  riskLevel: RiskLevel;              // LOW, MODERATE, HIGH, EXTREME
  riskScore: number;                 // 0 - 100
  warnings: string[];                // Real-time risk warnings
  assetWeights: { [symbol: string]: number }; // Asset weights map
}
