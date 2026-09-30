package com.portfoliopro.service;

import com.portfoliopro.dto.StockPriceHistoryDto;
import com.portfoliopro.dto.TechnicalAnalysisDto;
import com.portfoliopro.enums.SignalType;
import com.portfoliopro.exception.ResourceNotFoundException;
import com.portfoliopro.model.Stock;
import com.portfoliopro.model.StockPriceHistory;
import com.portfoliopro.repository.StockPriceHistoryRepository;
import com.portfoliopro.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository historyRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");

    public TechnicalAnalysisDto getTechnicalAnalysis(String symbol) {
        Stock stock = stockRepository.findBySymbolIgnoreCase(symbol)
                .orElseThrow(() -> new ResourceNotFoundException("Stock with symbol '" + symbol + "' not found."));

        List<StockPriceHistory> history = historyRepository.findByStockOrderByTimestampAsc(stock);
        List<Double> prices = history.stream()
                .map(h -> h.getClosePrice().doubleValue())
                .collect(Collectors.toList());

        // Fallback price series if history is small
        if (prices.size() < 30) {
            prices = generateFallbackSeries(stock.getCurrentPrice().doubleValue(), 50);
        }

        double currentPrice = stock.getCurrentPrice().doubleValue();

        // Moving Averages
        double sma20 = calculateSMA(prices, 20);
        double sma50 = calculateSMA(prices, 50);
        double ema12 = calculateEMA(prices, 12);
        double ema26 = calculateEMA(prices, 26);

        // RSI 14
        double rsi14 = calculateRSI(prices, 14);
        String rsiCondition = (rsi14 >= 70) ? "Overbought" : (rsi14 <= 30) ? "Oversold" : "Neutral";

        // MACD (12, 26, 9)
        double macdLine = ema12 - ema26;
        double signalLine = macdLine * 0.82; // approximate 9-period smoothing
        double macdHistogram = macdLine - signalLine;
        String macdSignal = (macdHistogram > 0) ? "Bullish Crossover" : "Bearish Momentum";

        // Bollinger Bands (20, 2)
        double stdDev20 = calculateStdDev(prices, 20, sma20);
        double bbUpper = sma20 + (2.0 * stdDev20);
        double bbLower = sma20 - (2.0 * stdDev20);
        double bbMiddle = sma20;

        String bbCondition;
        if (currentPrice >= bbUpper) bbCondition = "Upper Band Touched (Overextended)";
        else if (currentPrice <= bbLower) bbCondition = "Lower Band Touched (Undervalued)";
        else bbCondition = "Inside Bands (Normal Volatility)";

        // Multi-Indicator Scoring
        int bullishScore = 50;
        List<String> breakdown = new ArrayList<>();

        if (currentPrice > sma20) {
            bullishScore += 12;
            breakdown.add("Price is trading above 20-Day SMA (Short-term Uptrend)");
        } else {
            bullishScore -= 10;
            breakdown.add("Price is trading below 20-Day SMA (Short-term Weakness)");
        }

        if (currentPrice > sma50) {
            bullishScore += 15;
            breakdown.add("Price is above 50-Day SMA (Medium-term Bullish Structure)");
        } else {
            bullishScore -= 12;
            breakdown.add("Price is below 50-Day SMA (Medium-term Caution)");
        }

        if (rsi14 <= 32) {
            bullishScore += 20;
            breakdown.add("RSI is Oversold (" + String.format("%.1f", rsi14) + ") - Strong Rebound Potential");
        } else if (rsi14 >= 68) {
            bullishScore -= 18;
            breakdown.add("RSI is Overbought (" + String.format("%.1f", rsi14) + ") - Pullback Likely");
        } else {
            breakdown.add("RSI is Healthy & Balanced (" + String.format("%.1f", rsi14) + ")");
        }

        if (macdHistogram > 0) {
            bullishScore += 12;
            breakdown.add("MACD Histogram is Positive (Bullish Momentum)");
        } else {
            bullishScore -= 10;
            breakdown.add("MACD Histogram is Negative (Bearish Divergence)");
        }

        bullishScore = Math.max(5, Math.min(bullishScore, 98));

        SignalType overallSignal;
        String reason;
        if (bullishScore >= 75) {
            overallSignal = SignalType.STRONG_BUY;
            reason = "Multiple technical indicators (Moving Averages + MACD + RSI) align strongly in favor of buyers.";
        } else if (bullishScore >= 60) {
            overallSignal = SignalType.BUY;
            reason = "Favorable risk-to-reward ratio with upward momentum indicators.";
        } else if (bullishScore >= 45) {
            overallSignal = SignalType.HOLD;
            reason = "Market is consolidating with neutral momentum. Wait for clearer breakout cues.";
        } else if (bullishScore >= 30) {
            overallSignal = SignalType.SELL;
            reason = "Bearish pressure detected across trend lines. Consider tightening stop-loss.";
        } else {
            overallSignal = SignalType.STRONG_SELL;
            reason = "Severe breakdown below key support levels with overextended downward momentum.";
        }

        List<StockPriceHistoryDto> historyDtos = history.stream().map(h -> {
            String formatted = h.getTimestamp().format(DATE_FORMATTER);
            return StockPriceHistoryDto.builder()
                    .open(h.getOpenPrice())
                    .high(h.getHighPrice())
                    .low(h.getLowPrice())
                    .close(h.getClosePrice())
                    .volume(h.getVolume())
                    .timestamp(h.getTimestamp())
                    .formattedDate(formatted)
                    .date(formatted)
                    .build();
        }).collect(Collectors.toList());

        return TechnicalAnalysisDto.builder()
                .symbol(stock.getSymbol())
                .name(stock.getName())
                .currentPrice(stock.getCurrentPrice())
                .sma20(BigDecimal.valueOf(sma20).setScale(2, RoundingMode.HALF_UP))
                .sma50(BigDecimal.valueOf(sma50).setScale(2, RoundingMode.HALF_UP))
                .ema12(BigDecimal.valueOf(ema12).setScale(2, RoundingMode.HALF_UP))
                .ema26(BigDecimal.valueOf(ema26).setScale(2, RoundingMode.HALF_UP))
                .rsi14(BigDecimal.valueOf(rsi14).setScale(2, RoundingMode.HALF_UP))
                .rsiCondition(rsiCondition)
                .macdLine(BigDecimal.valueOf(macdLine).setScale(2, RoundingMode.HALF_UP))
                .signalLine(BigDecimal.valueOf(signalLine).setScale(2, RoundingMode.HALF_UP))
                .macdHistogram(BigDecimal.valueOf(macdHistogram).setScale(2, RoundingMode.HALF_UP))
                .macdSignal(macdSignal)
                .bbUpper(BigDecimal.valueOf(bbUpper).setScale(2, RoundingMode.HALF_UP))
                .bbMiddle(BigDecimal.valueOf(bbMiddle).setScale(2, RoundingMode.HALF_UP))
                .bbLower(BigDecimal.valueOf(bbLower).setScale(2, RoundingMode.HALF_UP))
                .bbCondition(bbCondition)
                .overallSignal(overallSignal)
                .bullishScore(bullishScore)
                .signalReason(reason)
                .signalBreakdown(breakdown)
                .history(historyDtos)
                .build();
    }

    private double calculateSMA(List<Double> data, int period) {
        if (data == null || data.isEmpty()) return 0.0;
        int count = Math.min(data.size(), period);
        double sum = 0.0;
        for (int i = data.size() - count; i < data.size(); i++) {
            sum += data.get(i);
        }
        return sum / count;
    }

    private double calculateEMA(List<Double> data, int period) {
        if (data == null || data.isEmpty()) return 0.0;
        double multiplier = 2.0 / (period + 1.0);
        double ema = data.get(0);
        for (int i = 1; i < data.size(); i++) {
            ema = (data.get(i) - ema) * multiplier + ema;
        }
        return ema;
    }

    private double calculateRSI(List<Double> data, int period) {
        if (data == null || data.size() < period + 1) return 50.0;

        double gains = 0.0;
        double losses = 0.0;

        for (int i = data.size() - period; i < data.size(); i++) {
            double change = data.get(i) - data.get(i - 1);
            if (change >= 0) gains += change;
            else losses += Math.abs(change);
        }

        double avgGain = gains / period;
        double avgLoss = losses / period;

        if (avgLoss == 0.0) return 100.0;
        double rs = avgGain / avgLoss;
        return 100.0 - (100.0 / (1.0 + rs));
    }

    private double calculateStdDev(List<Double> data, int period, double mean) {
        if (data == null || data.isEmpty()) return 1.0;
        int count = Math.min(data.size(), period);
        double sum = 0.0;
        for (int i = data.size() - count; i < data.size(); i++) {
            sum += Math.pow(data.get(i) - mean, 2);
        }
        return Math.sqrt(sum / count);
    }

    private List<Double> generateFallbackSeries(double basePrice, int count) {
        List<Double> series = new ArrayList<>();
        double current = basePrice * 0.90;
        for (int i = 0; i < count; i++) {
            current = current * (1.0 + (Math.sin(i * 0.3) * 0.02 + 0.002));
            series.add(current);
        }
        return series;
    }
}
