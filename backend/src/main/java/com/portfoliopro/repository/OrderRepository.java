package com.portfoliopro.repository;

import com.portfoliopro.enums.OrderStatus;
import com.portfoliopro.model.Order;
import com.portfoliopro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status);
    List<Order> findByStatus(OrderStatus status);
}
