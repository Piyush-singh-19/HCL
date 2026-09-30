package com.portfoliopro.controller;

import com.portfoliopro.dto.*;
import com.portfoliopro.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getAdminStats() {
        AdminStatsDto stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok("Admin stats retrieved.", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users list retrieved.", users));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        BigDecimal balance = null;
        if (payload.get("virtualBalance") != null) {
            balance = new BigDecimal(payload.get("virtualBalance").toString());
        }
        String role = (payload.get("role") != null) ? payload.get("role").toString() : null;
        Boolean isActive = (payload.get("isActive") != null) ? Boolean.valueOf(payload.get("isActive").toString()) : null;

        UserDto updated = adminService.updateUser(id, balance, role, isActive);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully.", updated));
    }

    @PostMapping("/stocks")
    public ResponseEntity<ApiResponse<StockDto>> createStock(@Valid @RequestBody StockDto dto) {
        StockDto created = adminService.createStock(dto);
        return ResponseEntity.ok(ApiResponse.ok("Stock created successfully.", created));
    }

    @PutMapping("/stocks/{id}")
    public ResponseEntity<ApiResponse<StockDto>> updateStock(@PathVariable Long id, @RequestBody StockDto dto) {
        StockDto updated = adminService.updateStock(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Stock updated successfully.", updated));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getAllOrders() {
        List<OrderResponseDto> orders = adminService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.ok("All system orders retrieved.", orders));
    }

    @GetMapping("/trades")
    public ResponseEntity<ApiResponse<List<TradeDto>>> getAllTrades() {
        List<TradeDto> trades = adminService.getAllTrades();
        return ResponseEntity.ok(ApiResponse.ok("All system trades retrieved.", trades));
    }
}
