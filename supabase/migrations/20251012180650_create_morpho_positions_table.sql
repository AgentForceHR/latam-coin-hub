/*
  # Create Morpho Positions Table

  1. New Tables
    - `morpho_positions`
      - `id` (uuid, primary key): Unique identifier for each position
      - `user_id` (uuid, foreign key): Reference to users table
      - `vault_id` (text): Identifier for the Morpho vault
      - `amount` (decimal): Amount deposited/withdrawn
      - `shares` (decimal): Vault shares received/redeemed
      - `tx_hash` (text): Transaction hash for on-chain verification
      - `type` (text): Type of transaction (deposit or withdraw)
      - `created_at` (timestamptz): Timestamp of the transaction

  2. Security
    - Enable RLS on `morpho_positions` table
    - Add policy for authenticated users to view their own positions only
    - Add policy for authenticated users to insert their own positions
    - Restrict updates and deletes to prevent data tampering

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on vault_id for vault-specific lookups
    - Add index on tx_hash for transaction verification
*/

CREATE TABLE IF NOT EXISTS morpho_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vault_id text NOT NULL,
  amount decimal(20, 8) NOT NULL,
  shares decimal(20, 8) DEFAULT 0,
  tx_hash text NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE morpho_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own morpho positions"
  ON morpho_positions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own morpho positions"
  ON morpho_positions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_morpho_positions_user_id ON morpho_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_morpho_positions_vault_id ON morpho_positions(vault_id);
CREATE INDEX IF NOT EXISTS idx_morpho_positions_tx_hash ON morpho_positions(tx_hash);
