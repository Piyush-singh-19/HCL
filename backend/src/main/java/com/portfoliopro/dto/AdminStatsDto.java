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
public class AdminStatsDto {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalActiveStocks;
    private Long totalOrders;
    private Long totalTrades;
    private Long executedTrades;
    private BigDecimal totalTradingVolume;
    private BigDecimal totalVolumeTraded;
    private Long totalStocksListed;
    private BigDecimal totalSystemLiquidity;
    private BigDecimal totalUserCash;
}
