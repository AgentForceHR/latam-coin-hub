/*
  # Create SolDeFi Landing Content Table

  1. New Tables
    - `landing_content`
      - `id` (uuid, primary key): Unique identifier
      - `lang` (text): Language code (en, es, pt)
      - `content` (jsonb): Multilingual content data
      - `created_at` (timestamptz): Creation timestamp
      - `updated_at` (timestamptz): Last update timestamp

  2. Content Structure
    - Stores project overview, mission, launch dates
    - Supports dynamic content updates
    - JSON structure for flexible content management

  3. Security
    - Enable RLS on `landing_content` table
    - Public read access for landing page content
    - Only service role can insert/update content

  4. Initial Data
    - Insert content for en, es, pt languages
*/

CREATE TABLE IF NOT EXISTS landing_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lang text NOT NULL UNIQUE CHECK (lang IN ('en', 'es', 'pt')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view landing content"
  ON landing_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_landing_content_lang ON landing_content(lang);

INSERT INTO landing_content (lang, content) VALUES
('en', '{
  "hero": {
    "headline": "SolDeFi: Powering LATAM DeFi",
    "subtext": "Stablecoins with Morpho vaults, launching Oct 27, 2025"
  },
  "mission": "Revolutionizing $415B LATAM crypto with USD-S, BRL-S, COP-S",
  "overview": "SolDeFi revolutionizes LATAM stablecoin market with USD-S, BRL-S, COP-S via Morpho vaults",
  "fairLaunch": {
    "date": "Oct 27-29, 2025",
    "amount": "$100K"
  },
  "lbp": {
    "date": "Oct 30-Nov 3, 2025",
    "amount": "$400K"
  },
  "chain": "BNB Chain",
  "cta": "Join App"
}'::jsonb),
('es', '{
  "hero": {
    "headline": "SolDeFi: Impulsando DeFi en LATAM",
    "subtext": "Stablecoins con bóvedas Morpho, lanzamiento 27 de octubre, 2025"
  },
  "mission": "Revolucionando $415B del cripto LATAM con USD-S, BRL-S, COP-S",
  "overview": "SolDeFi revoluciona el mercado de stablecoins LATAM con USD-S, BRL-S, COP-S a través de bóvedas Morpho",
  "fairLaunch": {
    "date": "27-29 Oct, 2025",
    "amount": "$100K"
  },
  "lbp": {
    "date": "30 Oct-3 Nov, 2025",
    "amount": "$400K"
  },
  "chain": "BNB Chain",
  "cta": "Unirse a la App"
}'::jsonb),
('pt', '{
  "hero": {
    "headline": "SolDeFi: Impulsionando DeFi na LATAM",
    "subtext": "Stablecoins com cofres Morpho, lançamento 27 de outubro, 2025"
  },
  "mission": "Revolucionando $415B do cripto LATAM com USD-S, BRL-S, COP-S",
  "overview": "SolDeFi revoluciona o mercado de stablecoins LATAM com USD-S, BRL-S, COP-S através de cofres Morpho",
  "fairLaunch": {
    "date": "27-29 Out, 2025",
    "amount": "$100K"
  },
  "lbp": {
    "date": "30 Out-3 Nov, 2025",
    "amount": "$400K"
  },
  "chain": "BNB Chain",
  "cta": "Entrar no App"
}'::jsonb)
ON CONFLICT (lang) DO NOTHING;
