package com.portfoliopro.controller;

import com.portfoliopro.dto.ApiResponse;
import com.portfoliopro.dto.HoldingDto;
import com.portfoliopro.dto.PortfolioSummaryDto;
import com.portfoliopro.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PortfolioSummaryDto>> getPortfolioSummary() {
        PortfolioSummaryDto summary = portfolioService.getPortfolioSummary();
        return ResponseEntity.ok(ApiResponse.ok("Portfolio summary retrieved.", summary));
    }

    @GetMapping("/holdings")
    public ResponseEntity<ApiResponse<List<HoldingDto>>> getHoldings() {
        List<HoldingDto> holdings = portfolioService.getHoldings();
        return ResponseEntity.ok(ApiResponse.ok("Portfolio holdings retrieved.", holdings));
    }
}
