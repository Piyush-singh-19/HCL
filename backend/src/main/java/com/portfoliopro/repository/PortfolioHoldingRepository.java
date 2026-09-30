package com.portfoliopro.repository;

import com.portfoliopro.model.PortfolioHolding;
import com.portfoliopro.model.Stock;
import com.portfoliopro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {
    List<PortfolioHolding> findByUserAndQuantityGreaterThan(User user, Integer quantity);
    Optional<PortfolioHolding> findByUserAndStock(User user, Stock stock);
    List<PortfolioHolding> findByQuantityGreaterThan(Integer quantity);
}
