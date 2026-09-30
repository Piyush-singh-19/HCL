package com.portfoliopro.service;

import com.portfoliopro.enums.RoleType;
import com.portfoliopro.model.Stock;
import com.portfoliopro.model.StockPriceHistory;
import com.portfoliopro.model.User;
import com.portfoliopro.repository.StockPriceHistoryRepository;
import com.portfoliopro.repository.StockRepository;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedStocksAndHistory();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            // Default Admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@portfoliopro.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("PortfolioPro Admin")
                    .virtualBalance(new BigDecimal("1000000.00"))
                    .realizedPnl(BigDecimal.ZERO)
                    .role(RoleType.ROLE_ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);

            // Default Trader User
            User user = User.builder()
                    .username("trader")
                    .email("trader@portfoliopro.com")
                    .password(passwordEncoder.encode("trader123"))
                    .fullName("Piyush Trader")
                    .virtualBalance(new BigDecimal("1000000.00"))
                    .realizedPnl(BigDecimal.ZERO)
                    .role(RoleType.ROLE_USER)
                    .isActive(true)
                    .build();
            userRepository.save(user);

            log.info("Initialized default users: admin/admin123 and trader/trader123 with ₹10,00,000 cash.");
        }
    }

    private void seedStocksAndHistory() {
        if (stockRepository.count() == 0) {
            List<StockSeedData> seedList = List.of(
                    new StockSeedData("RELIANCE", "Reliance Industries Ltd.", "Energy & Conglomerate", "2980.50", "2950.00", "2945.00", "2995.00", "2930.00", 4500000L, "20.15T", "27.40", "3024.90", "2220.30", "108.70", "1.12", "0.35"),
                    new StockSeedData("TCS", "Tata Consultancy Services", "Information Technology", "4150.25", "4190.00", "4180.00", "4210.00", "4135.00", 2100000L, "15.02T", "32.10", "4585.00", "3312.20", "129.30", "0.78", "1.30"),
                    new StockSeedData("INFY", "Infosys Limited", "Information Technology", "1895.80", "1870.00", "1872.00", "1910.00", "1865.50", 6800000L, "7.86T", "29.80", "1990.00", "1358.35", "63.60", "0.95", "2.10"),
                    new StockSeedData("HDFCBANK", "HDFC Bank Limited", "Banking & Finance", "1645.60", "1638.00", "1640.00", "1658.00", "1632.00", 8900000L, "12.54T", "19.50", "1794.00", "1363.55", "84.30", "1.05", "1.15"),
                    new StockSeedData("TATAMOTORS", "Tata Motors Limited", "Automotive", "985.40", "960.00", "965.00", "994.50", "958.00", 11200000L, "3.62T", "16.80", "1179.00", "600.50", "58.60", "1.45", "0.60"),
                    new StockSeedData("ICICIBANK", "ICICI Bank Limited", "Banking & Finance", "1260.90", "1245.00", "1248.00", "1272.00", "1240.00", 7300000L, "8.85T", "18.20", "1300.00", "912.00", "69.20", "1.08", "0.85"),
                    new StockSeedData("BHARTIARTL", "Bharti Airtel Limited", "Telecommunications", "1540.00", "1520.00", "1525.00", "1555.00", "1518.00", 3800000L, "8.76T", "48.50", "1710.00", "895.00", "31.70", "0.82", "0.55"),
                    new StockSeedData("LT", "Larsen & Toubro Ltd.", "Infrastructure & Eng.", "3620.00", "3580.00", "3590.00", "3645.00", "3570.00", 1900000L, "4.98T", "36.20", "3919.00", "2870.00", "100.00", "0.98", "0.95"),
                    new StockSeedData("ITC", "ITC Limited", "Consumer Goods & FMCG", "512.40", "515.00", "514.00", "518.00", "509.00", 9500000L, "6.40T", "28.30", "528.00", "399.30", "18.10", "0.65", "2.75"),
                    new StockSeedData("SBIN", "State Bank of India", "Banking & Finance", "815.75", "805.00", "808.00", "822.00", "802.00", 14500000L, "7.28T", "10.40", "912.00", "555.00", "78.40", "1.22", "1.65"),
                    new StockSeedData("NVDA", "Nvidia Corporation", "Semiconductors & AI", "128.50", "124.00", "125.00", "130.00", "123.50", 42000000L, "3.15T", "65.20", "140.76", "39.23", "1.97", "1.85", "0.03"),
                    new StockSeedData("AAPL", "Apple Inc.", "Consumer Technology", "225.40", "222.00", "223.00", "227.00", "221.50", 35000000L, "3.45T", "34.10", "237.23", "164.08", "6.61", "1.02", "0.45")
            );

            Random random = new Random();

            for (StockSeedData data : seedList) {
                Stock stock = Stock.builder()
                        .symbol(data.symbol)
                .name(data.name)
                .sector(data.sector)
                .currentPrice(new BigDecimal(data.price))
                .previousClose(new BigDecimal(data.prevClose))
                .dayOpen(new BigDecimal(data.open))
                .dayHigh(new BigDecimal(data.high))
                .dayLow(new BigDecimal(data.low))
                .volume(data.volume)
                .marketCap(data.marketCap)
                .peRatio(new BigDecimal(data.pe))
                .week52High(new BigDecimal(data.w52High))
                .week52Low(new BigDecimal(data.w52Low))
                .eps(new BigDecimal(data.eps))
                .beta(new BigDecimal(data.beta))
                .dividendYield(new BigDecimal(data.divYield))
                .isActive(true)
                .build();

                Stock savedStock = stockRepository.save(stock);

                // Generate 30 days of OHLC price history
                double basePrice = savedStock.getCurrentPrice().doubleValue();
                for (int d = 30; d >= 0; d--) {
                    double drift = (random.nextDouble() * 0.04 - 0.019);
                    double close = basePrice * (1.0 + (drift * (30 - d) / 30.0));
                    double open = close * (1.0 + (random.nextDouble() * 0.01 - 0.005));
                    double high = Math.max(open, close) * (1.0 + random.nextDouble() * 0.012);
                    double low = Math.min(open, close) * (1.0 - random.nextDouble() * 0.012);

                    StockPriceHistory history = StockPriceHistory.builder()
                            .stock(savedStock)
                            .openPrice(BigDecimal.valueOf(open).setScale(2, java.math.RoundingMode.HALF_UP))
                            .highPrice(BigDecimal.valueOf(high).setScale(2, java.math.RoundingMode.HALF_UP))
                            .lowPrice(BigDecimal.valueOf(low).setScale(2, java.math.RoundingMode.HALF_UP))
                            .closePrice(BigDecimal.valueOf(close).setScale(2, java.math.RoundingMode.HALF_UP))
                            .volume((long) (random.nextInt(3000000) + 500000))
                            .timestamp(LocalDateTime.now().minusDays(d).withHour(15).withMinute(30))
                            .build();
                    historyRepository.save(history);
                }
            }
            log.info("Successfully seeded {} stocks with 30-day historical OHLC candle data.", seedList.size());
        }
    }

    private static class StockSeedData {
        String symbol, name, sector, price, prevClose, open, high, low, marketCap, pe, w52High, w52Low, eps, beta, divYield;
        Long volume;

        StockSeedData(String symbol, String name, String sector, String price, String prevClose, String open, String high, String low, Long volume, String marketCap, String pe, String w52High, String w52Low, String eps, String beta, String divYield) {
            this.symbol = symbol;
            this.name = name;
            this.sector = sector;
            this.price = price;
            this.prevClose = prevClose;
            this.open = open;
            this.high = high;
            this.low = low;
            this.volume = volume;
            this.marketCap = marketCap;
            this.pe = pe;
            this.w52High = w52High;
            this.w52Low = w52Low;
            this.eps = eps;
            this.beta = beta;
            this.divYield = divYield;
        }
    }
}
