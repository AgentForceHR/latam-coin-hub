# LATAM DeFi Backend API

A comprehensive Node.js Express backend for a LATAM-focused stablecoin DeFi platform with Morpho earn/borrow integration.

## Features

- **Authentication**: JWT-based user authentication with bilingual support (EN/ES/PT)
- **Stablecoins**: Mint and redeem USD, BRL, and ARS-pegged stablecoins
- **Morpho Vaults**: Deposit to earn yields and borrow against collateral
- **Governance**: Stake LATAM tokens and vote on proposals with ve-power weighting
- **Admin Dashboard**: User management, metrics, and revenue tracking
- **Security**: Rate limiting, Helmet.js, input validation, RLS policies

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Validation**: Joi, express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, rate-limiting

## Prerequisites

- Node.js 18+
- Supabase account with database set up
- Environment variables configured

## Installation

```bash
cd server
npm install
```

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/wallet-connect` - Mock wallet connection

### Stablecoins

- `POST /api/stablecoin/mint` - Mint stablecoins with collateral
- `POST /api/stablecoin/redeem` - Redeem stablecoins

### Vaults

- `GET /api/vaults` - List available vaults
- `POST /api/vaults/:id/deposit` - Deposit to vault
- `POST /api/vaults/:id/borrow` - Borrow from vault
- `GET /api/vaults/positions` - Get user positions
- `POST /api/vaults/liquidate/:positionId` - Liquidate position

### Governance

- `POST /api/governance/stake` - Stake LATAM tokens
- `POST /api/governance/unstake/:stakeId` - Unstake tokens
- `GET /api/governance/proposals` - List proposals
- `POST /api/governance/proposals/:proposalId/vote` - Vote on proposal
- `GET /api/governance/rewards/claim` - Calculate rewards

### Admin

- `GET /api/admin/users` - List users (paginated)
- `GET /api/admin/metrics` - Platform metrics
- `GET /api/admin/revenue/dashboard` - Revenue dashboard

### Health Check

- `GET /api/health` - Server health status

## Database Schema

The API uses the following tables:

- `users` - User accounts
- `stablecoins` - User stablecoin balances
- `transactions` - Transaction history
- `vaults` - Available vaults
- `positions` - Borrow positions
- `yields` - Yield accruals
- `stakes` - Staked tokens
- `proposals` - Governance proposals
- `votes` - User votes
- `revenue` - Platform revenue

## Security Features

- JWT authentication
- Rate limiting (100 requests/hour per IP)
- Helmet.js security headers
- Input validation with Joi
- Row-level security on Supabase
- CORS configuration
- Password hashing with bcrypt
- Comprehensive error handling

## Bilingual Support

All API responses support English, Spanish, and Portuguese based on user language preference:

- English (en)
- Spanish (es)
- Portuguese (pt)

## Logging

Logs are stored in the `logs/` directory:

- `app.log` - All application logs
- `error.log` - Error logs only

## Testing

The API includes comprehensive error handling and logging for all endpoints. Use the health check endpoint to verify server status:

```bash
curl http://localhost:3001/api/health
```

## License

MIT
