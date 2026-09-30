package com.portfoliopro.service;

import com.portfoliopro.dto.StockDto;
import com.portfoliopro.dto.StockPriceHistoryDto;
import com.portfoliopro.exception.ResourceNotFoundException;
import com.portfoliopro.model.Stock;
import com.portfoliopro.model.StockPriceHistory;
import com.portfoliopro.repository.StockPriceHistoryRepository;
import com.portfoliopro.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");

    public List<StockDto> getAllStocks() {
        return stockRepository.findByIsActiveTrueOrderBySymbolAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<StockDto> searchStocks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllStocks();
        }
        return stockRepository.searchStocks(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public StockDto getStockBySymbol(String symbol) {
        Stock stock = stockRepository.findBySymbolIgnoreCase(symbol)
                .orElseThrow(() -> new ResourceNotFoundException("Stock with symbol '" + symbol + "' not found."));
        return mapToDto(stock);
    }

    public List<StockPriceHistoryDto> getStockHistory(String symbol) {
        Stock stock = stockRepository.findBySymbolIgnoreCase(symbol)
                .orElseThrow(() -> new ResourceNotFoundException("Stock with symbol '" + symbol + "' not found."));

        List<StockPriceHistory> history = stockPriceHistoryRepository.findByStockOrderByTimestampAsc(stock);
        return history.stream().map(h -> {
            String formatted = h.getTimestamp().format(DATE_FORMATTER);
            return StockPriceHistoryDto.builder()
                    .open(h.getOpenPrice())
                    .high(h.getHighPrice())
                    .low(h.getLowPrice())
                    .close(h.getClosePrice())
                    .volume(h.getVolume())
                    .timestamp(h.getTimestamp())
                    .formattedDate(formatted)
                    .date(formatted)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<String> getSectors() {
        return stockRepository.findDistinctSectors();
    }

    public StockDto mapToDto(Stock stock) {
        return StockDto.builder()
                .id(stock.getId())
                .symbol(stock.getSymbol())
                .name(stock.getName())
                .sector(stock.getSector())
                .currentPrice(stock.getCurrentPrice())
                .previousClose(stock.getPreviousClose())
                .dayOpen(stock.getDayOpen())
                .dayHigh(stock.getDayHigh())
                .dayLow(stock.getDayLow())
                .changeAmount(stock.getChangeAmount())
                .changePercent(stock.getChangePercent())
                .volume(stock.getVolume())
                .marketCap(stock.getMarketCap())
                .peRatio(stock.getPeRatio())
                .week52High(stock.getWeek52High())
                .week52Low(stock.getWeek52Low())
                .eps(stock.getEps())
                .beta(stock.getBeta())
                .dividendYield(stock.getDividendYield())
                .isActive(stock.isActive())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }
}
