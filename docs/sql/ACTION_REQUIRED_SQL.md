# ACTION REQUIRED: Run These SQL Statements in Supabase

Go to: https://supabase.com/dashboard → your project → SQL Editor → paste each block and run.

---

## 1. User Settings — Theme Columns

Required for dark mode + color theme persistence across devices.

```sql
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS theme_mode   TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS theme_accent TEXT DEFAULT 'default';
```

---

## 2. Feature Requests Table

Required for the Roadmap page's feature request form.

```sql
CREATE TABLE IF NOT EXISTS feature_requests (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request    TEXT NOT NULL,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: anyone can insert (public form), only service role can read
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feature requests"
  ON feature_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads feature requests"
  ON feature_requests FOR SELECT USING (auth.role() = 'service_role');
```

---

## 3. Hashtag Collections Table

Required for /hashtags page (Hashtag Manager).

```sql
CREATE TABLE IF NOT EXISTS hashtag_collections (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hashtag_collections_user_id_idx ON hashtag_collections(user_id);
ALTER TABLE hashtag_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own hashtag collections"
  ON hashtag_collections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 4. Media Files Table

Required for /media (Media Library). Also requires a Supabase Storage bucket named `media`.

```sql
CREATE TABLE IF NOT EXISTS media_files (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name   TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_type   TEXT,
  file_size   BIGINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_files_user_id_idx ON media_files(user_id);
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own media files"
  ON media_files FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**Also create the storage bucket:**
In Supabase Dashboard → Storage → New bucket:
- Name: `media`
- Public: ✅ (so images render in posts)
- File size limit: 52428800 (50MB)

---

## 5. Notifications Table

Required for /notifications.

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL DEFAULT 'system',
  title      TEXT NOT NULL,
  body       TEXT,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(user_id, read);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications"
  ON notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 6. Bio Pages and Bio Links Tables

Required for /link-in-bio. Also enables the public bio pages at /[username].

```sql
CREATE TABLE IF NOT EXISTS bio_pages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT DEFAULT '',
  bio           TEXT DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  theme         TEXT DEFAULT 'white',
  btn_style     TEXT DEFAULT 'rounded',
  links         JSONB DEFAULT '[]',
  socials       JSONB DEFAULT '{}',
  custom_domain TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bio_pages_user_id_idx ON bio_pages(user_id);
CREATE INDEX IF NOT EXISTS bio_pages_slug_idx ON bio_pages(slug);
ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read bio pages"
  ON bio_pages FOR SELECT USING (true);
CREATE POLICY "Users manage own bio page"
  ON bio_pages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 7. Evergreen Column on Posts

Required for /evergreen recycling page.

```sql
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS evergreen BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS posts_evergreen_idx ON posts(user_id, evergreen) WHERE evergreen = true;
```

---

## 8. Approvals Columns on Posts

Required for /approvals (Content Approval Workflows).

```sql
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS approval_note   TEXT;

-- approval_status values: 'none' | 'pending' | 'approved' | 'rejected'
CREATE INDEX IF NOT EXISTS posts_approval_idx ON posts(user_id, approval_status);
```

---

## 9. Analytics Column on Posts

Required for /analytics engagement sync feature.

```sql
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS analytics          JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS platform_post_ids  JSONB DEFAULT '{}';
```

---

## 10. Post Templates Table

Required for /templates (Templates Library). 20 system templates are seeded below.

```sql
CREATE TABLE IF NOT EXISTS post_templates (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = system template
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT DEFAULT 'Other',
  platforms   TEXT[] DEFAULT '{}',
  is_system   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_templates_user_idx ON post_templates(user_id);
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see system templates and own templates"
  ON post_templates FOR SELECT USING (is_system = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own templates"
  ON post_templates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 11. Inbox Messages Table

Required for /social-inbox (stores fetched mentions and replies).

```sql
CREATE TABLE IF NOT EXISTS inbox_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform    TEXT NOT NULL,
  type        TEXT DEFAULT 'mention',
  author      TEXT,
  content     TEXT,
  post_url    TEXT,
  external_id TEXT,
  read        BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inbox_messages_user_id_idx ON inbox_messages(user_id, read);
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own inbox"
  ON inbox_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 12. Rate Limit Counters Table

Required for publish-side rate limiting.

```sql
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform    TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count       INTEGER DEFAULT 0,
  UNIQUE (user_id, platform, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limit_user_platform_idx ON rate_limit_counters(user_id, platform, window_start);
ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits"
  ON rate_limit_counters FOR ALL USING (auth.role() = 'service_role');
```

---

## 13. Competitors Table

Required for /competitor-tracking.

```sql
CREATE TABLE IF NOT EXISTS competitors (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  handle      TEXT NOT NULL,
  platform    TEXT NOT NULL,
  display_name TEXT,
  last_checked TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competitors_user_id_idx ON competitors(user_id);
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own competitors"
  ON competitors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 14. Run Everything — Verify Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'feature_requests', 'hashtag_collections', 'media_files',
    'notifications', 'bio_pages', 'post_templates',
    'inbox_messages', 'rate_limit_counters', 'competitors'
  )
ORDER BY table_name;
```

---

## Stripe Live Mode Checklist (when ready to go live)

**Do NOT do this yet — complete these steps only when launching for real money:**

1. Go to Stripe Dashboard → toggle from Test to Live mode
2. Copy your LIVE `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` into Vercel env vars
3. In Live Stripe: Developers → Webhooks → Add endpoint `https://socialmate.studio/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
4. Copy the new Live webhook signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel
5. In Live Stripe: create your Pro ($5/mo) and Agency ($20/mo) recurring prices
   - Update `STRIPE_PRO_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID` in Vercel with the live price IDs
6. In Live Stripe: create your credit pack one-time prices ($5 = 500 credits, etc.)
   - Update any credit pack price IDs in the codebase
7. Test a real purchase end-to-end with a real card
8. Verify the webhook fires and your database updates correctly
9. Enable Stripe Radar rules for fraud protection
10. Set up Stripe Tax if selling internationally (VAT/GST compliance)
