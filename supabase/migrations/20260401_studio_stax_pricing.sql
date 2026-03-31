-- Studio Stax quarterly slot tracking
-- Tracks purchases per quarter to power the collective pricing model.
-- When 100+ buyers are in a quarter, the annual price drops to $99.
-- Quarterly slots always start at the beginning of the next quarter if purchased mid-quarter.

create table if not exists studio_stax_slots (
  id                  uuid primary key default gen_random_uuid(),
  listing_id          uuid references curated_listings(id) on delete cascade,
  buyer_email         text not null,
  buyer_name          text not null,
  billing_type        text not null check (billing_type in ('annual', 'quarterly')),
  -- Which quarter this slot is for: e.g. '2026-Q2'
  slot_quarter        text not null,
  -- Price paid in cents
  amount_paid_cents   integer not null,
  stripe_payment_id   text,
  status              text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  starts_at           timestamptz not null,
  expires_at          timestamptz not null,
  renewal_email_30_sent boolean default false,
  renewal_email_14_sent boolean default false,
  renewal_email_7_sent  boolean default false,
  blog_article_generated boolean default false,
  created_at          timestamptz default now()
);

-- Index for quick quarter lookups
create index if not exists idx_stax_slots_quarter on studio_stax_slots(slot_quarter);
create index if not exists idx_stax_slots_expires on studio_stax_slots(expires_at, status);

-- View: how many active paid slots are in the current quarter
create or replace view studio_stax_quarter_counts as
select
  slot_quarter,
  count(*) as slot_count,
  count(*) >= 100 as collective_unlocked
from studio_stax_slots
where status = 'active'
group by slot_quarter;
