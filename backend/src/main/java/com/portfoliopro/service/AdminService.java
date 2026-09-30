package com.portfoliopro.service;

import com.portfoliopro.dto.AdminStatsDto;
import com.portfoliopro.dto.OrderResponseDto;
import com.portfoliopro.dto.StockDto;
import com.portfoliopro.dto.TradeDto;
import com.portfoliopro.dto.UserDto;
import com.portfoliopro.exception.BadRequestException;
import com.portfoliopro.exception.ResourceNotFoundException;
import com.portfoliopro.model.Stock;
import com.portfoliopro.model.StockPriceHistory;
import com.portfoliopro.model.Trade;
import com.portfoliopro.model.User;
import com.portfoliopro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final StockPriceHistoryRepository historyRepository;
    private final AuthService authService;
    private final MarketService marketService;
    private final TradingService tradingService;

    public AdminStatsDto getAdminStats() {
        List<User> users = userRepository.findAll();
        List<Stock> stocks = stockRepository.findAll();
        List<Trade> trades = tradeRepository.findAll();

        BigDecimal totalVolumeTraded = trades.stream()
                .map(Trade::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalUserCash = users.stream()
                .map(User::getVirtualBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeStocksCount = stocks.stream().filter(Stock::isActive).count();
        long activeUsersCount = users.stream().filter(User::isActive).count();
        long executedTradesCount = trades.size();

        return AdminStatsDto.builder()
                .totalUsers((long) users.size())
                .activeUsers(activeUsersCount)
                .totalActiveStocks(activeStocksCount)
                .totalStocksListed((long) stocks.size())
                .totalOrders(orderRepository.count())
                .totalTrades((long) trades.size())
                .executedTrades(executedTradesCount)
                .totalVolumeTraded(totalVolumeTraded)
                .totalTradingVolume(totalVolumeTraded)
                .totalSystemLiquidity(totalUserCash.add(totalVolumeTraded))
                .totalUserCash(totalUserCash)
                .build();
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUser(Long userId, BigDecimal virtualBalance, String role, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (virtualBalance != null) {
            user.setVirtualBalance(virtualBalance);
        }
        if (role != null) {
            try {
                user.setRole(com.portfoliopro.enums.RoleType.valueOf(role));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + role);
            }
        }
        if (isActive != null) {
            user.setActive(isActive);
        }

        return authService.mapToDto(userRepository.save(user));
    }

    @Transactional
    public StockDto createStock(StockDto dto) {
        if (stockRepository.findBySymbolIgnoreCase(dto.getSymbol()).isPresent()) {
            throw new BadRequestException("Stock with symbol " + dto.getSymbol() + " already exists.");
        }

        Stock stock = Stock.builder()
                .symbol(dto.getSymbol().toUpperCase().trim())
                .name(dto.getName().trim())
                .sector(dto.getSector() != null ? dto.getSector().trim() : "Technology")
                .currentPrice(dto.getCurrentPrice() != null ? dto.getCurrentPrice() : new BigDecimal("100.00"))
                .previousClose(dto.getPreviousClose() != null ? dto.getPreviousClose() : dto.getCurrentPrice())
                .dayOpen(dto.getDayOpen() != null ? dto.getDayOpen() : dto.getCurrentPrice())
                .dayHigh(dto.getDayHigh() != null ? dto.getDayHigh() : dto.getCurrentPrice())
                .dayLow(dto.getDayLow() != null ? dto.getDayLow() : dto.getCurrentPrice())
                .volume(dto.getVolume() != null ? dto.getVolume() : 1000000L)
                .marketCap(dto.getMarketCap() != null ? dto.getMarketCap() : "1.00T")
                .peRatio(dto.getPeRatio() != null ? dto.getPeRatio() : new BigDecimal("25.00"))
                .week52High(dto.getWeek52High() != null ? dto.getWeek52High() : dto.getCurrentPrice())
                .week52Low(dto.getWeek52Low() != null ? dto.getWeek52Low() : dto.getCurrentPrice())
                .eps(dto.getEps() != null ? dto.getEps() : new BigDecimal("50.00"))
                .beta(dto.getBeta() != null ? dto.getBeta() : new BigDecimal("1.00"))
                .dividendYield(dto.getDividendYield() != null ? dto.getDividendYield() : new BigDecimal("1.50"))
                .isActive(dto.isActive())
                .build();

        Stock saved = stockRepository.save(stock);

        // Seed initial price history
        StockPriceHistory history = StockPriceHistory.builder()
                .stock(saved)
                .openPrice(saved.getDayOpen())
                .highPrice(saved.getDayHigh())
                .lowPrice(saved.getDayLow())
                .closePrice(saved.getCurrentPrice())
                .volume(saved.getVolume())
                .timestamp(LocalDateTime.now())
                .build();
        historyRepository.save(history);

        return marketService.mapToDto(saved);
    }

    @Transactional
    public StockDto updateStock(Long stockId, StockDto dto) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with id: " + stockId));

        if (dto.getName() != null) stock.setName(dto.getName());
        if (dto.getSector() != null) stock.setSector(dto.getSector());
        if (dto.getCurrentPrice() != null) {
            stock.setPreviousClose(stock.getCurrentPrice());
            stock.setCurrentPrice(dto.getCurrentPrice());
        }
        if (dto.getPeRatio() != null) stock.setPeRatio(dto.getPeRatio());
        if (dto.getMarketCap() != null) stock.setMarketCap(dto.getMarketCap());
        if (dto.getBeta() != null) stock.setBeta(dto.getBeta());
        if (dto.getDividendYield() != null) stock.setDividendYield(dto.getDividendYield());
        stock.setActive(dto.isActive());

        Stock updated = stockRepository.save(stock);
        return marketService.mapToDto(updated);
    }

    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(tradingService::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TradeDto> getAllTrades() {
        return tradeRepository.findAll().stream()
                .map(tradingService::mapTradeToDto)
                .collect(Collectors.toList());
    }
}
