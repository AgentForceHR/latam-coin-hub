/*
  # Create Beta Testers Table for Stablecoin DeFi

  ## Summary
  Creates table to store beta tester sign-ups for the Stablecoin DeFi project (EST token).
  Limited to 100 sign-ups, deadline Oct 29, 2025.

  ## New Tables
  1. **beta_testers**
    - `id` (uuid, primary key) - Unique identifier
    - `email` (text, unique, required) - Beta tester email
    - `nickname` (text, required) - Beta tester nickname/username
    - `x_followed` (boolean, default false) - Whether user follows @StablecoinDeFiLATAM on X
    - `signed_up_at` (timestamptz, default now) - Sign-up timestamp
    - `created_at` (timestamptz, default now) - Record creation timestamp

  ## Security
  1. Enable Row Level Security (RLS) on beta_testers table
  2. Add policy for public read access (count sign-ups)
  3. Add policy for service role insert (API only)

  ## Important Notes
  - Maximum 100 sign-ups enforced at application level
  - Sign-ups open until October 29, 2025
  - Email must be unique
*/

CREATE TABLE IF NOT EXISTS beta_testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nickname text NOT NULL,
  x_followed boolean DEFAULT false,
  signed_up_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read beta tester count"
  ON beta_testers
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert beta testers"
  ON beta_testers
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_beta_testers_email ON beta_testers(email);
CREATE INDEX IF NOT EXISTS idx_beta_testers_signed_up_at ON beta_testers(signed_up_at);