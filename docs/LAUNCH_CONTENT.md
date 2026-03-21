# SocialMate Launch Content

10 ready-to-post pieces for Bluesky (under 300 chars each) + Reddit launch post.
Voice: solo founder, honest, no hype. Direct.

---

## ANGLE 1 — THE PROBLEM (2 posts)

**Post 1**
Buffer removed their free plan. Hootsuite is $99/month. I needed something free that just worked — so I built it. socialmate.studio

---

**Post 2**
If you've been paying $20/month just to schedule 5 posts/week across 3 accounts, you're being overcharged. There's a better way now. socialmate.studio — free forever.

---

## ANGLE 2 — THE PRODUCT (2 posts)

**Post 3**
SocialMate: schedule posts to Bluesky, Discord, Telegram, and Mastodon from one place. Free. No per-channel fee. No post limit. Built it because I needed it. socialmate.studio

---

**Post 4**
One compose window → 4 platforms → one click. Bluesky, Discord, Telegram, Mastodon. 12 more platforms coming. Free to use. socialmate.studio

---

## ANGLE 3 — THE UNDERDOG STORY (2 posts)

**Post 5**
Solo founder, bootstrapped, no funding. Built this in my spare time because Buffer pricing was insulting. If you root for the underdog, come try it. socialmate.studio

---

**Post 6**
No VC. No team. No marketing budget. Just a dev who got tired of paying $20/month to schedule tweets. Building in public. socialmate.studio — free while I find product-market fit.

---

## ANGLE 4 — SOCIAL PROOF HOOK (2 posts)

**Post 7**
Hey ex-Buffer free plan users — where did you end up? I built a free alternative. 4 platforms live, 12 more coming. Would love your honest feedback. socialmate.studio

---

**Post 8**
If you left Hootsuite or Buffer because of pricing, I built this for you. Free scheduling for Bluesky, Discord, Telegram, Mastodon. No card required. socialmate.studio

---

## ANGLE 5 — DIRECT CTA (2 posts)

**Post 9**
socialmate.studio — free forever, no credit card. Schedule to 4 platforms now, 16 by end of year. 50 AI credits/month included. Takes 60 seconds to set up.

---

**Post 10**
Free social media scheduler. Bluesky + Discord + Telegram + Mastodon. 50 AI credits/month. No card. No catch. socialmate.studio

---

---

## REDDIT POST — r/SaaS

**Title:** I built a free Buffer alternative after they removed their free plan — here's what I learned

---

**Body:**

Buffer removed their free plan in 2023. Hootsuite starts at $99/month. Later raised prices again. If you're a solo creator or small business, you're basically stuck paying monthly fees just to schedule posts.

I decided to build an alternative.

**What it does**

SocialMate is a social media scheduling tool that currently supports Bluesky, Discord, Telegram, and Mastodon — with LinkedIn, YouTube, Instagram, TikTok, Reddit, Pinterest, Threads, Facebook, X/Twitter, Snapchat, Lemon8, and BeReal in development.

One compose window. Select your platforms. Schedule or post now.

That's it. No per-channel fees. No "connect 3 accounts on free, 10 on Pro" nonsense.

**What's actually built**

- Post scheduling (with Inngest for reliability)
- Bulk scheduler (upload a CSV, schedule 50 posts at once)
- 12 AI tools via Google Gemini (captions, hashtags, thread generator, viral hooks, post score, content calendar, SM-Pulse trend scanner, SM-Radar content analyzer, and more)
- Analytics (posting streaks, best times, platform breakdown)
- Link-in-Bio page builder
- Team collaboration (invite members, role-based access)
- Hashtag collections (save and reuse hashtag groups)
- Affiliate program (30-40% recurring commission)
- Post approval workflow for agencies
- Dark mode + accent colors

**Free vs Paid**

Free plan:
- 4 platforms (live now), 16 total as they ship
- 50 AI credits/month (builds up to 75 in the bank)
- 100 posts/month
- 2 team seats
- 2-week scheduling window

Pro ($5/month):
- Everything, plus 500 AI credits, 5 connected accounts per platform, 1-month scheduling window, 5 team seats, client workspaces, 90-day analytics

Agency ($20/month):
- 2000 AI credits, 15 accounts per platform, 3-month window, 15 team seats, full white-label, 3 client workspaces

**What I learned building this**

1. OAuth for social platforms is a nightmare. Every platform has different scopes, token expiry logic, and review processes. Instagram and TikTok require app review before any user can connect. Plan 6+ weeks for that process.

2. Scheduling is harder than it looks. You need a reliable queue system — I used Inngest. A simple cron job breaks the moment you need to handle retries, failures, and race conditions.

3. Free plans attract noise, but also the most honest feedback. My best bug reports came from free users.

4. People don't want more features. They want fewer reasons to switch tools. The pitch is basically: "do the same thing you do in Buffer, but without paying for it."

5. Competing with Buffer/Hootsuite by going head-to-head is dumb. Winning on price with a narrow feature set that's actually polished is the play.

**Current state**

It's in beta. 4 platforms are live and tested. The other 12 are in progress — some need API access, some need app review, some are waiting on my backlog.

The core flow (compose → schedule → publish) works reliably. The AI tools work. Analytics work. The billing/upgrade flow works.

What's rough: mobile experience needs work, some edge cases in scheduling haven't been stress-tested at scale, and I'm one person so support is me checking email.

**Honest ask**

If you've been burned by Buffer or Hootsuite pricing, try it: socialmate.studio

If you find a bug or something that's broken, tell me. I'm easy to reach.

Not asking for signups just to hit a number. Looking for people who actually need this and will tell me what's missing.

Happy to answer questions.

---

*Link: socialmate.studio*
*Free forever plan available — no credit card required*
