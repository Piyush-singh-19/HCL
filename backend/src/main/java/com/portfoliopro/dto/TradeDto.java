package com.portfoliopro.dto;

import com.portfoliopro.enums.OrderSide;
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
public class TradeDto {
    private Long id;
    private Long orderId;
    private String symbol;
    private String stockName;
    private OrderSide side;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;
    private BigDecimal realizedPnl;
    private LocalDateTime executedAt;
}
