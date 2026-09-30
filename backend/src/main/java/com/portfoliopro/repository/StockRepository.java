package com.portfoliopro.repository;

import com.portfoliopro.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findBySymbolIgnoreCase(String symbol);

    List<Stock> findByIsActiveTrueOrderBySymbolAsc();

    @Query("SELECT s FROM Stock s WHERE s.isActive = true AND " +
           "(LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.sector) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Stock> searchStocks(@Param("query") String query);

    @Query("SELECT DISTINCT s.sector FROM Stock s WHERE s.sector IS NOT NULL AND s.isActive = true ORDER BY s.sector")
    List<String> findDistinctSectors();

    List<Stock> findBySectorIgnoreCaseAndIsActiveTrue(String sector);
}
