package com.portfoliopro.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String symbol;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 80)
    private String sector;

    @Column(name = "current_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "previous_close", nullable = false, precision = 12, scale = 2)
    private BigDecimal previousClose;

    @Column(name = "day_open", precision = 12, scale = 2)
    private BigDecimal dayOpen;

    @Column(name = "day_high", precision = 12, scale = 2)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 12, scale = 2)
    private BigDecimal dayLow;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "market_cap", length = 50)
    private String marketCap;

    @Column(name = "pe_ratio", precision = 8, scale = 2)
    private BigDecimal peRatio;

    @Column(name = "week_52_high", precision = 12, scale = 2)
    private BigDecimal week52High;

    @Column(name = "week_52_low", precision = 12, scale = 2)
    private BigDecimal week52Low;

    @Column(precision = 8, scale = 2)
    private BigDecimal eps;

    @Column(precision = 6, scale = 2)
    private BigDecimal beta;

    @Column(name = "dividend_yield", precision = 6, scale = 2)
    private BigDecimal dividendYield;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getChangeAmount() {
        if (currentPrice != null && previousClose != null) {
            return currentPrice.subtract(previousClose);
        }
        return BigDecimal.ZERO;
    }

    public BigDecimal getChangePercent() {
        if (currentPrice != null && previousClose != null && previousClose.compareTo(BigDecimal.ZERO) > 0) {
            return currentPrice.subtract(previousClose)
                    .multiply(new BigDecimal("100"))
                    .divide(previousClose, 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}
