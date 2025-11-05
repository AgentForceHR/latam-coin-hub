/*
  # Add MXN and COP Stablecoins Support

  ## Summary
  Adds support for Mexican Peso (MXN) and Colombian Peso (COP) stablecoins to the Estable DeFi platform.
  
  ## Changes
  1. Updates stablecoins table to support MXN and COP symbols
  2. Ensures existing users can add these new stablecoins

  ## New Stablecoins
  - **MXN**: Mexican Peso - pegged at ~17:1 USD
  - **COP**: Colombian Peso - pegged at ~4000:1 USD

  ## Notes
  - No data migration needed
  - Users can manually mint MXN and COP stablecoins through the app
  - Existing USD, BRL, and ARS stablecoins remain unchanged
*/

-- The stablecoins table already supports any symbol, so no schema changes needed
-- This migration documents the addition of MXN and COP support

-- Create a comment to document the supported currencies
COMMENT ON TABLE stablecoins IS 'Stores user stablecoin balances. Supported currencies: USD, BRL, ARS, MXN, COP';
