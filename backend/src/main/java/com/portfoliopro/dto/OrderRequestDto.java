package com.portfoliopro.dto;

import com.portfoliopro.enums.OrderSide;
import com.portfoliopro.enums.OrderType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {

    @NotBlank(message = "Stock symbol is required")
    private String symbol;

    @NotNull(message = "Order side (BUY/SELL) is required")
    private OrderSide side;

    @NotNull(message = "Order type (MARKET/LIMIT/STOP_LOSS) is required")
    private OrderType type;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal targetPrice; // Used for LIMIT orders

    private BigDecimal stopPrice; // Used for STOP_LOSS orders
}
