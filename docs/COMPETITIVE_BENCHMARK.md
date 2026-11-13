# Competitive benchmark (Nov 13, 2026)

Scope: the tools SocialMate's own `/vs` pages already compare against, sampled
across market leaders, fast-growing/indie tools, and AI-first newcomers, plus
the ones this document uses to answer "what's table stakes." Not all 100
competitor pages on the site were re-verified in this pass; see "Not covered"
at the end.

**Source discipline:** every price below was read from the vendor's own
pricing page on Nov 13, 2026 (fetched directly, or confirmed with a screenshot
where the price only renders after a JS toggle). Where a page gave conflicting
numbers (annual vs. monthly, or the page itself was inconsistent), both are
shown. One entry (Publer) could not be fetched; it is marked unverified and
should not be quoted on any SocialMate page without checking publer.com directly.

## Pricing and plan matrix

| Tool | Free plan | Entry paid price | Billing unit | Top tier shown | AI tools | Team approvals |
|---|---|---|---|---|---|---|
| **SocialMate** | Yes, no card, 250 posts/mo | $8/mo (Pro) | flat, per workspace | $29/mo (Agency) | 15, Gemini | Yes (Editor/Client → Owner/Admin) |
| Buffer | Yes, "free forever," 3 channels | $5/mo (Essentials) | per channel | no named top tier; volume discount above 10 channels | AI Assistant (free+) | Team tier only |
| Hootsuite | No (14-day trial) | $99/user/mo (annual) | per seat | $399/user/mo (Advanced); custom Enterprise | AI post/image gen | Advanced tier only |
| Sprout Social | No (30-day trial) | $79/seat/mo annual ($99 monthly) | per seat | $399/seat/mo (Advanced); custom Enterprise | Trellis AI, 100 credits/seat/mo included | Not clearly listed; approvals absent from the public page |
| Later | No (14-day trial) | $18.75/mo annual (Starter, 1 social set) | per "social set" + per user | $82.50/mo annual (Scale) | 5-100 AI credits/mo by tier | Growth tier and up |
| Agorapulse | Trial-first ("free 30 days," no listed free tier) | $79/user/mo annual ($99 monthly) | per seat | custom (Custom tier) | AI reply suggestions (Custom tier only) | Professional tier and up (1-step); multi-step on Custom |
| Metricool | Yes, free forever, 1 brand, 20 posts/mo | $20/mo annual (Starter, up to 5 brands) | per brand count | custom ("Let's talk") | AI assistant on Free; AI credits scale by tier | Advanced tier and up |
| Postiz | No (7-day trial) | $23/mo annual / $29/mo monthly (Standard) | per plan, 5 channels | $79/mo annual / $99/mo monthly (Ultimate) | AI copilot all tiers; AI images/video scale by tier | Not listed on the pricing page |
| Vista Social | No (14-day trial) | $80/mo annual / $99/mo monthly (Professional) | per plan, profile-capped | $360/mo annual / $449/mo monthly (Scale); custom Enterprise | 1,000-3,500 AI credits/mo by tier | Advanced tier and up (multi-stage) |
| Typefully | Yes, free, 1 social set, 10 posts/mo | $99/year (Creator, annual only) or $18/mo per social set annual / $20/mo monthly (Business) | per "social set" | Business, up to 50 social sets | Writing assistant, rewrite, AI image descriptions | Business tier (teams/roles) |
| Publer *(unverified — see note)* | Reported: yes, 3 accounts | Reported: ~$10/mo per account (Business) | per account, reported | Enterprise, custom | GPT-4 captions, DALL-E images (reported) | Unknown |

Notes on reading this table:
- "Per seat/per channel/per social set" pricing means the sticker price understates cost for anyone with more than one account or more than one teammate — SocialMate's flat-per-workspace price is the exception, not the norm.
- Free plans that are real (no card, no expiry) exist at exactly two of these ten: SocialMate and Metricool. Buffer's is real but capped at 3 channels and 10 posts/channel. Everyone else gates behind a time-boxed trial.
- AI credit pools and per-use costs are universal now; nobody charges extra per AI call the way SocialMate did before credits existed. This is fully table stakes.

## 1. What's table stakes SocialMate must have

- **A real AI writing assistant in the composer** (not a separate add-on). SocialMate has this (15 tools, Gemini). Keep it visible in Compose, don't bury it.
- **Approval workflows for team content.** Buffer, Later, Agorapulse and Vista Social all gate this behind a mid or top tier; SocialMate gives it on every plan including Free, which is a genuine differentiator worth saying louder on `/pricing` and `/vs` pages, not just listing it as a feature.
- **A visible free tier with no credit card.** Only SocialMate and Metricool do this cleanly among the ten reviewed. This is SocialMate's strongest card and the current pricing page already leads with it; keep leading with it.
- **Analytics with real history**, not just "connected accounts." SocialMate's 90-day history is behind the newer entrants (Vista Social's AI-credit scaling, Sprout's Trellis) but ahead of nothing-at-all. Not urgent, but 90 days reads thin next to Later's "up to 2 years."
- **A calendar/queue view with drag-to-reschedule.** Universal; SocialMate has it.

## 2. What makes the best tools feel premium, beyond features

- **Typefully and Vista Social's pricing pages load instantly with a monthly/yearly toggle that recalculates in place** — no reload, no layout shift. SocialMate's `/pricing` page should be checked against this (it already has a toggle; verify it doesn't reflow).
- **Buffer's empty states and onboarding copy are famously terse and confident** ("Free forever," no hedging). SocialMate's copy is accurate but sometimes over-explains (see the Compose AI tool descriptions fixed this session — they now say what a tool does in 3-4 words, which is the right length).
- **Postiz and Typefully lean hard into "built for teams that move fast"** — Slack notifications, comments on drafts, @mentions. SocialMate's team features exist (Editor/Client roles, approvals) but aren't marketed with that same "move fast together" energy anywhere public-facing.
- **Sprout and Hootsuite's higher tiers all show a visible "100 AI credits/seat" or similar number right on the pricing card.** SocialMate already does this (credits per plan on `/pricing`), which matches best practice.
- **Nobody in this set hides pricing behind "request a demo" except at the literal Enterprise tier.** SocialMate doesn't either — good, don't change that.

## 3. Gaps nobody fills well that fit "content creator operating system"

- **Cross-platform content repurposing that actually reshapes format**, not just re-posts the same text. SocialMate's Repurpose tool (6 formats, one click) is close to unique; Repurpose.io and a few niche tools do this but none of the ten above bundle it with scheduling the way SocialMate does.
- **Discord and Telegram scheduling.** None of the ten tools above support either. This remains SocialMate's clearest "nobody else does this" claim and is already the headline differentiator in the `/vs` pages — correctly so.
- **An autonomous content system that reads a living source document** (SOMA). Closest analog in this set is Postiz's "Smart Agent," which is thinner (no voice-learning, no document diffing). Worth keeping SOMA's public description honest about what it does today vs. what's aspirational, since it's genuinely ahead of this field.
- **Fair, non-predatory free-tier AI use.** Most tools above either have no free AI or cap it so low it's a demo. SocialMate's 50 free credits/month is real usage, not a teaser.

## 4. Where SocialMate is already competitive or better

- **Price for a small team.** At $8/mo flat for 5 accounts per platform, SocialMate undercuts every per-seat or per-channel competitor above except Buffer's single-channel Essentials ($5/mo for exactly one channel, which stops scaling well past 1-2 channels).
- **Platform breadth that matters to creators, not agencies.** Discord + Telegram + Bluesky + Mastodon + TikTok + LinkedIn + X, with a free tier covering six of the seven, beats every tool above on "platforms a creator who isn't on Meta can actually use."
- **Approvals on the free plan.** Nobody else in this set does this below their paid tiers.
- **No per-seat tax.** Every seat-priced competitor here (Hootsuite, Sprout, Agorapulse) turns a 5-person team into a 5x bill. SocialMate's flat $8-$29 covers up to 15 seats on Agency.

## Not covered in this pass

This document samples 10 of the roughly 95 tools SocialMate's `/vs` pages
compare against. The ones re-verified here are the highest-traffic comparison
pages and the category leaders named in the original brief. The remaining
~85 `/vs` pages were not re-checked against their vendors' current pricing in
this session; `docs/CONTENT_AUDIT.md` flags this as open work, and
`CLAUDE.md`'s rule stands: any price quoted on a `/vs` page must come from
that vendor's own page, with the date checked, before publishing a change to it.

**Publer could not be verified.** `publer.com/pricing` returns a redirect loop
from an automated fetch. A person should open it in a browser and copy the
current numbers before any SocialMate page states a Publer price.
