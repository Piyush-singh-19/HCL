package com.portfoliopro.controller;

import com.portfoliopro.dto.*;
import com.portfoliopro.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("User registered successfully with ₹10,00,000 virtual balance.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        UserDto profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved.", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@RequestBody Map<String, String> payload) {
        String fullName = payload.get("fullName");
        String email = payload.get("email");
        UserDto updated = authService.updateProfile(fullName, email);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully.", updated));
    }

    @PostMapping("/reset-balance")
    public ResponseEntity<ApiResponse<UserDto>> resetBalance() {
        UserDto resetUser = authService.resetVirtualBalance();
        return ResponseEntity.ok(ApiResponse.ok("Virtual cash balance reset to ₹10,00,000.00.", resetUser));
    }

    @PostMapping("/add-funds")
    public ResponseEntity<ApiResponse<UserDto>> addFunds(@RequestBody Map<String, Object> payload) {
        java.math.BigDecimal amount = java.math.BigDecimal.ZERO;
        if (payload.get("amount") != null) {
            amount = new java.math.BigDecimal(payload.get("amount").toString());
        }
        UserDto updated = authService.addFunds(amount);
        return ResponseEntity.ok(ApiResponse.ok("Virtual funds added successfully.", updated));
    }
}
