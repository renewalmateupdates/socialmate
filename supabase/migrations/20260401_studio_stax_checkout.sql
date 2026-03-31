-- Studio Stax checkout token system
-- Added to curated_listings to power the one-time secure payment link flow.
-- Flow: admin approves → token generated → emailed to applicant → they pay → slot created.

alter table curated_listings
  add column if not exists checkout_token         text unique,
  add column if not exists checkout_token_expires  timestamptz,
  add column if not exists chosen_billing_type     text check (chosen_billing_type in ('annual', 'quarterly')),
  add column if not exists stripe_payment_intent_id text;

-- Index for fast token lookups
create index if not exists idx_listings_checkout_token on curated_listings(checkout_token)
  where checkout_token is not null;
