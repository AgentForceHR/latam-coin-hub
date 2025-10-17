/*
  # Create SolDeFi App Tables

  1. New Tables
    - `app_transactions`
      - `id` (uuid, primary key): Unique identifier
      - `user_id` (uuid, foreign key): Reference to users table
      - `bnb_amount` (decimal): BNB amount sent
      - `sdf_tokens` (decimal): SDF tokens received
      - `price` (decimal): Price at purchase time
      - `timestamp` (timestamptz): Transaction timestamp
      - `tx_hash` (text): Blockchain transaction hash

  2. User Table Updates
    - Add `kyc_status` column to users table if not exists
    - Add `sdf_balance` column to track token balance
    - Add `vesting_start` column for vesting schedule

  3. Security
    - Enable RLS on `app_transactions` table
    - Users can only view their own transactions
    - Only authenticated users can access

  4. Indexes
    - Add index on user_id for fast queries
    - Add index on timestamp for sorting
*/

CREATE TABLE IF NOT EXISTS app_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bnb_amount decimal(20, 8) NOT NULL,
  sdf_tokens decimal(20, 8) NOT NULL,
  price decimal(20, 8) NOT NULL,
  timestamp timestamptz DEFAULT now(),
  tx_hash text NOT NULL
);

ALTER TABLE app_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app transactions"
  ON app_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own app transactions"
  ON app_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'kyc_status'
  ) THEN
    ALTER TABLE users ADD COLUMN kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'sdf_balance'
  ) THEN
    ALTER TABLE users ADD COLUMN sdf_balance decimal(20, 8) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'vesting_start'
  ) THEN
    ALTER TABLE users ADD COLUMN vesting_start timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_app_transactions_user_id ON app_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_transactions_timestamp ON app_transactions(timestamp DESC);
