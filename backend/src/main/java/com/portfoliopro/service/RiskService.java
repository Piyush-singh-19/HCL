package com.portfoliopro.service;

import com.portfoliopro.dto.RiskReportDto;
import com.portfoliopro.enums.RiskLevel;
import com.portfoliopro.model.PortfolioHolding;
import com.portfoliopro.model.StockPriceHistory;
import com.portfoliopro.model.User;
import com.portfoliopro.repository.PortfolioHoldingRepository;
import com.portfoliopro.repository.StockPriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RiskService {

    private final PortfolioHoldingRepository holdingRepository;
    private final StockPriceHistoryRepository historyRepository;
    private final AuthService authService;

    public RiskReportDto calculatePortfolioRisk() {
        User user = authService.getAuthenticatedUser();
        List<PortfolioHolding> holdings = holdingRepository.findByUserAndQuantityGreaterThan(user, 0);

        if (holdings.isEmpty()) {
            return RiskReportDto.builder()
                    .portfolioVolatility(BigDecimal.ZERO)
                    .concentrationRiskIndex(BigDecimal.ZERO)
                    .maxDrawdown(BigDecimal.ZERO)
                    .valueAtRisk95(BigDecimal.ZERO)
                    .valueAtRisk95Percent(BigDecimal.ZERO)
                    .portfolioBeta(BigDecimal.ONE)
                    .riskLevel(RiskLevel.LOW)
                    .riskScore(10)
                    .warnings(List.of("Your portfolio is currently 100% cash. No market risk exposure."))
                    .assetWeights(Collections.emptyMap())
                    .build();
        }

        BigDecimal totalValue = holdings.stream()
                .map(PortfolioHolding::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> assetWeights = new HashMap<>();
        BigDecimal maxWeight = BigDecimal.ZERO;
        BigDecimal weightedBeta = BigDecimal.ZERO;

        for (PortfolioHolding h : holdings) {
            BigDecimal weight = h.getCurrentValue().divide(totalValue, 4, RoundingMode.HALF_UP);
            assetWeights.put(h.getStock().getSymbol(), weight.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP));

            if (weight.compareTo(maxWeight) > 0) {
                maxWeight = weight;
            }

            BigDecimal beta = h.getStock().getBeta() != null ? h.getStock().getBeta() : BigDecimal.ONE;
            weightedBeta = weightedBeta.add(weight.multiply(beta));
        }

        // Calculate Portfolio Volatility based on historical standard deviations
        double totalWeightedVariance = 0.0;
        double maxDrawdownEstimate = 0.0;

        for (PortfolioHolding h : holdings) {
            List<StockPriceHistory> history = historyRepository.findTop60ByStockOrderByTimestampDesc(h.getStock());
            double stockVol = computeAssetVolatility(history);
            double weight = h.getCurrentValue().divide(totalValue, 4, RoundingMode.HALF_UP).doubleValue();
            totalWeightedVariance += Math.pow(weight * stockVol, 2);

            double dd = computeMaxDrawdown(history);
            if (dd > maxDrawdownEstimate) {
                maxDrawdownEstimate = dd;
            }
        }

        double portfolioVolAnnualized = Math.sqrt(totalWeightedVariance) * Math.sqrt(252) * 100;
        BigDecimal volDto = BigDecimal.valueOf(portfolioVolAnnualized).setScale(2, RoundingMode.HALF_UP);

        // 1-Day 95% Parametric VaR = 1.645 * (Daily Volatility) * Total Value
        double dailyVol = (portfolioVolAnnualized / Math.sqrt(252)) / 100.0;
        double var95Amt = 1.645 * dailyVol * totalValue.doubleValue();
        double var95Pct = 1.645 * dailyVol * 100;

        BigDecimal varDto = BigDecimal.valueOf(var95Amt).setScale(2, RoundingMode.HALF_UP);
        BigDecimal varPctDto = BigDecimal.valueOf(var95Pct).setScale(2, RoundingMode.HALF_UP);
        BigDecimal maxDrawdownDto = BigDecimal.valueOf(maxDrawdownEstimate * 100).setScale(2, RoundingMode.HALF_UP);
        BigDecimal concentrationRisk = maxWeight.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP);

        // Determine Risk Score (0 - 100) and Level
        int score = 0;
        score += Math.min((int) (concentrationRisk.doubleValue() * 0.4), 40);
        score += Math.min((int) (portfolioVolAnnualized * 1.5), 35);
        score += Math.min((int) (weightedBeta.doubleValue() * 20), 25);
        score = Math.max(5, Math.min(score, 99));

        RiskLevel riskLevel;
        if (score < 30) riskLevel = RiskLevel.LOW;
        else if (score < 60) riskLevel = RiskLevel.MODERATE;
        else if (score < 80) riskLevel = RiskLevel.HIGH;
        else riskLevel = RiskLevel.EXTREME;

        // Formulate actionable warnings
        List<String> warnings = new ArrayList<>();
        if (concentrationRisk.compareTo(new BigDecimal("35.00")) > 0) {
            warnings.add(String.format("High concentration risk: %.1f%% allocated to your largest single position.", concentrationRisk.doubleValue()));
        }
        if (weightedBeta.compareTo(new BigDecimal("1.25")) > 0) {
            warnings.add(String.format("High market beta (%.2f): Your portfolio fluctuates more aggressively than the benchmark.", weightedBeta.doubleValue()));
        }
        if (volDto.compareTo(new BigDecimal("25.00")) > 0) {
            warnings.add(String.format("Elevated annualized volatility (%.1f%%). Consider diversifying across defensive sectors.", volDto.doubleValue()));
        }
        if (warnings.isEmpty()) {
            warnings.add("Portfolio risk metrics are well-balanced within standard diversification boundaries.");
        }

        return RiskReportDto.builder()
                .portfolioVolatility(volDto)
                .concentrationRiskIndex(concentrationRisk)
                .maxDrawdown(maxDrawdownDto)
                .valueAtRisk95(varDto)
                .valueAtRisk95Percent(varPctDto)
                .portfolioBeta(weightedBeta.setScale(2, RoundingMode.HALF_UP))
                .riskLevel(riskLevel)
                .riskScore(score)
                .warnings(warnings)
                .assetWeights(assetWeights)
                .build();
    }

    private double computeAssetVolatility(List<StockPriceHistory> history) {
        if (history == null || history.size() < 2) return 0.015; // default 1.5% daily vol
        List<Double> returns = new ArrayList<>();
        for (int i = 1; i < history.size(); i++) {
            double pPrev = history.get(i - 1).getClosePrice().doubleValue();
            double pCurr = history.get(i).getClosePrice().doubleValue();
            if (pPrev > 0) {
                returns.add((pCurr - pPrev) / pPrev);
            }
        }
        if (returns.isEmpty()) return 0.015;

        double mean = returns.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = returns.stream().mapToDouble(r -> Math.pow(r - mean, 2)).average().orElse(0.0002);
        return Math.sqrt(variance);
    }

    private double computeMaxDrawdown(List<StockPriceHistory> history) {
        if (history == null || history.size() < 2) return 0.08;
        double peak = 0.0;
        double maxDd = 0.0;
        for (StockPriceHistory h : history) {
            double price = h.getClosePrice().doubleValue();
            if (price > peak) {
                peak = price;
            }
            double dd = (peak - price) / peak;
            if (dd > maxDd) {
                maxDd = dd;
            }
        }
        return maxDd;
    }
}
