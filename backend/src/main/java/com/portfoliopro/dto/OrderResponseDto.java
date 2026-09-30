package com.portfoliopro.dto;

import com.portfoliopro.enums.OrderSide;
import com.portfoliopro.enums.OrderStatus;
import com.portfoliopro.enums.OrderType;
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
public class OrderResponseDto {
    private Long id;
    private String symbol;
    private String stockName;
    private OrderSide side;
    private OrderType type;
    private Integer quantity;
    private Integer filledQuantity;
    private BigDecimal targetPrice;
    private BigDecimal stopPrice;
    private OrderStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime executedAt;
}
