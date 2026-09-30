package com.portfoliopro.controller;

import com.portfoliopro.dto.*;
import com.portfoliopro.service.TradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/order")
    public ResponseEntity<ApiResponse<OrderResponseDto>> placeOrder(@Valid @RequestBody OrderRequestDto request) {
        OrderResponseDto response = tradingService.placeOrder(request);
        String msg = (response.getStatus() == com.portfoliopro.enums.OrderStatus.EXECUTED)
                ? "Order executed immediately at current market price."
                : "Order submitted and pending price trigger.";
        return ResponseEntity.ok(ApiResponse.ok(msg, response));
    }

    @PostMapping("/order/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponseDto>> cancelOrder(@PathVariable Long id) {
        OrderResponseDto response = tradingService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully.", response));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getUserOrders() {
        List<OrderResponseDto> orders = tradingService.getUserOrders();
        return ResponseEntity.ok(ApiResponse.ok("Orders retrieved.", orders));
    }

    @GetMapping("/trades")
    public ResponseEntity<ApiResponse<List<TradeDto>>> getUserTrades() {
        List<TradeDto> trades = tradingService.getUserTrades();
        return ResponseEntity.ok(ApiResponse.ok("Trade history retrieved.", trades));
    }
}
