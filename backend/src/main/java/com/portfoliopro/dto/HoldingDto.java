package com.portfoliopro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingDto {
    private Long id;
    private String symbol;
    private String name;
    private String sector;
    private Integer quantity;
    private BigDecimal averageBuyPrice;
    private BigDecimal currentPrice;
    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal unrealizedPnl;
    private BigDecimal unrealizedPnlPercent;
    private BigDecimal allocationPercent;
}
