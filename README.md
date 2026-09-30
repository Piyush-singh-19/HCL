# PortfolioPro: Stock Trading & Portfolio Management System

A full-stack, enterprise-grade virtual stock trading and portfolio analytics platform.

---

## 🚀 Tech Stack

- **Backend**: Java 25+, Spring Boot 3.5.16, Spring Data JPA, Spring Security, JWT (`jjwt`), Lombok, MySQL / H2
- **Frontend**: Angular 17+ / TypeScript SPA, Chart.js 4, Bootstrap 5, FontAwesome 6, Vite
- **Virtual Currency**: Initial balance **₹10,00,000.00** credited on registration
- **REST API Prefix**: `/api`

---

## 📦 Implemented Modules (All 7 Complete)

### 1. 🔐 Authentication & RBAC (`/api/auth`)

- User Registration with automatic **₹10,00,000** virtual cash credit
- Stateless JWT authentication & BCrypt password hashing
- Role-based Access Control (`ROLE_USER`, `ROLE_ADMIN`)
- User profile updates and one-click Virtual Balance Reset

### 2. 📈 Market Data & Quotes (`/api/market`)

- Live Stock Directory with search by symbol, company name, and sector
- Sector filtering: Information Technology, Banking & Finance, Energy, Automotive, Telecom, FMCG, Semiconductors
- Real-time quote simulator generating realistic market fluctuations every 10 seconds
- 30-Day Historical OHLC Candlestick data for charting
- Company fundamentals: P/E ratio, Beta, Market Cap, EPS, Dividend Yield, 52-Week High/Low

### 3. ⚡ Trading & Execution Engine (`/api/trading`)

- **Order Types**: `MARKET`, `LIMIT`, and `STOP_LOSS`
- **Order Sides**: `BUY` and `SELL`
- Atomic `@Transactional` execution verifying funds & shares
- Immediate execution for Market orders
- Automated background price-matching trigger for Limit and Stop-Loss orders
- Order status tracking (`PENDING`, `EXECUTED`, `CANCELLED`, `REJECTED`)
- Real-time Cancel Order capability
- Immutable Trade audit log with Realized P&L tracking on sell trades

### 4. 💼 Portfolio & Valuation (`/api/portfolio`)

- Real-time Portfolio Net Worth, Total Invested Capital, and Current Market Value
- Unrealized Profit & Loss (₹ and %) and Realized Profit
- Holdings table with weighted average buy price calculation
- Interactive Chart.js Asset Allocation Donut Chart
- Interactive Chart.js Sector Distribution Bar Chart

### 5. 🛡️ Risk Management Radar (`/api/risk`)

- **Portfolio Volatility**: Annualized standard deviation of daily returns
- **Concentration Risk Index**: % capital allocated to largest single asset
- **95% Value at Risk (VaR)**: 1-day parametric expected loss in ₹ and %
- **Maximum Drawdown**: Historical peak-to-trough decline
- **Portfolio Beta**: Weighted systematic market risk
- **Risk Score & Classification**: 0-100 Score with `LOW`, `MODERATE`, `HIGH`, `EXTREME` rating
- Real-time automated risk advisory alerts & diversification warnings

### 6. 📊 Technical Analysis & AI Signals (`/api/analysis/{symbol}`)

- **Moving Averages**: 20-Day SMA, 50-Day SMA, 12-Day EMA, 26-Day EMA
- **RSI (14)**: Relative Strength Index with Overbought (>70) and Oversold (<30) detection
- **MACD (12, 26, 9)**: MACD Line, Signal Line, and Momentum Histogram
- **Bollinger Bands (20, 2)**: Upper, Middle, and Lower Bands
- **Automated Algorithmic Rating**: `STRONG BUY`, `BUY`, `HOLD`, `SELL`, `STRONG SELL` with Bullish Score (0-100) and actionable breakdown points

### 7. 🛡️ Administrator Portal (`/api/admin`)

- System-wide volume and liquidity metrics
- User Management: adjust virtual cash balance, assign roles, activate/deactivate accounts
- Stock Management: add new tickers, update live prices, configure fundamentals
- Complete system audit viewer for all user orders and executed trades

---

## 🔑 Default Credentials

| Role       | Username | Password    | Virtual Cash  |
| ---------- | -------- | ----------- | ------------- |
| **Admin**  | `admin`  | `admin123`  | ₹10,00,000.00 |
| **Trader** | `trader` | `trader123` | ₹10,00,000.00 |

---

## 🛠️ How to Run Locally

### 1. Start Frontend (Port 4200)

```powershell
cd d:\STOCK\frontend
npm run dev
```

### 2. Start Backend (Port 8080)

```powershell
cd d:\STOCK\backend
# Run with Maven or your favorite Java IDE (IntelliJ, Eclipse, VSCode)
mvn spring-boot:run
```

Open your browser at: **`http://localhost:4200`**
