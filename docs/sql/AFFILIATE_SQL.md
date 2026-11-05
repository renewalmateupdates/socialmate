# Affiliate Partner Portal — SQL Migrations

Run these in your Supabase SQL editor in order.

---

## 1. affiliate_profiles

```sql
create table if not exists public.affiliate_profiles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users(id) on delete cascade,
  -- Can also be a standalone portal-only account (no main app user_id)
  email                  text not null,
  full_name              text,
  status                 text not null default 'pending'
                           check (status in ('pending','active','suspended','terminated')),
  commission_rate        numeric(5,4) not null default 0.30,
  active_referral_count  integer not null default 0,
  total_earnings_cents   integer not null default 0,
  available_balance_cents integer not null default 0,
  paid_out_cents         integer not null default 0,
  lifetime_earnings_cents integer not null default 0,
  -- Stripe Connect
  stripe_account_id      text,
  stripe_account_status  text,   -- 'pending' | 'active' | 'restricted'
  -- W-9 / tax
  w9_required            boolean not null default false,
  w9_submitted           boolean not null default false,
  w9_submitted_at        timestamptz,
  w9_withholding_started_at timestamptz,
  w9_forfeiture_deadline  timestamptz,
  w9_funds_forfeited     boolean not null default false,
  -- Onboarding
  tos_agreed             boolean not null default false,
  tos_agreed_at          timestamptz,
  onboarding_completed   boolean not null default false,
  -- Meta
  invited_by             text,   -- admin email who sent invite
  invite_token           text,   -- matched to affiliate_invites
  notes                  text,   -- admin notes
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique(user_id),
  unique(email)
);

-- RLS
alter table public.affiliate_profiles enable row level security;

create policy "Affiliates can read own profile"
  on public.affiliate_profiles for select
  using (auth.uid() = user_id);

create policy "Affiliates can update own profile"
  on public.affiliate_profiles for update
  using (auth.uid() = user_id);

create policy "Service role full access"
  on public.affiliate_profiles
  using (true)
  with check (true);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger affiliate_profiles_updated_at
  before update on public.affiliate_profiles
  for each row execute function public.set_updated_at();
```

---

## 2. affiliate_invites

```sql
create table if not exists public.affiliate_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  token       text not null unique default encode(gen_random_bytes(32), 'hex'),
  status      text not null default 'pending'
                check (status in ('pending','accepted','declined','expired')),
  sent_by     text not null,  -- admin email
  sent_at     timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  responded_at timestamptz,
  -- Link to resulting affiliate profile on accept
  affiliate_profile_id uuid references public.affiliate_profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.affiliate_invites enable row level security;

-- Only service role can manage invites
create policy "Service role full access"
  on public.affiliate_invites
  using (true)
  with check (true);
```

---

## 3. affiliate_promo_codes

```sql
create table if not exists public.affiliate_promo_codes (
  id              uuid primary key default gen_random_uuid(),
  affiliate_id    uuid not null references public.affiliate_profiles(id) on delete cascade,
  code            text not null unique,
  discount_type   text not null check (discount_type in ('percent','flat')),
  discount_value  numeric(8,2) not null,   -- e.g. 20 for 20% off
  duration_months integer,                 -- 3 or 6
  description     text,                    -- "3-month 20% off" etc.
  is_active       boolean not null default true,
  times_used      integer not null default 0,
  stripe_coupon_id text,
  created_at      timestamptz not null default now()
);

alter table public.affiliate_promo_codes enable row level security;

create policy "Affiliates can read own promo codes"
  on public.affiliate_promo_codes for select
  using (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Service role full access"
  on public.affiliate_promo_codes
  using (true)
  with check (true);
```

---

## 4. affiliate_conversions (extends existing referral_conversions)

Check if `referral_conversions` already exists and extend it, OR create the new affiliate-specific table:

```sql
-- New table for portal affiliate cash commissions (separate from credit-based referrals)
create table if not exists public.affiliate_conversions (
  id                  uuid primary key default gen_random_uuid(),
  affiliate_id        uuid not null references public.affiliate_profiles(id) on delete cascade,
  referred_user_id    uuid references auth.users(id) on delete set null,
  referred_user_email text,
  referral_code       text,
  promo_code          text,
  -- Conversion details
  event_type          text not null check (event_type in ('signup','subscription','credit_pack','upgrade','renewal')),
  plan                text,
  amount_cents        integer not null default 0,   -- gross revenue on this event
  commission_cents    integer not null default 0,   -- affiliate's cut
  commission_rate     numeric(5,4) not null,
  -- Payout status
  status              text not null default 'pending'
                        check (status in ('pending','holding','available','paid','reversed','forfeited')),
  hold_until          timestamptz,   -- 60-day hold
  payout_id           uuid,          -- references affiliate_payouts.id once paid
  -- Meta
  stripe_payment_intent_id text,
  stripe_invoice_id        text,
  converted_at        timestamptz not null default now(),
  available_at        timestamptz,   -- when hold lifts
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.affiliate_conversions enable row level security;

create policy "Affiliates can read own conversions"
  on public.affiliate_conversions for select
  using (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Service role full access"
  on public.affiliate_conversions
  using (true)
  with check (true);

create index on public.affiliate_conversions (affiliate_id);
create index on public.affiliate_conversions (status);
create index on public.affiliate_conversions (converted_at desc);
```

---

## 5. affiliate_payouts

```sql
create table if not exists public.affiliate_payouts (
  id               uuid primary key default gen_random_uuid(),
  affiliate_id     uuid not null references public.affiliate_profiles(id) on delete cascade,
  amount_cents     integer not null,
  status           text not null default 'requested'
                     check (status in ('requested','approved','processing','paid','rejected','cancelled')),
  -- Stripe
  stripe_transfer_id   text,
  stripe_account_id    text,
  -- Admin
  requested_at     timestamptz not null default now(),
  approved_at      timestamptz,
  approved_by      text,
  paid_at          timestamptz,
  rejected_at      timestamptz,
  rejection_reason text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.affiliate_payouts enable row level security;

create policy "Affiliates can read own payouts"
  on public.affiliate_payouts for select
  using (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Affiliates can insert own payout requests"
  on public.affiliate_payouts for insert
  with check (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Service role full access"
  on public.affiliate_payouts
  using (true)
  with check (true);

create trigger affiliate_payouts_updated_at
  before update on public.affiliate_payouts
  for each row execute function public.set_updated_at();
```

---

## 6. affiliate_tax_forms

```sql
create table if not exists public.affiliate_tax_forms (
  id              uuid primary key default gen_random_uuid(),
  affiliate_id    uuid not null references public.affiliate_profiles(id) on delete cascade,
  form_type       text not null default 'W-9' check (form_type in ('W-9','W-8BEN')),
  status          text not null default 'pending'
                    check (status in ('pending','submitted','verified','rejected')),
  -- Submission data (store minimal info, link to secure doc upload)
  legal_name      text,
  tax_id_last4    text,      -- last 4 of SSN/EIN only
  address         text,
  city            text,
  state           text,
  zip             text,
  storage_path    text,      -- Supabase Storage path to uploaded PDF
  -- Admin review
  submitted_at    timestamptz,
  reviewed_at     timestamptz,
  reviewed_by     text,
  rejection_reason text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(affiliate_id, form_type)
);

alter table public.affiliate_tax_forms enable row level security;

create policy "Affiliates can read own tax forms"
  on public.affiliate_tax_forms for select
  using (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Affiliates can insert own tax forms"
  on public.affiliate_tax_forms for insert
  with check (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Service role full access"
  on public.affiliate_tax_forms
  using (true)
  with check (true);

create trigger affiliate_tax_forms_updated_at
  before update on public.affiliate_tax_forms
  for each row execute function public.set_updated_at();
```

---

## 7. affiliate_notifications

```sql
create table if not exists public.affiliate_notifications (
  id              uuid primary key default gen_random_uuid(),
  affiliate_id    uuid not null references public.affiliate_profiles(id) on delete cascade,
  type            text not null,
  -- e.g. 'w9_day1','w9_day14','w9_day30','w9_day45','w9_day55','w9_day59',
  --      'payout_approved','payout_paid','invite_accepted','tier_upgrade'
  subject         text,
  sent_at         timestamptz not null default now(),
  read_at         timestamptz,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.affiliate_notifications enable row level security;

create policy "Affiliates can read own notifications"
  on public.affiliate_notifications for select
  using (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Affiliates can update own notifications (mark read)"
  on public.affiliate_notifications for update
  using (
    affiliate_id in (
      select id from public.affiliate_profiles where user_id = auth.uid()
    )
  );

create policy "Service role full access"
  on public.affiliate_notifications
  using (true)
  with check (true);

create index on public.affiliate_notifications (affiliate_id, sent_at desc);
```

---

## 8. Storage bucket for W-9 uploads

```sql
-- Run in Supabase Dashboard > Storage > New bucket, OR:
insert into storage.buckets (id, name, public)
values ('affiliate-tax-docs', 'affiliate-tax-docs', false)
on conflict do nothing;

-- Only the uploader (by affiliate_id path) can upload
create policy "Affiliates can upload own tax docs"
  on storage.objects for insert
  with check (
    bucket_id = 'affiliate-tax-docs'
    and auth.uid() is not null
  );

create policy "Service role can read tax docs"
  on storage.objects for select
  using (bucket_id = 'affiliate-tax-docs');
```

---

## 9. Helper function — auto-generate promo codes on affiliate approval

```sql
create or replace function public.generate_affiliate_promo_codes(p_affiliate_id uuid, p_email text)
returns void language plpgsql security definer as $$
declare
  v_base text;
  v_code_3m text;
  v_code_6m text;
begin
  -- Build base from email prefix, uppercase, strip non-alphanum
  v_base := upper(regexp_replace(split_part(p_email, '@', 1), '[^A-Z0-9]', '', 'g'));
  -- Truncate to 8 chars max
  v_base := left(v_base, 8);
  v_code_3m := v_base || '3M';
  v_code_6m := v_base || '6M';

  -- Deduplicate by appending random suffix if collision
  while exists (select 1 from public.affiliate_promo_codes where code = v_code_3m) loop
    v_code_3m := v_base || '3M' || upper(substr(md5(random()::text), 1, 3));
  end loop;
  while exists (select 1 from public.affiliate_promo_codes where code = v_code_6m) loop
    v_code_6m := v_base || '6M' || upper(substr(md5(random()::text), 1, 3));
  end loop;

  insert into public.affiliate_promo_codes
    (affiliate_id, code, discount_type, discount_value, duration_months, description)
  values
    (p_affiliate_id, v_code_3m, 'percent', 20, 3, '20% off for 3 months'),
    (p_affiliate_id, v_code_6m, 'percent', 15, 6, '15% off for 6 months');
end;
$$;
```

---

## 10. W-9 withholding check — run via cron (Supabase pg_cron or Inngest)

```sql
-- Example: mark affiliates who've hit $599 lifetime as w9_required
-- Run daily via pg_cron or your cron worker

-- update public.affiliate_profiles
-- set w9_required = true,
--     w9_withholding_started_at = coalesce(w9_withholding_started_at, now()),
--     w9_forfeiture_deadline    = coalesce(w9_forfeiture_deadline, now() + interval '60 days')
-- where lifetime_earnings_cents >= 59900
--   and w9_required = false;
```
