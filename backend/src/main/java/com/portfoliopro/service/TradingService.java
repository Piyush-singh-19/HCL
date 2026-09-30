package com.portfoliopro.service;

import com.portfoliopro.dto.OrderRequestDto;
import com.portfoliopro.dto.OrderResponseDto;
import com.portfoliopro.dto.TradeDto;
import com.portfoliopro.enums.OrderSide;
import com.portfoliopro.enums.OrderStatus;
import com.portfoliopro.enums.OrderType;
import com.portfoliopro.exception.BadRequestException;
import com.portfoliopro.exception.InsufficientFundsException;
import com.portfoliopro.exception.InsufficientSharesException;
import com.portfoliopro.exception.ResourceNotFoundException;
import com.portfoliopro.model.*;
import com.portfoliopro.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public OrderResponseDto placeOrder(OrderRequestDto request) {
        User user = authService.getAuthenticatedUser();
        Stock stock = stockRepository.findBySymbolIgnoreCase(request.getSymbol())
                .orElseThrow(() -> new ResourceNotFoundException("Stock '" + request.getSymbol() + "' not found."));

        if (!stock.isActive()) {
            throw new BadRequestException("Trading is currently disabled for " + stock.getSymbol());
        }

        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Order quantity must be at least 1 share.");
        }

        // Validate Limit / Stop prices
        if (request.getType() == OrderType.LIMIT && (request.getTargetPrice() == null || request.getTargetPrice().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new BadRequestException("Target price is required for LIMIT orders.");
        }
        if (request.getType() == OrderType.STOP_LOSS && (request.getStopPrice() == null || request.getStopPrice().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new BadRequestException("Stop price is required for STOP_LOSS orders.");
        }

        // Validate Funds / Holdings prior to order placement
        if (request.getSide() == OrderSide.BUY) {
            BigDecimal estimatedPrice = (request.getType() == OrderType.LIMIT) ? request.getTargetPrice() : stock.getCurrentPrice();
            BigDecimal estimatedCost = estimatedPrice.multiply(BigDecimal.valueOf(request.getQuantity()));
            if (user.getVirtualBalance().compareTo(estimatedCost) < 0) {
                throw new InsufficientFundsException(
                        String.format("Insufficient funds. Required: ₹%s, Available: ₹%s", estimatedCost, user.getVirtualBalance())
                );
            }
        } else if (request.getSide() == OrderSide.SELL) {
            PortfolioHolding holding = holdingRepository.findByUserAndStock(user, stock).orElse(null);
            int owned = (holding != null) ? holding.getQuantity() : 0;
            if (owned < request.getQuantity()) {
                throw new InsufficientSharesException(
                        String.format("Insufficient shares of %s. Requested: %d, Owned: %d", stock.getSymbol(), request.getQuantity(), owned)
                );
            }
        }

        Order order = Order.builder()
                .user(user)
                .stock(stock)
                .side(request.getSide())
                .type(request.getType())
                .targetPrice(request.getTargetPrice())
                .stopPrice(request.getStopPrice())
                .quantity(request.getQuantity())
                .filledQuantity(0)
                .status(OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        // Immediate evaluation for MARKET orders
        if (request.getType() == OrderType.MARKET) {
            executeTrade(order, stock.getCurrentPrice());
        } else {
            // Check if limit/stop condition is already met
            evaluateOrderTrigger(order, stock.getCurrentPrice());
        }

        return mapToDto(order);
    }

    @Transactional
    public void executeTrade(Order order, BigDecimal executionPrice) {
        User user = order.getUser();
        Stock stock = order.getStock();
        int quantity = order.getQuantity();
        BigDecimal totalAmount = executionPrice.multiply(BigDecimal.valueOf(quantity));

        if (order.getSide() == OrderSide.BUY) {
            if (user.getVirtualBalance().compareTo(totalAmount) < 0) {
                order.setStatus(OrderStatus.REJECTED);
                order.setRejectionReason("Insufficient balance at time of execution.");
                orderRepository.save(order);
                return;
            }

            // Deduct cash balance
            user.setVirtualBalance(user.getVirtualBalance().subtract(totalAmount));
            userRepository.save(user);

            // Update or create holding
            PortfolioHolding holding = holdingRepository.findByUserAndStock(user, stock)
                    .orElseGet(() -> PortfolioHolding.builder()
                            .user(user)
                            .stock(stock)
                            .quantity(0)
                            .averageBuyPrice(BigDecimal.ZERO)
                            .build());

            BigDecimal oldCost = holding.getAverageBuyPrice().multiply(BigDecimal.valueOf(holding.getQuantity()));
            int newQuantity = holding.getQuantity() + quantity;
            BigDecimal newAvgBuyPrice = oldCost.add(totalAmount).divide(BigDecimal.valueOf(newQuantity), 2, RoundingMode.HALF_UP);

            holding.setQuantity(newQuantity);
            holding.setAverageBuyPrice(newAvgBuyPrice);
            holdingRepository.save(holding);

            // Record Trade
            Trade trade = Trade.builder()
                    .order(order)
                    .user(user)
                    .stock(stock)
                    .side(OrderSide.BUY)
                    .quantity(quantity)
                    .price(executionPrice)
                    .totalAmount(totalAmount)
                    .realizedPnl(BigDecimal.ZERO)
                    .build();
            tradeRepository.save(trade);

        } else if (order.getSide() == OrderSide.SELL) {
            PortfolioHolding holding = holdingRepository.findByUserAndStock(user, stock).orElse(null);
            if (holding == null || holding.getQuantity() < quantity) {
                order.setStatus(OrderStatus.REJECTED);
                order.setRejectionReason("Insufficient shares at time of execution.");
                orderRepository.save(order);
                return;
            }

            // Realized PnL = (Sell Price - Avg Buy Price) * Quantity
            BigDecimal costBasis = holding.getAverageBuyPrice().multiply(BigDecimal.valueOf(quantity));
            BigDecimal realizedPnl = totalAmount.subtract(costBasis);

            // Credit cash balance and update user realized PnL
            user.setVirtualBalance(user.getVirtualBalance().add(totalAmount));
            user.setRealizedPnl(user.getRealizedPnl().add(realizedPnl));
            userRepository.save(user);

            // Update holding
            int remainingQuantity = holding.getQuantity() - quantity;
            if (remainingQuantity == 0) {
                holdingRepository.delete(holding);
            } else {
                holding.setQuantity(remainingQuantity);
                holdingRepository.save(holding);
            }

            // Record Trade
            Trade trade = Trade.builder()
                    .order(order)
                    .user(user)
                    .stock(stock)
                    .side(OrderSide.SELL)
                    .quantity(quantity)
                    .price(executionPrice)
                    .totalAmount(totalAmount)
                    .realizedPnl(realizedPnl)
                    .build();
            tradeRepository.save(trade);
        }

        order.setFilledQuantity(quantity);
        order.setStatus(OrderStatus.EXECUTED);
        order.setExecutedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    public boolean evaluateOrderTrigger(Order order, BigDecimal currentPrice) {
        if (order.getStatus() != OrderStatus.PENDING) return false;

        boolean trigger = false;
        if (order.getType() == OrderType.LIMIT) {
            if (order.getSide() == OrderSide.BUY && currentPrice.compareTo(order.getTargetPrice()) <= 0) {
                trigger = true;
            } else if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(order.getTargetPrice()) >= 0) {
                trigger = true;
            }
        } else if (order.getType() == OrderType.STOP_LOSS) {
            if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(order.getStopPrice()) <= 0) {
                trigger = true;
            } else if (order.getSide() == OrderSide.BUY && currentPrice.compareTo(order.getStopPrice()) >= 0) {
                trigger = true;
            }
        }

        if (trigger) {
            executeTrade(order, currentPrice);
            return true;
        }
        return false;
    }

    @Transactional
    public OrderResponseDto cancelOrder(Long orderId) {
        User user = authService.getAuthenticatedUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != com.portfoliopro.enums.RoleType.ROLE_ADMIN) {
            throw new BadRequestException("You are not authorized to cancel this order.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only PENDING orders can be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return mapToDto(order);
    }

    public List<OrderResponseDto> getUserOrders() {
        User user = authService.getAuthenticatedUser();
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TradeDto> getUserTrades() {
        User user = authService.getAuthenticatedUser();
        return tradeRepository.findByUserOrderByExecutedAtDesc(user).stream()
                .map(this::mapTradeToDto)
                .collect(Collectors.toList());
    }

    public OrderResponseDto mapToDto(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .symbol(order.getStock().getSymbol())
                .stockName(order.getStock().getName())
                .side(order.getSide())
                .type(order.getType())
                .quantity(order.getQuantity())
                .filledQuantity(order.getFilledQuantity())
                .targetPrice(order.getTargetPrice())
                .stopPrice(order.getStopPrice())
                .status(order.getStatus())
                .rejectionReason(order.getRejectionReason())
                .createdAt(order.getCreatedAt())
                .executedAt(order.getExecutedAt())
                .build();
    }

    public TradeDto mapTradeToDto(Trade trade) {
        return TradeDto.builder()
                .id(trade.getId())
                .orderId(trade.getOrder() != null ? trade.getOrder().getId() : null)
                .symbol(trade.getStock().getSymbol())
                .stockName(trade.getStock().getName())
                .side(trade.getSide())
                .quantity(trade.getQuantity())
                .price(trade.getPrice())
                .totalAmount(trade.getTotalAmount())
                .realizedPnl(trade.getRealizedPnl())
                .executedAt(trade.getExecutedAt())
                .build();
    }
}
