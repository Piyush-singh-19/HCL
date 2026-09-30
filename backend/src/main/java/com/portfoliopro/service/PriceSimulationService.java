package com.portfoliopro.service;

import com.portfoliopro.enums.OrderStatus;
import com.portfoliopro.model.Order;
import com.portfoliopro.model.Stock;
import com.portfoliopro.model.StockPriceHistory;
import com.portfoliopro.repository.OrderRepository;
import com.portfoliopro.repository.StockPriceHistoryRepository;
import com.portfoliopro.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class PriceSimulationService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository priceHistoryRepository;
    private final OrderRepository orderRepository;
    private final TradingService tradingService;
    private final Random random = new Random();

    /**
     * Periodically simulate price changes every 10 seconds for active stocks.
     */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void simulateMarketTicks() {
        List<Stock> activeStocks = stockRepository.findByIsActiveTrueOrderBySymbolAsc();
        if (activeStocks.isEmpty()) return;

        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING);

        for (Stock stock : activeStocks) {
            BigDecimal currentPrice = stock.getCurrentPrice();
            
            // Random fluctuation between -1.5% and +1.5%
            double changePercent = (random.nextDouble() * 3.0 - 1.45) / 100.0;
            BigDecimal delta = currentPrice.multiply(BigDecimal.valueOf(changePercent));
            BigDecimal newPrice = currentPrice.add(delta).setScale(2, RoundingMode.HALF_UP);

            // Keep price reasonable (> 1.00)
            if (newPrice.compareTo(BigDecimal.ONE) < 0) {
                newPrice = BigDecimal.ONE;
            }

            stock.setCurrentPrice(newPrice);
            if (stock.getDayHigh() == null || newPrice.compareTo(stock.getDayHigh()) > 0) {
                stock.setDayHigh(newPrice);
            }
            if (stock.getDayLow() == null || newPrice.compareTo(stock.getDayLow()) < 0) {
                stock.setDayLow(newPrice);
            }

            // Increment volume
            stock.setVolume(stock.getVolume() + (random.nextInt(500) + 50));
            stockRepository.save(stock);

            // Record price history
            StockPriceHistory history = StockPriceHistory.builder()
                    .stock(stock)
                    .openPrice(currentPrice)
                    .highPrice(newPrice.max(currentPrice))
                    .lowPrice(newPrice.min(currentPrice))
                    .closePrice(newPrice)
                    .volume((long) (random.nextInt(1000) + 100))
                    .timestamp(LocalDateTime.now())
                    .build();
            priceHistoryRepository.save(history);

            // Trigger matching for pending orders on this stock
            for (Order order : pendingOrders) {
                if (order.getStock().getId().equals(stock.getId())) {
                    tradingService.evaluateOrderTrigger(order, newPrice);
                }
            }
        }
    }
}
