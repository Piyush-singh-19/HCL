package com.portfoliopro.dto;

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
public class PortfolioSummaryDto {
    private BigDecimal cashBalance;
    private BigDecimal totalInvested;
    private BigDecimal currentHoldingsValue;
    private BigDecimal netWorth;
    private BigDecimal totalUnrealizedPnl;
    private BigDecimal totalRealizedPnl;
    private BigDecimal totalPnl;
    private BigDecimal totalReturnPercent;
    private List<HoldingDto> holdings;
    private List<String> allocationLabels;
    private List<Double> allocationValues;
    private List<String> sectorLabels;
    private List<Double> sectorValues;
}
