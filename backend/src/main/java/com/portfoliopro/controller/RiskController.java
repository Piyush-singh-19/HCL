package com.portfoliopro.controller;

import com.portfoliopro.dto.ApiResponse;
import com.portfoliopro.dto.RiskReportDto;
import com.portfoliopro.service.RiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<RiskReportDto>> getRiskReport() {
        RiskReportDto report = riskService.calculatePortfolioRisk();
        return ResponseEntity.ok(ApiResponse.ok("Portfolio risk metrics calculated successfully.", report));
    }
}
