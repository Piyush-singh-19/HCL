package com.portfoliopro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockDto {
    private Long id;
    private String symbol;
    private String name;
    private String sector;
    private BigDecimal currentPrice;
    private BigDecimal previousClose;
    private BigDecimal dayOpen;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;
    private Long volume;
    private String marketCap;
    private BigDecimal peRatio;
    private BigDecimal week52High;
    private BigDecimal week52Low;
    private BigDecimal eps;
    private BigDecimal beta;
    private BigDecimal dividendYield;
    private boolean isActive;
    private LocalDateTime updatedAt;
}
