package com.portfoliopro.dto;

import com.portfoliopro.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskReportDto {
    private BigDecimal portfolioVolatility;       // Annualized Standard Deviation %
    private BigDecimal concentrationRiskIndex;    // Top asset % weight
    private BigDecimal maxDrawdown;               // Max drawdown %
    private BigDecimal valueAtRisk95;             // 1-Day 95% Parametric VaR (₹)
    private BigDecimal valueAtRisk95Percent;      // 1-Day 95% VaR (%)
    private BigDecimal portfolioBeta;             // Weighted beta relative to market
    private RiskLevel riskLevel;                  // LOW, MODERATE, HIGH, EXTREME
    private Integer riskScore;                    // 0 - 100
    private List<String> warnings;                // Real-time risk warnings
    private Map<String, BigDecimal> assetWeights; // Asset weights map
}
