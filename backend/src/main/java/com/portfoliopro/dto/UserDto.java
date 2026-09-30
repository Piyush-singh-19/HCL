package com.portfoliopro.dto;

import com.portfoliopro.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private BigDecimal virtualBalance;
    private BigDecimal realizedPnl;
    private RoleType role;
    private boolean isActive;
    private LocalDateTime createdAt;
}
