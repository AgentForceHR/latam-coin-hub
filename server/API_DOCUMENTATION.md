# LATAM DeFi Backend API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "language": "en" // optional: "en", "es", or "pt"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "wallet_address": "0x...",
    "language": "en"
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "wallet_address": "0x...",
    "language": "en"
  }
}
```

### Connect Wallet (Mock)
**POST** `/auth/wallet-connect`

**Response:**
```json
{
  "wallet_address": "0x...",
  "message": "Wallet connected successfully (mock)"
}
```

---

## Stablecoin Endpoints

### Mint Stablecoin
**POST** `/stablecoin/mint` 🔒

**Request Body:**
```json
{
  "amount": 100,
  "symbol": "USD", // "USD", "BRL", or "ARS"
  "collateral_amount": 200 // must be >= 150% of amount * peg_rate
}
```

**Response:**
```json
{
  "message": "Stablecoin minted successfully",
  "tx_hash": "0x...",
  "new_balance": 100,
  "symbol": "USD"
}
```

**Peg Rates:**
- USD: 1
- BRL: 5.5
- ARS: 950

### Redeem Stablecoin
**POST** `/stablecoin/redeem` 🔒

**Request Body:**
```json
{
  "amount": 50,
  "symbol": "USD"
}
```

**Response:**
```json
{
  "message": "Stablecoin redeemed successfully",
  "tx_hash": "0x...",
  "new_balance": 50,
  "symbol": "USD"
}
```

---

## Vault Endpoints

### List Vaults
**GET** `/vaults` 🔒

**Response:**
```json
{
  "vaults": [
    {
      "id": "uuid",
      "pair": "USDC-BRL",
      "apy": 6.5,
      "tvl": 500000000,
      "risk_level": "low",
      "type": "earn"
    }
  ]
}
```

### Deposit to Vault
**POST** `/vaults/:id/deposit` 🔒

**Request Body:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "message": "Deposit successful",
  "tx_hash": "0x...",
  "vault": "USDC-BRL",
  "deposited_amount": 1000,
  "yield_accrued": 0.1
}
```

### Borrow from Vault
**POST** `/vaults/:id/borrow` 🔒

**Request Body:**
```json
{
  "amount": 500,
  "collateral": 1000 // must be >= 150% of amount
}
```

**Response:**
```json
{
  "message": "Borrow position created successfully",
  "position_id": "uuid",
  "borrowed_amount": 500,
  "collateral": 1000,
  "health_factor": 1.33,
  "tx_hash": "0x..."
}
```

### Get User Positions
**GET** `/vaults/positions` 🔒

**Response:**
```json
{
  "positions": [
    {
      "id": "uuid",
      "borrowed_amount": 500,
      "collateral": 1000,
      "health_factor": 1.33,
      "status": "active",
      "health_status": "green", // "green", "yellow", or "red"
      "is_liquidatable": false,
      "vaults": {
        "pair": "USDC-BRL"
      }
    }
  ]
}
```

### Liquidate Position
**POST** `/vaults/liquidate/:positionId` 🔒

**Response:**
```json
{
  "message": "Position liquidated",
  "position_id": "uuid",
  "penalty_amount": 25
}
```

---

## Governance Endpoints

### Stake Tokens
**POST** `/governance/stake` 🔒

**Request Body:**
```json
{
  "amount": 1000,
  "lock_months": 6 // 3-12 months
}
```

**Response:**
```json
{
  "message": "Tokens staked successfully",
  "stake_id": "uuid",
  "amount": 1000,
  "ve_power": 1500,
  "locked_until": "2025-04-12T...",
  "tx_hash": "0x..."
}
```

### Unstake Tokens
**POST** `/governance/unstake/:stakeId` 🔒

**Response:**
```json
{
  "message": "Tokens unstaked successfully",
  "returned_amount": 900,
  "early_unstake_fee": 100, // 10% if early
  "tx_hash": "0x..."
}
```

### List Proposals
**GET** `/governance/proposals` 🔒

**Response:**
```json
{
  "proposals": [
    {
      "id": "uuid",
      "title": "Add MXN Stablecoin Peg",
      "description": "Proposal to add Mexican Peso (MXN)...",
      "votes_for": 12500,
      "votes_against": 3200,
      "deadline": "2025-10-15T...",
      "status": "active",
      "created_at": "2025-10-12T..."
    }
  ]
}
```

### Vote on Proposal
**POST** `/governance/proposals/:proposalId/vote` 🔒

**Request Body:**
```json
{
  "vote": "for" // "for" or "against"
}
```

**Response:**
```json
{
  "message": "Vote recorded successfully",
  "proposal_id": "uuid",
  "vote": "for",
  "weight": 1500
}
```

**Requirements:**
- User must have staked at least 100 LATAM tokens
- Vote weight is calculated from ve_power
- One vote per user per proposal

### Claim Rewards
**GET** `/governance/rewards/claim` 🔒

**Response:**
```json
{
  "total_rewards": 150.5,
  "stakes": [
    {
      "amount": 1000,
      "reward": 150.5,
      "apy": 15
    }
  ]
}
```

**APY Calculation:**
- 3-month lock: 5% APY
- 6-month lock: 10% APY
- 12-month lock: 15% APY

---

## Admin Endpoints

### List Users
**GET** `/admin/users?page=1&limit=10` 🔒

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "wallet_address": "0x...",
      "language": "en",
      "created_at": "2025-10-12T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Get Platform Metrics
**GET** `/admin/metrics` 🔒

**Response:**
```json
{
  "tvl": 1500000,
  "total_revenue": 50000,
  "revenue_by_type": {
    "swap_fee": 10000,
    "borrow_interest": 30000,
    "liquidation_penalty": 5000,
    "early_unstake_fee": 5000
  },
  "user_count": 1000,
  "active_positions": 250,
  "total_yields_distributed": 75000
}
```

### Revenue Dashboard
**GET** `/admin/revenue/dashboard` 🔒

**Response:**
```json
{
  "monthly_revenue": [],
  "recent_revenue": [
    {
      "id": "uuid",
      "type": "liquidation_penalty",
      "amount": 500,
      "created_at": "2025-10-12T..."
    }
  ]
}
```

---

## Health Check

### Server Health
**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T...",
  "service": "LATAM DeFi API",
  "version": "1.0.0"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid amount"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Window**: 1 hour
- **Max Requests**: 100 per IP
- **Response**: 429 Too Many Requests

---

## Bilingual Support

Error messages are returned in the user's preferred language (English, Spanish, or Portuguese).

Set language during registration or update in user profile:
- `en` - English
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","language":"en"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Mint Stablecoin
```bash
curl -X POST http://localhost:3001/api/stablecoin/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":100,"symbol":"USD","collateral_amount":200}'
```

### List Vaults
```bash
curl -X GET http://localhost:3001/api/vaults \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All amounts are in decimal format with 8 decimal places
- Timestamps are in ISO 8601 format
- UUIDs are used for all IDs
- Mock transaction hashes start with `0x` followed by 64 hex characters
- Collateralization ratio must be at least 150%
- Health factor below 1.0 triggers liquidation
- Early unstaking incurs a 10% penalty
- Liquidation penalty is 5% of borrowed amount
