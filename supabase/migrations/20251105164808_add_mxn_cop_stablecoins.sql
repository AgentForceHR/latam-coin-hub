/*
  # Add MXN and COP Stablecoins Support

  ## Summary
  Adds support for Mexican Peso (MXN) and Colombian Peso (COP) stablecoins to the Estable DeFi platform.

  ## Changes
  1. Updates stablecoins table CHECK constraint to support MXN and COP symbols
  2. Ensures existing users can add these new stablecoins

  ## New Stablecoins
  - **MXN**: Mexican Peso - pegged at ~17:1 USD
  - **COP**: Colombian Peso - pegged at ~4000:1 USD

  ## Notes
  - No data migration needed
  - Users can manually mint MXN and COP stablecoins through the app
  - Existing USD, BRL, and ARS stablecoins remain unchanged
*/

-- Drop the old CHECK constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'stablecoins' AND constraint_name LIKE '%symbol%check%'
  ) THEN
    ALTER TABLE stablecoins DROP CONSTRAINT IF EXISTS stablecoins_symbol_check;
  END IF;
END $$;

-- Add new CHECK constraint with MXN and COP support
ALTER TABLE stablecoins ADD CONSTRAINT stablecoins_symbol_check
  CHECK (symbol IN ('USD', 'BRL', 'ARS', 'MXN', 'COP'));

-- Create a comment to document the supported currencies
COMMENT ON TABLE stablecoins IS 'Stores user stablecoin balances. Supported currencies: USD, BRL, ARS, MXN, COP';
