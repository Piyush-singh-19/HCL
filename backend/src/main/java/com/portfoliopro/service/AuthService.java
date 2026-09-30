package com.portfoliopro.service;

import com.portfoliopro.config.JwtUtils;
import com.portfoliopro.dto.AuthRequest;
import com.portfoliopro.dto.AuthResponse;
import com.portfoliopro.dto.RegisterRequest;
import com.portfoliopro.dto.UserDto;
import com.portfoliopro.enums.RoleType;
import com.portfoliopro.exception.BadRequestException;
import com.portfoliopro.exception.ResourceNotFoundException;
import com.portfoliopro.model.User;
import com.portfoliopro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Value("${app.trading.default-virtual-balance:1000000.00}")
    private BigDecimal defaultVirtualBalance;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered.");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null ? request.getFullName().trim() : request.getUsername())
                .virtualBalance(defaultVirtualBalance)
                .realizedPnl(BigDecimal.ZERO)
                .role(RoleType.ROLE_USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtils.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .virtualBalance(savedUser.getVirtualBalance())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("Account has been deactivated. Please contact support.");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .virtualBalance(user.getVirtualBalance())
                .build();
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("User is not authenticated");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public UserDto getCurrentUserProfile() {
        User user = getAuthenticatedUser();
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(String fullName, String email) {
        User user = getAuthenticatedUser();
        if (email != null && !email.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email is already in use by another account.");
            }
            user.setEmail(email.trim().toLowerCase());
        }
        if (fullName != null) {
            user.setFullName(fullName.trim());
        }
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Transactional
    public UserDto resetVirtualBalance() {
        User user = getAuthenticatedUser();
        user.setVirtualBalance(defaultVirtualBalance);
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Transactional
    public UserDto addFunds(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }
        User user = getAuthenticatedUser();
        user.setVirtualBalance(user.getVirtualBalance().add(amount));
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .virtualBalance(user.getVirtualBalance())
                .realizedPnl(user.getRealizedPnl())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
