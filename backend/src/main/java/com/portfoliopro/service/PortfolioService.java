package com.portfoliopro.service;

import com.portfoliopro.dto.HoldingDto;
import com.portfoliopro.dto.PortfolioSummaryDto;
import com.portfoliopro.model.PortfolioHolding;
import com.portfoliopro.model.User;
import com.portfoliopro.repository.PortfolioHoldingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioHoldingRepository holdingRepository;
    private final AuthService authService;

    public PortfolioSummaryDto getPortfolioSummary() {
        User user = authService.getAuthenticatedUser();
        List<PortfolioHolding> holdings = holdingRepository.findByUserAndQuantityGreaterThan(user, 0);

        BigDecimal cashBalance = user.getVirtualBalance();
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentHoldingsValue = BigDecimal.ZERO;

        Map<String, BigDecimal> sectorMap = new HashMap<>();

        for (PortfolioHolding h : holdings) {
            totalInvested = totalInvested.add(h.getTotalInvested());
            currentHoldingsValue = currentHoldingsValue.add(h.getCurrentValue());

            String sector = (h.getStock().getSector() != null && !h.getStock().getSector().isBlank())
                    ? h.getStock().getSector() : "Other";
            sectorMap.put(sector, sectorMap.getOrDefault(sector, BigDecimal.ZERO).add(h.getCurrentValue()));
        }

        BigDecimal netWorth = cashBalance.add(currentHoldingsValue);
        BigDecimal totalUnrealizedPnl = currentHoldingsValue.subtract(totalInvested);
        BigDecimal totalRealizedPnl = user.getRealizedPnl() != null ? user.getRealizedPnl() : BigDecimal.ZERO;
        BigDecimal totalPnl = totalUnrealizedPnl.add(totalRealizedPnl);

        BigDecimal returnPercent = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            returnPercent = totalUnrealizedPnl.multiply(new BigDecimal("100")).divide(totalInvested, 2, RoundingMode.HALF_UP);
        }

        // Map Holdings to DTO with asset allocation percentage
        BigDecimal finalHoldingsValue = currentHoldingsValue;
        List<HoldingDto> holdingDtos = holdings.stream().map(h -> {
            BigDecimal allocation = BigDecimal.ZERO;
            if (finalHoldingsValue.compareTo(BigDecimal.ZERO) > 0) {
                allocation = h.getCurrentValue().multiply(new BigDecimal("100")).divide(finalHoldingsValue, 1, RoundingMode.HALF_UP);
            }
            return HoldingDto.builder()
                    .id(h.getId())
                    .symbol(h.getStock().getSymbol())
                    .name(h.getStock().getName())
                    .sector(h.getStock().getSector())
                    .quantity(h.getQuantity())
                    .averageBuyPrice(h.getAverageBuyPrice())
                    .currentPrice(h.getStock().getCurrentPrice())
                    .totalInvested(h.getTotalInvested())
                    .currentValue(h.getCurrentValue())
                    .unrealizedPnl(h.getUnrealizedPnl())
                    .unrealizedPnlPercent(h.getUnrealizedPnlPercent())
                    .allocationPercent(allocation)
                    .build();
        }).collect(Collectors.toList());

        // Allocation chart labels and values (Holdings + Cash)
        List<String> allocationLabels = new ArrayList<>();
        List<Double> allocationValues = new ArrayList<>();

        for (HoldingDto h : holdingDtos) {
            allocationLabels.add(h.getSymbol());
            allocationValues.add(h.getCurrentValue().doubleValue());
        }
        if (cashBalance.compareTo(BigDecimal.ZERO) > 0) {
            allocationLabels.add("Available Cash");
            allocationValues.add(cashBalance.doubleValue());
        }

        // Sector distribution labels and values
        List<String> sectorLabels = new ArrayList<>(sectorMap.keySet());
        List<Double> sectorValues = sectorLabels.stream()
                .map(s -> sectorMap.get(s).doubleValue())
                .collect(Collectors.toList());

        return PortfolioSummaryDto.builder()
                .cashBalance(cashBalance)
                .totalInvested(totalInvested)
                .currentHoldingsValue(currentHoldingsValue)
                .netWorth(netWorth)
                .totalUnrealizedPnl(totalUnrealizedPnl)
                .totalRealizedPnl(totalRealizedPnl)
                .totalPnl(totalPnl)
                .totalReturnPercent(returnPercent)
                .holdings(holdingDtos)
                .allocationLabels(allocationLabels)
                .allocationValues(allocationValues)
                .sectorLabels(sectorLabels)
                .sectorValues(sectorValues)
                .build();
    }

    public List<HoldingDto> getHoldings() {
        return getPortfolioSummary().getHoldings();
    }
}
