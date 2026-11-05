# SOMA content guidelines and the weekly content system

Moved out of CLAUDE.md unchanged. SOMA reads a master document; these are the
rules it follows when that document is this project's CLAUDE.md.

---

## Weekly Content System

Each Friday (or end of sprint), archive the current CLAUDE.md as `CLAUDE-week-of-YYYY-MM-DD.md`.
Then diff the two files through Gemini/Claude to generate a week's worth of social posts based on what changed.
The diff = the story. Ship it to every platform.

---

## SOMA Content Guidelines

> Joshua's own SOMA setup (voice profile, uploads, credits) was removed Oct 23, 2026 at his request. These guidelines apply only if he sets SOMA up again.

When SOMA generates content from this document, follow these behavioral rules on every run:

**Overall tone:** Professional and motivational. We are a bootstrapped startup solving real problems for real creators. Address our challenges (solo founder, building nights and weekends, bootstrapped) as proof that anyone can build — not as complaints. Lead with progress and mission, never with hardship.

**LinkedIn posts (SOMA automates LinkedIn — `w_member_social` scope, personal profile):**
- Always open with OR weave in a relevant inspirational quote from a public domain / clearly attributed source (philosophers, builders, athletes, leaders — Marcus Aurelius, Seneca, Steve Jobs, Kobe Bryant, etc.)
- The quote must be thematically connected to the post topic — do not use a generic filler quote
- Format: Quote styled as a standalone line, then the post body, then hashtags
- Tone: thought leadership + builder credibility + creator empowerment
- Always close with relevant hashtags (8-12, mix of broad and niche)

**All platforms:**
- Always include hashtags tailored to each platform's norms (LinkedIn: professional/industry tags, Bluesky/Mastodon: creator/tech tags, Twitter: short punchy tags)
- Motivational closing line that connects back to mission: "Power to the people. Build the door." or a natural variation
- Keep voice consistent with Joshua's Voice DNA (confident, authentic, hip-hop + space + LoL culture influences, "cooked/fire/slay" vocabulary used sparingly and naturally)
- Never repeat an angle that already exists in SOMA Project Memory — check topics_covered and angles_used before generating

**SOMA does NOT need a new document to generate content:**
- SOMA can run anytime using the master doc as evergreen context about who we are, what we've built, and what we stand for
- When there is no new diff or update to post about, SOMA should generate: product education posts (explaining features), platform-specific tips ("did you know you can schedule LinkedIn posts with SocialMate?"), creator tips and value posts, founder story / mission posts, engagement posts (questions, polls, hot takes), community shoutouts, and motivational content tied to the creator mission
- Not every post needs to be an update. Some of the best content is timeless brand-building, not changelog announcements
- Use Project Memory to avoid repeating the same angles regardless of whether a diff was submitted

**Media (Unsplash images — LIVE since May 2026, PRs #433–#440):**
- SOMA **can** auto-attach non-copyrighted Unsplash images to posts. Each project has an `include_media` toggle; when on, SOMA extracts a keyword from the post, pulls a matched Unsplash image (deduped per run, sized under Bluesky's 1MB blob limit via `urls.small`), and attaches it with photographer attribution. Works in manual generate, the Autopilot Monday cron, and the Full Send daily cron.
- Also live: `include_video_url` per project (PR #442) — attach one video URL, injected into the Gemini prompt.
- Still on the roadmap: GIF auto-attach (GIPHY free tier) and true generated/native video content.

---
