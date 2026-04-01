-- Studio Stax pricing v2
-- Changes: 1000 founding slots (was 100), $100 founding / $150 standard
-- Tier tracking, renewal offer tracking, slot reclaim logic support

-- Add tier column to track founding vs standard slots
alter table studio_stax_slots
  add column if not exists tier text default 'founding' check (tier in ('founding', 'standard')),
  add column if not exists reclaim_offer_sent boolean default false;

-- Back-fill existing slots as founding (they were from the original 100-slot era)
update studio_stax_slots set tier = 'founding' where tier is null;

-- Index for efficient tier queries
create index if not exists idx_stax_slots_tier on studio_stax_slots(tier, status);

-- Remove quarterly billing type constraint if it exists (annual only going forward)
-- Note: existing quarterly slots remain as-is; new slots will all be annual
