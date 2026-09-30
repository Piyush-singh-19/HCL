package com.portfoliopro.controller;

import com.portfoliopro.dto.ApiResponse;
import com.portfoliopro.dto.StockDto;
import com.portfoliopro.dto.StockPriceHistoryDto;
import com.portfoliopro.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/stocks")
    public ResponseEntity<ApiResponse<List<StockDto>>> getStocks(@RequestParam(required = false) String search) {
        List<StockDto> stocks = marketService.searchStocks(search);
        return ResponseEntity.ok(ApiResponse.ok("Stocks fetched successfully", stocks));
    }

    @GetMapping("/stocks/{symbol}")
    public ResponseEntity<ApiResponse<StockDto>> getStockDetail(@PathVariable String symbol) {
        StockDto stock = marketService.getStockBySymbol(symbol);
        return ResponseEntity.ok(ApiResponse.ok("Stock detail fetched", stock));
    }

    @GetMapping("/stocks/{symbol}/history")
    public ResponseEntity<ApiResponse<List<StockPriceHistoryDto>>> getStockHistory(@PathVariable String symbol) {
        List<StockPriceHistoryDto> history = marketService.getStockHistory(symbol);
        return ResponseEntity.ok(ApiResponse.ok("Stock price history fetched", history));
    }

    @GetMapping("/sectors")
    public ResponseEntity<ApiResponse<List<String>>> getSectors() {
        List<String> sectors = marketService.getSectors();
        return ResponseEntity.ok(ApiResponse.ok("Sectors fetched", sectors));
    }
}
