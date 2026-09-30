package com.portfoliopro.controller;

import com.portfoliopro.dto.ApiResponse;
import com.portfoliopro.dto.TechnicalAnalysisDto;
import com.portfoliopro.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/{symbol}")
    public ResponseEntity<ApiResponse<TechnicalAnalysisDto>> getTechnicalAnalysis(@PathVariable String symbol) {
        TechnicalAnalysisDto analysis = analysisService.getTechnicalAnalysis(symbol);
        return ResponseEntity.ok(ApiResponse.ok("Technical analysis computed for " + symbol, analysis));
    }
}
