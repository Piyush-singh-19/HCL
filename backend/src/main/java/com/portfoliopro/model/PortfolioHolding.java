package com.portfoliopro.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_holdings", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_stock", columnNames = {"user_id", "stock_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioHolding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "average_buy_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal averageBuyPrice = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getTotalInvested() {
        if (quantity != null && averageBuyPrice != null) {
            return averageBuyPrice.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }

    public BigDecimal getCurrentValue() {
        if (quantity != null && stock != null && stock.getCurrentPrice() != null) {
            return stock.getCurrentPrice().multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }

    public BigDecimal getUnrealizedPnl() {
        return getCurrentValue().subtract(getTotalInvested());
    }

    public BigDecimal getUnrealizedPnlPercent() {
        BigDecimal invested = getTotalInvested();
        if (invested.compareTo(BigDecimal.ZERO) > 0) {
            return getUnrealizedPnl().multiply(new BigDecimal("100")).divide(invested, 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}
