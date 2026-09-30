package com.portfoliopro.repository;

import com.portfoliopro.model.Stock;
import com.portfoliopro.model.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, Long> {
    List<StockPriceHistory> findByStockOrderByTimestampAsc(Stock stock);
    List<StockPriceHistory> findTop60ByStockOrderByTimestampDesc(Stock stock);
}
