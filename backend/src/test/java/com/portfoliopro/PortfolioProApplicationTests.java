package com.portfoliopro;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfoliopro.dto.*;
import com.portfoliopro.enums.OrderSide;
import com.portfoliopro.enums.OrderType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PortfolioProApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        // Authenticate default trader
        AuthRequest traderAuth = new AuthRequest("trader", "trader123");
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(traderAuth)))
                .andExpect(status().isOk())
                .andReturn();

        String userResJson = userLoginResult.getResponse().getContentAsString();
        ApiResponse<?> userResponse = objectMapper.readValue(userResJson, ApiResponse.class);
        Map<?, ?> userData = (Map<?, ?>) userResponse.getData();
        userToken = "Bearer " + userData.get("token");

        // Authenticate default admin
        AuthRequest adminAuth = new AuthRequest("admin", "admin123");
        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminAuth)))
                .andExpect(status().isOk())
                .andReturn();

        String adminResJson = adminLoginResult.getResponse().getContentAsString();
        ApiResponse<?> adminResponse = objectMapper.readValue(adminResJson, ApiResponse.class);
        Map<?, ?> adminData = (Map<?, ?>) adminResponse.getData();
        adminToken = "Bearer " + adminData.get("token");
    }

    @Test
    void testUserRegistrationAndLogin() throws Exception {
        String testUser = "trader_" + System.currentTimeMillis();
        RegisterRequest registerReq = new RegisterRequest(
                testUser,
                testUser + "@example.com",
                "password123",
                "Integration Test User"
        );

        // Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value(testUser))
                .andExpect(jsonPath("$.data.virtualBalance").value(1000000.00));

        // Login
        AuthRequest loginReq = new AuthRequest(testUser, "password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void testMarketStockEndpoints() throws Exception {
        // Get all stocks
        mockMvc.perform(get("/api/market/stocks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        // Get single stock by symbol
        mockMvc.perform(get("/api/market/stocks/RELIANCE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.symbol").value("RELIANCE"));

        // Get stock price history
        mockMvc.perform(get("/api/market/stocks/RELIANCE/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].date").isNotEmpty());

        // Get sectors
        mockMvc.perform(get("/api/market/sectors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testTradingAndPortfolioLifecycle() throws Exception {
        // Place BUY market order
        OrderRequestDto buyOrder = OrderRequestDto.builder()
                .symbol("RELIANCE")
                .side(OrderSide.BUY)
                .type(OrderType.MARKET)
                .quantity(5)
                .build();

        mockMvc.perform(post("/api/trading/order")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buyOrder)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.symbol").value("RELIANCE"))
                .andExpect(jsonPath("$.data.status").value("EXECUTED"));

        // Check Portfolio Summary
        mockMvc.perform(get("/api/portfolio/summary")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.holdings").isArray())
                .andExpect(jsonPath("$.data.currentHoldingsValue").isNumber());

        // Check Portfolio Holdings
        mockMvc.perform(get("/api/portfolio/holdings")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].symbol").value("RELIANCE"));

        // Check Orders list
        mockMvc.perform(get("/api/trading/orders")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].symbol").value("RELIANCE"));

        // Check Trades ledger
        mockMvc.perform(get("/api/trading/trades")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].symbol").value("RELIANCE"));

        // Place SELL market order
        OrderRequestDto sellOrder = OrderRequestDto.builder()
                .symbol("RELIANCE")
                .side(OrderSide.SELL)
                .type(OrderType.MARKET)
                .quantity(2)
                .build();

        mockMvc.perform(post("/api/trading/order")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sellOrder)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("EXECUTED"));
    }

    @Test
    void testRiskAndAnalysisEngines() throws Exception {
        // Technical Analysis
        mockMvc.perform(get("/api/analysis/RELIANCE")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.symbol").value("RELIANCE"))
                .andExpect(jsonPath("$.data.rsi14").isNumber())
                .andExpect(jsonPath("$.data.bullishScore").isNumber());

        // Portfolio Risk Report
        mockMvc.perform(get("/api/risk/report")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.riskScore").isNumber())
                .andExpect(jsonPath("$.data.riskLevel").isNotEmpty());
    }

    @Test
    void testUserProfileAndFundsOperations() throws Exception {
        // Get Me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("trader"));

        // Add funds
        mockMvc.perform(post("/api/auth/add-funds")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 50000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Reset balance
        mockMvc.perform(post("/api/auth/reset-balance")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.virtualBalance").value(1000000.00));
    }

    @Test
    void testAdminFunctionsAndRBAC() throws Exception {
        // User cannot access admin endpoints
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());

        // Admin can access admin stats
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalUsers").isNumber())
                .andExpect(jsonPath("$.data.activeUsers").isNumber())
                .andExpect(jsonPath("$.data.totalStocksListed").isNumber());

        // Admin can list users
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
