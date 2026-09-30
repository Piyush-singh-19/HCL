package com.portfoliopro.dto;

import com.portfoliopro.enums.SignalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicalAnalysisDto {
    private String symbol;
    private String name;
    private BigDecimal currentPrice;
    
    // Moving Averages
    private BigDecimal sma20;
    private BigDecimal sma50;
    private BigDecimal ema12;
    private BigDecimal ema26;
    
    // Oscillators
    private BigDecimal rsi14;
    private String rsiCondition; // Overbought, Oversold, Neutral
    
    // MACD
    private BigDecimal macdLine;
    private BigDecimal signalLine;
    private BigDecimal macdHistogram;
    private String macdSignal;
    
    // Bollinger Bands
    private BigDecimal bbUpper;
    private BigDecimal bbMiddle;
    private BigDecimal bbLower;
    private String bbCondition;

    // Overall Signal & Summary
    private SignalType overallSignal;
    private Integer bullishScore; // out of 100
    private String signalReason;
    private List<String> signalBreakdown;
    private List<StockPriceHistoryDto> history;
}
