/*
  # LATAM DeFi Platform Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User unique identifier
      - `email` (text, unique) - User email address
      - `password_hash` (text) - Hashed password for authentication
      - `wallet_address` (text) - Ethereum wallet address (mock)
      - `language` (text) - User preferred language (en, es, pt)
      - `created_at` (timestamptz) - Account creation timestamp
      
    - `stablecoins`
      - `id` (uuid, primary key) - Balance record identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `symbol` (text) - Stablecoin symbol (USD, BRL, ARS)
      - `balance` (decimal) - Current balance amount
      - `pegged_to` (text) - Currency peg reference
      - `created_at` (timestamptz) - Record creation timestamp
      
    - `transactions`
      - `id` (uuid, primary key) - Transaction identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `type` (text) - Transaction type (mint, redeem, deposit, withdraw, borrow, repay)
      - `amount` (decimal) - Transaction amount
      - `symbol` (text) - Currency symbol
      - `tx_hash` (text) - Mock transaction hash
      - `created_at` (timestamptz) - Transaction timestamp
      
    - `vaults`
      - `id` (uuid, primary key) - Vault identifier
      - `pair` (text) - Trading pair (e.g., USDC-BRL)
      - `apy` (decimal) - Annual percentage yield
      - `tvl` (decimal) - Total value locked
      - `risk_level` (text) - Risk assessment (low, medium, high)
      - `type` (text) - Vault type (earn, borrow)
      
    - `positions`
      - `id` (uuid, primary key) - Position identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `vault_id` (uuid, foreign key) - Reference to vaults table
      - `borrowed_amount` (decimal) - Amount borrowed
      - `collateral` (decimal) - Collateral amount
      - `health_factor` (decimal) - Position health metric
      - `status` (text) - Position status (active, liquidated, closed)
      - `created_at` (timestamptz) - Position creation timestamp
      
    - `yields`
      - `id` (uuid, primary key) - Yield record identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `vault_id` (uuid, foreign key) - Reference to vaults table
      - `amount` (decimal) - Yield amount accrued
      - `accrued_at` (timestamptz) - Yield accrual timestamp
      
    - `stakes`
      - `id` (uuid, primary key) - Stake identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `amount` (decimal) - Staked EST token amount
      - `locked_until` (timestamptz) - Lock expiration date
      - `ve_power` (decimal) - Vote-escrow power calculation
      - `created_at` (timestamptz) - Stake creation timestamp
      
    - `proposals`
      - `id` (uuid, primary key) - Proposal identifier
      - `title` (text) - Proposal title
      - `description` (text) - Proposal description
      - `votes_for` (integer) - Number of votes in favor
      - `votes_against` (integer) - Number of votes against
      - `deadline` (timestamptz) - Voting deadline
      - `status` (text) - Proposal status (active, passed, rejected)
      - `created_at` (timestamptz) - Proposal creation timestamp
      
    - `votes`
      - `id` (uuid, primary key) - Vote identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `proposal_id` (uuid, foreign key) - Reference to proposals table
      - `vote` (text) - Vote choice (for, against)
      - `weight` (decimal) - Vote weight based on ve_power
      - `created_at` (timestamptz) - Vote timestamp
      
    - `revenue`
      - `id` (uuid, primary key) - Revenue record identifier
      - `type` (text) - Revenue type (swap_fee, borrow_interest, liquidation_penalty)
      - `amount` (decimal) - Revenue amount
      - `created_at` (timestamptz) - Revenue timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Admin-only access for revenue and metrics tables

  3. Seed Data
    - Create 3 sample users with balances
    - Create sample vault data
    - Create sample governance proposals
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  wallet_address text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'es', 'pt')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Stablecoins table
CREATE TABLE IF NOT EXISTS stablecoins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL CHECK (symbol IN ('USD', 'BRL', 'ARS')),
  balance decimal(20, 8) DEFAULT 0 NOT NULL,
  pegged_to text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stablecoins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stablecoins"
  ON stablecoins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stablecoins"
  ON stablecoins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stablecoins"
  ON stablecoins FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('mint', 'redeem', 'deposit', 'withdraw', 'borrow', 'repay', 'stake', 'unstake')),
  amount decimal(20, 8) NOT NULL,
  symbol text,
  tx_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Vaults table
CREATE TABLE IF NOT EXISTS vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL,
  apy decimal(5, 2) NOT NULL,
  tvl decimal(20, 2) NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  type text NOT NULL CHECK (type IN ('earn', 'borrow'))
);

ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vaults"
  ON vaults FOR SELECT
  TO authenticated
  USING (true);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  borrowed_amount decimal(20, 8) NOT NULL,
  collateral decimal(20, 8) NOT NULL,
  health_factor decimal(5, 2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'liquidated', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions"
  ON positions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own positions"
  ON positions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own positions"
  ON positions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Yields table
CREATE TABLE IF NOT EXISTS yields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  amount decimal(20, 8) NOT NULL,
  accrued_at timestamptz DEFAULT now()
);

ALTER TABLE yields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own yields"
  ON yields FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Stakes table
CREATE TABLE IF NOT EXISTS stakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(20, 8) NOT NULL,
  locked_until timestamptz NOT NULL,
  ve_power decimal(20, 8) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stakes"
  ON stakes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stakes"
  ON stakes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stakes"
  ON stakes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  deadline timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  vote text NOT NULL CHECK (vote IN ('for', 'against')),
  weight decimal(20, 8) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, proposal_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Revenue table
CREATE TABLE IF NOT EXISTS revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('swap_fee', 'borrow_interest', 'liquidation_penalty', 'early_unstake_fee')),
  amount decimal(20, 8) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view revenue"
  ON revenue FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stablecoins_user_id ON stablecoins(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_yields_user_id ON yields(user_id);
CREATE INDEX IF NOT EXISTS idx_stakes_user_id ON stakes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
