-- Lock down the partner program and Studio Stax tables (Oct 2026).
-- Run once in the Supabase SQL editor. Idempotent; re-running is safe.
--
-- THE BUG
-- These tables were created by hand without row level security, so the public
-- anon key (it ships in the site's JavaScript) could read every row. Measured
-- Oct 22 with nothing but that key and no login:
--
--   affiliate_invites     3 rows, including pending invite tokens. A token is
--                         all /partners/auth/callback checks, so anyone holding
--                         one could claim a partner account.
--   affiliates, affiliate_profiles, affiliate_promo_codes, referral_conversions
--   curated_listings      every Studio Stax application, applicant emails and
--                         admin notes included, not just the public listings
--   processed_events      the Stripe webhook's idempotency table. If it is also
--                         writable, a planted event id makes the webhook skip a
--                         real payment.
--   stax_daily_stats, blog_posts
--
-- With RLS off, Supabase's default grants also let anon INSERT/UPDATE/DELETE.
--
-- THE FIX
-- Every server route that touches these tables uses the service role, which
-- bypasses RLS, so turning it on changes nothing for the app. The only browser
-- reads are the Studio Stax portal (an applicant's own listing) and the referral
-- pages (your own referral rows); they keep exactly that. Portal edits now go
-- through /api/studio-stax/listing, so applicants no longer get an UPDATE policy:
-- RLS cannot limit columns, and that policy let a lister set their own status,
-- featured flag or donation rank.
--
-- Every existing policy on these tables is dropped first, so a permissive one
-- created by hand under another name cannot keep a table open.

DO $$
DECLARE
  t   text;
  pol record;
  kind "char";
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'affiliates', 'affiliate_profiles', 'affiliate_promo_codes',
    'affiliate_conversions', 'affiliate_payouts', 'affiliate_invites',
    'affiliate_notifications', 'affiliate_tax_forms', 'affiliate_summary',
    'referral_conversions', 'curated_listings', 'studio_stax_slots',
    'stax_daily_stats', 'processed_events', 'blog_posts'
  ] LOOP
    SELECT c.relkind INTO kind
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = t;

    IF kind IS NULL THEN
      RAISE NOTICE 'skipped %, not found', t;
      CONTINUE;
    END IF;

    -- A view cannot carry RLS; it runs as its owner. Take it away from the
    -- client roles instead.
    IF kind IN ('v', 'm') THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
      CONTINUE;
    END IF;

    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ── The only reads the browser needs ────────────────────────────────────────

-- /studio-stax/portal shows a lister their own listing at any status.
CREATE POLICY "Applicant reads own listing"
  ON curated_listings FOR SELECT
  TO authenticated
  USING (lower(applicant_email) = lower(auth.jwt() ->> 'email'));

-- /referral, /settings, /affiliate and /link-in-bio show your own referrals.
CREATE POLICY "Users read their own referral rows"
  ON referral_conversions FOR SELECT
  TO authenticated
  USING (affiliate_user_id = auth.uid() OR referred_user_id = auth.uid());

-- The blog is public content; this keeps it readable and stops anon writes.
CREATE POLICY "Anyone reads blog posts"
  ON blog_posts FOR SELECT
  USING (true);

-- ── Check (read-only) ────────────────────────────────────────────────────────
-- Every row should say true:
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
--     AND relname IN ('affiliates','affiliate_profiles','affiliate_promo_codes',
--       'affiliate_conversions','affiliate_payouts','affiliate_invites',
--       'affiliate_notifications','affiliate_tax_forms','referral_conversions',
--       'curated_listings','studio_stax_slots','stax_daily_stats',
--       'processed_events','blog_posts')
--   ORDER BY relname;
