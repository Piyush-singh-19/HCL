package com.portfoliopro.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_price_history", indexes = {
        @Index(name = "idx_stock_timestamp", columnList = "stock_id, timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(name = "open_price", precision = 12, scale = 2)
    private BigDecimal openPrice;

    @Column(name = "high_price", precision = 12, scale = 2)
    private BigDecimal highPrice;

    @Column(name = "low_price", precision = 12, scale = 2)
    private BigDecimal lowPrice;

    @Column(name = "close_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal closePrice;

    @Column(name = "volume")
    private Long volume;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
