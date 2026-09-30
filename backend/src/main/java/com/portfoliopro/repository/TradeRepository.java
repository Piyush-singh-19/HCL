package com.portfoliopro.repository;

import com.portfoliopro.model.Trade;
import com.portfoliopro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByUserOrderByExecutedAtDesc(User user);
    List<Trade> findTop50ByOrderByExecutedAtDesc();
}
