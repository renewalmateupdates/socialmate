# SocialMate — Pre-Launch Checklist & Roadmap
**Launch Date: April 1, 2026 · Updated: March 29, 2026**

---

## ✅ WHAT'S ALREADY DONE

### Core App
- [x] Next.js 14 app with Supabase auth, Stripe billing, Inngest scheduling
- [x] 4 live platforms: Bluesky, Discord, Telegram, Mastodon
- [x] Bulk scheduler (CSV upload)
- [x] 12 AI tools (Gemini 2.5 Flash)
- [x] Analytics, best times, posting streak
- [x] Link-in-Bio page builder
- [x] Team collaboration + approval workflows
- [x] Hashtag manager, templates, media library
- [x] White-label mode
- [x] Evergreen recycling, RSS import, competitor tracking
- [x] Dark mode + accent color theming
- [x] Workspaces (Pro/Agency)
- [x] Credit packs (Stripe one-time payments)

### Marketing & Launch
- [x] OG image updated (1270×760, "Schedule smarter. Start free.")
- [x] OG metadata fixed — accurate 4-platform count, no competitor callouts
- [x] Product Hunt badge in header + homepage footer
- [x] Stripe promo codes enabled at all 3 checkout types
- [x] Launch promo code SMPH411 created (3 months free, live for 1 year)
- [x] 6 SEO blog posts live
- [x] 5 NEW SEO/AIO blog posts added (Bluesky scheduling, small biz guide, free tools, Bluesky growth, scheduling vs manual)
- [x] Launch content file: Bluesky posts, Reddit post, Discord messages, HN post, PH comment template
- [x] Directory submissions: SaaSHub ✅ | AlternativeTo (Monday) | BetaList (paid, skip)
- [x] SaaSHub promo code SMSAASHUB created
- [x] Public footer has Affiliate + Partners links
- [x] Public nav has mobile hamburger menu + Partners button
- [x] Sidebar "Referrals" → /affiliate (fixed, no longer shows Settings in background)
- [x] Sidebar "Partners" → /partners (cash commission portal)
- [x] Referral page mobile fixes (grid stacking on small screens)

### Affiliate Partner Portal (PR #30 merged)
- [x] /partners — login page (dark gold/purple design, Google + email auth)
- [x] /partners/onboarding — 4-step onboarding (TOS, Stripe Connect, W-9, promo codes)
- [x] /partners/dashboard — full earnings dashboard (stats, promo codes, conversions, payouts)
- [x] /partners/access-denied — graceful rejection page
- [x] /partners/declined — declined invite page
- [x] /admin/partners — admin control panel (invite, approve, manage, pay)
- [x] 7 API routes (invite, respond, onboarding, Stripe Connect return, payout, W-9, stats)
- [x] W-9 daily alert cron job added to vercel.json
- [x] 8 affiliate email templates (invite, approval, rejection, W-9 alerts, payout notifications)
- [x] All 9 SQL tables created in Supabase ✅

---

## 🔴 MUST DO BEFORE APRIL 1st

### 1. Set Vercel Environment Variables
Go to: **Vercel Dashboard → SocialMate project → Settings → Environment Variables**

Add or verify these are set for **Production**:

```
NEXT_PUBLIC_APP_URL=https://socialmate.studio
ADMIN_EMAIL=<your-login-email@gmail.com>
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51T96yV7OMwDowUuU...
STRIPE_PRO_PRICE_ID=price_1T9S2v7OMwDowUuULHznqUD5
STRIPE_AGENCY_PRICE_ID=price_1TFMHp7OMwDowUuUgeLAeJNY
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://arwziubvjqfekkpohbbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-key>
INNGEST_EVENT_KEY=<your-inngest-key>
INNGEST_SIGNING_KEY=<your-inngest-signing-key>
GEMINI_API_KEY=<your-gemini-key>
CRON_SECRET=sm_cron_2026_gilgamesh
```

⚠️ **ADMIN_EMAIL is critical** — this is the email you use to log in to SocialMate. Once set, you can access the partner admin panel at `socialmate.studio/admin/partners`.

### 2. Create Master Promo Codes in Stripe (Live Mode)
Run this script once with your live key:
```bash
STRIPE_SECRET_KEY=sk_live_... node scripts/create-stripe-promo-codes.mjs
```
Creates: SMVIP100, SMLAUNCH50, SMFAMILY, SMPARTNER, SMPRESS, SMCREDITS50, SMAFFILIATE

### 3. Complete Stripe Connect Verification
- Finish identity verification in Stripe Dashboard (live mode)
- Once verified, get your `ca_...` Connect client ID
- Add to Vercel: `STRIPE_CONNECT_CLIENT_ID=ca_...`
- This enables affiliates to connect their bank accounts for payouts

### 4. Add Stripe Branding
In Stripe Dashboard → Settings → Branding:
- Upload SocialMate logo
- Set brand color to #000000 (black) or your accent color
- This makes checkout look professional vs generic Stripe

### 5. Test the Full Flow End-to-End
- [ ] Sign up as a new user
- [ ] Connect a Bluesky account
- [ ] Schedule and publish a post
- [ ] Upgrade to Pro (use SMLAUNCH50 code)
- [ ] Verify webhook fires correctly (Supabase plan updates)
- [ ] Access /admin/partners — confirm you can see the panel
- [ ] Send a test partner invite to yourself

### 6. Run SQL Additions (copy into Supabase SQL editor)
See `ADMIN_SETUP.sql` at bottom of this file.

---

## 🟡 DO ON LAUNCH DAY (April 1st)

### Morning (9–10am EST)
- [ ] Post Product Hunt listing — set it live
- [ ] Drop the pinned PH comment (template in docs/LAUNCH_CONTENT.md)
- [ ] Post your first Bluesky post (Angle 1 — The Problem)
- [ ] Post to r/SaaS (Reddit post in LAUNCH_CONTENT.md)
- [ ] Post Show HN to Hacker News (HN post in LAUNCH_CONTENT.md)
- [ ] Post to Discord communities (5 messages in LAUNCH_CONTENT.md)

### Throughout the Day
- [ ] Respond to EVERY comment on PH, HN, Reddit, Bluesky
- [ ] Post 2nd Bluesky post (Angle 3 — Underdog Story) around noon
- [ ] Repost/share PH listing on all social accounts
- [ ] Check Stripe dashboard for signups/upgrades

### Evening
- [ ] Post 3rd Bluesky post (Angle 5 — Direct CTA)
- [ ] Thank everyone who commented/upvoted
- [ ] Screenshot your PH ranking and share it

---

## 📋 PENDING TASKS (Post-Launch Batch 1 — First 2 Weeks)

### Platform Expansion
- [ ] LinkedIn — complete app review (6+ week process, start now)
- [ ] Instagram — complete Meta app review
- [ ] YouTube — complete Google API approval
- [ ] Pinterest — already verified, complete API integration
- [ ] TikTok — start app review process
- [ ] X/Twitter — complete OAuth 2.0 setup

### Product Polish
- [ ] Mobile experience audit complete (done in this PR)
- [ ] AlternativeTo submission — revisit Monday (March 30 or April 1)
- [ ] Facebook page — revisit in 2 weeks (account needs age)
- [ ] Add more Stripe directory promo codes as more directories are submitted

### Affiliate Program
- [ ] Invite first 3-5 affiliates manually (after Stripe Connect is verified)
- [ ] Send your own email to your network about the affiliate program
- [ ] Test full affiliate flow: invite → onboarding → dashboard → payout request

---

## 📋 BATCH 2 (Weeks 3–4 After Launch)

### Growth
- [ ] Guest post / podcast outreach (5 targets per week)
- [ ] ProductHunt follow-up post ("30 days later" update)
- [ ] Indie Hackers milestone post
- [ ] Build in public thread on Bluesky
- [ ] YouTube tutorial: "Schedule 30 days of content in 1 hour"
- [ ] Write 2 more SEO blog posts (targeting "social media tools for freelancers", "Mastodon scheduler")

### Product
- [ ] Notification system improvements
- [ ] Mobile app planning (PWA first)
- [ ] Stripe Connect payout testing end-to-end
- [ ] In-app affiliate application flow improvements (dedicated form page instead of /partners portal)
- [ ] Team invitation UX improvements

---

## 📋 BATCH 3 (Month 2)

### Platform
- [ ] LinkedIn full integration live
- [ ] Instagram full integration live
- [ ] Thread/carousel post support
- [ ] First mobile PWA release

### Business
- [ ] First affiliate payout (if Stripe Connect complete)
- [ ] SM-Give charity integration (50% of forfeited affiliate funds)
- [ ] Press outreach: TechCrunch, The Verge, IndieHackers features
- [ ] Annual plan options (save 2 months)

---

## 🔑 ADMIN ACCESS — HOW TO ACCESS THE PARTNER ADMIN PANEL

### Step 1: Set ADMIN_EMAIL in Vercel
In Vercel → Project Settings → Environment Variables, add:
```
ADMIN_EMAIL = the-email-you-use-to-log-into-socialmate@gmail.com
```

### Step 2: Log in to SocialMate
Go to socialmate.studio/login and log in with that exact email.

### Step 3: Go to the Admin Panel
Navigate to: **socialmate.studio/admin/partners**

You'll see:
- All affiliate applications and invited partners
- Ability to send partner invites (enter any email)
- Approve / suspend / terminate affiliates
- View earnings, conversions, payout requests
- Process payouts (once Stripe Connect is live)

### What You Can Do From the Admin Panel
| Action | How |
|--------|-----|
| Invite a new affiliate | Enter their email → sends them a branded invite |
| Approve an affiliate | Click Approve on their profile |
| Suspend an affiliate | Change status to Suspended |
| View their earnings | See commissions, conversion history |
| Process payout | Approve payout request → Stripe sends funds |

---

## 📧 PROMO CODES MASTER LIST

| Code | Discount | Duration | Purpose |
|------|----------|----------|---------|
| SMPH411 | 3 months free (Pro) | Active 1 year | Product Hunt launch |
| SMVIP100 | 100% off | 1 month | VIP/gifting |
| SMLAUNCH50 | 50% off | 3 months | Launch deal |
| SMFAMILY | 100% off | Forever | Friends & family |
| SMPARTNER | 30% off | Forever | Partners/collabs |
| SMPRESS | 100% off | 3 months | Press/media |
| SMCREDITS50 | 50% off | One-time | Credit pack purchases |
| SMAFFILIATE | 20% off | 3 months | Affiliate program promo |
| SMBETAPAGE | Same as SMPH411 | Active 1 year | BetaPage directory |
| SMSAASHUB | Same as SMPH411 | Active 1 year | SaaSHub directory |
| SMINDIE | Same as SMPH411 | Active 1 year | Indie Hackers |
| SMALTERNATIVE | Same as SMPH411 | Active 1 year | AlternativeTo |

*(Master codes need to be created in Stripe live mode — run the script)*

---

## 🗄️ SQL ADDITIONS (Run in Supabase SQL Editor After Merge)

```sql
-- Optional: view for admin to see all affiliate earnings at a glance
create or replace view public.affiliate_summary as
select
  p.id,
  p.email,
  p.full_name,
  p.status,
  p.commission_rate,
  p.active_referral_count,
  round(p.available_balance_cents::numeric / 100, 2) as available_balance_usd,
  round(p.lifetime_earnings_cents::numeric / 100, 2) as lifetime_earnings_usd,
  round(p.paid_out_cents::numeric / 100, 2) as paid_out_usd,
  p.w9_required,
  p.w9_submitted,
  p.onboarding_completed,
  p.stripe_account_status,
  p.created_at
from public.affiliate_profiles p
order by p.lifetime_earnings_cents desc;

-- Grant admin read access
grant select on public.affiliate_summary to service_role;
```

```sql
-- Optional: index to speed up admin queries
create index if not exists affiliate_profiles_status_idx on public.affiliate_profiles (status);
create index if not exists affiliate_conversions_affiliate_id_status on public.affiliate_conversions (affiliate_id, status);
create index if not exists affiliate_payouts_affiliate_id_status on public.affiliate_payouts (affiliate_id, status);
```

---

## 📊 SUCCESS METRICS — TRACK THESE

**Week 1:**
- Signups from PH launch
- Product Hunt rank (goal: top 10 of the day)
- HN upvotes / comments
- Reddit post karma

**Month 1:**
- Total registered users
- Free → Pro conversion rate (goal: 2–5%)
- Monthly recurring revenue (MRR)
- Churn rate
- Most-used features

**Month 3:**
- First 10 paying users
- First affiliate payout
- Second platform added beyond current 4
- First organic SEO traffic from blog posts

---

*Last updated: March 29, 2026 · by Claude (Anthropic)*
