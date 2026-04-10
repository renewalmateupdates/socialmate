-- Insert RenewalMate and Enki as admin-featured Studio Stax listings
-- These are Gilgamesh Empire OS properties — always featured, no applicant flow needed.
-- Uses admin Supabase client (service role) so RLS is bypassed.
--
-- Root cause of previous failure:
--   1. applicant_name and applicant_email are NOT NULL in curated_listings
--   2. status = 'live' is not a valid enum value (valid: pending, approved, rejected)
--   3. tags column does not exist in curated_listings

INSERT INTO curated_listings (
  applicant_name,
  applicant_email,
  name,
  tagline,
  description,
  url,
  logo_url,
  category,
  status,
  admin_featured,
  admin_featured_note,
  smgive_donated_cents
)
VALUES
(
  'Joshua Bostic',
  'socialmatehq@gmail.com',
  'RenewalMate',
  'Track Every Recurring Expense. Free. Forever.',
  'RenewalMate is a free recurring expense tracker that helps you see every subscription, bill, and recurring charge in one place. No credit card. No catch. Built for people who are tired of being surprised by charges they forgot about.',
  'https://www.renewalmate.com',
  null,
  'productivity',
  'approved',
  true,
  'Gilgamesh Empire OS — treasury shield, always featured'
  ,0
),
(
  'Joshua Bostic',
  'socialmatehq@gmail.com',
  'Enki',
  'The Autonomous Treasury Guardian. Stocks + Crypto, 24/7.',
  'Enki is an autonomous trading bot that protects and compounds your capital while you sleep. It scans congressional trades, Reddit sentiment, RSI, MACD, options flow, and 9 signal sources — only executing when confidence hits 6/10+. Paper trade free. Go live when you trust it.',
  'https://socialmate.studio/enki',
  null,
  'finance',
  'approved',
  true,
  'Gilgamesh Empire OS — treasury growth engine, always featured'
  ,0
)
ON CONFLICT DO NOTHING;
