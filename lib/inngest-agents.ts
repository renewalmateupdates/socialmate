import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

const REPURPOSE_PROMPTS: Record<string, string> = {
  thread:        'Turn this into an engaging 5-7 part thread. Start with a hook. Number each part (1/, 2/, etc.). Keep each part under 280 characters.',
  caption:       'Rewrite as a punchy social media caption under 150 chars with 3-5 relevant hashtags.',
  linkedin_post: 'Rewrite as a professional LinkedIn post. Conversational but polished. 150-250 words.',
  email:         "Turn this into a newsletter email section. Add a suggested subject line at the top prefixed with 'Subject:'",
  short_hook:    'Distill into a single attention-grabbing hook under 140 characters.',
}

// ─────────────────────────────────────────────────────────────────────────────
// Newsletter Agent — every Sunday 9am UTC
// Takes each workspace's published posts from the past week, generates a
// newsletter via Gemini, sends via Resend (draft or auto mode).
// ─────────────────────────────────────────────────────────────────────────────
export const newsletterAgent = inngest.createFunction(
  { id: 'newsletter-agent', name: 'Newsletter Agent', retries: 2 },
  { cron: '0 9 * * 0' },
  async ({ step }) => {
    const admin   = getSupabaseAdmin()
    const now     = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const settings = await step.run('fetch-enabled-settings', async () => {
      const { data } = await admin
        .from('newsletter_settings')
        .select('*')
        .eq('enabled', true)
      return data ?? []
    })

    if (!settings.length) return { sent: 0, drafted: 0 }

    let sent = 0
    let drafted = 0

    for (const cfg of settings as any[]) {
      try {
        await step.run(`newsletter-${cfg.workspace_id}`, async () => {
          const { data: posts } = await admin
            .from('posts')
            .select('content, platforms, published_at')
            .eq('workspace_id', cfg.workspace_id)
            .eq('status', 'published')
            .gte('published_at', weekAgo.toISOString())
            .order('published_at', { ascending: false })
            .limit(20)

          if (!posts || posts.length === 0) return

          const { data: authUser } = await admin.auth.admin.getUserById(cfg.user_id)
          const userEmail = authUser?.user?.email
          if (!userEmail) return

          const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
          if (!apiKey) return

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

          const postBlock = posts.map((p: any, i: number) =>
            `${i + 1}. [${(p.platforms ?? []).join(', ')}] ${p.content}`
          ).join('\n\n')

          const intro = cfg.custom_intro ? `\nCreator note: "${cfg.custom_intro}"` : ''
          const prompt = `You are a newsletter writer. Turn these social media posts from the past week into a cohesive newsletter.${intro}

POSTS:
${postBlock}

Rules:
- Subject line: engaging, under 10 words, specific to this content
- Body: 3-5 short paragraphs synthesizing themes — not just a list
- Conversational, human tone — not corporate
- End with a brief call to action (follow, reply, share)
- NO: "I hope this finds you well", "This week I", "In conclusion"

Return ONLY valid JSON:
{"subject":"the subject line","html":"full newsletter HTML (simple, email-safe, dark text on white bg)"}`

          const result = await model.generateContent(prompt)
          const text   = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
          const parsed = JSON.parse(text)
          if (!parsed.subject || !parsed.html) return

          const subject = cfg.subject_prefix
            ? `${cfg.subject_prefix}: ${parsed.subject}`
            : parsed.subject

          await admin.from('newsletter_sends').insert({
            workspace_id:     cfg.workspace_id,
            user_id:          cfg.user_id,
            subject,
            content_html:     parsed.html,
            subscriber_count: cfg.mode === 'auto' ? (cfg.subscriber_emails ?? []).length : 0,
            mode:             cfg.mode ?? 'draft',
          })

          await admin.from('newsletter_settings')
            .update({ last_sent_at: now.toISOString() })
            .eq('workspace_id', cfg.workspace_id)

          if (cfg.mode === 'auto' && (cfg.subscriber_emails ?? []).length > 0) {
            const resend = getResend()
            for (const email of cfg.subscriber_emails) {
              await resend.emails.send({
                from: 'Newsletter <newsletter@socialmate.studio>',
                to: email, subject, html: parsed.html,
              }).catch((e: any) => console.error('[NewsletterAgent] send failed:', e))
            }
            sent++
          } else {
            await getResend().emails.send({
              from:    'SOMA <soma@socialmate.studio>',
              to:      userEmail,
              subject: `Your newsletter draft is ready`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                <h2 style="color:#f59e0b;">Newsletter Draft Ready</h2>
                <p>Your weekly newsletter has been drafted from this week's posts. Review and send when ready.</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <a href="${APP_URL}/agents/newsletter" style="display:inline-block;background:#f59e0b;color:#000;font-weight:700;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:12px;">Review Draft</a>
              </div>`,
            }).catch((e: any) => console.error('[NewsletterAgent] draft notify failed:', e))
            drafted++
          }
        })
      } catch (err: any) {
        console.error(`[NewsletterAgent] workspace ${cfg.workspace_id}:`, err?.message)
      }
    }

    console.log(`[NewsletterAgent] sent: ${sent}, drafted: ${drafted}`)
    return { sent, drafted }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Client Report Agent — every Monday 9am UTC (Agency only)
// Generates a weekly performance summary for each agency workspace and
// emails it to the owner + any configured recipient emails.
// ─────────────────────────────────────────────────────────────────────────────
export const clientReportAgent = inngest.createFunction(
  { id: 'client-report-agent', name: 'Client Report Agent', retries: 2 },
  { cron: '0 9 * * 1' },
  async ({ step }) => {
    const admin   = getSupabaseAdmin()
    const now     = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekStr = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

    const settings = await step.run('fetch-enabled-settings', async () => {
      const { data } = await admin
        .from('client_report_settings')
        .select('*')
        .eq('enabled', true)
      return data ?? []
    })

    if (!settings.length) return { sent: 0 }

    let sent = 0

    for (const cfg of settings as any[]) {
      try {
        await step.run(`client-report-${cfg.workspace_id}`, async () => {
          const { data: ws } = await admin
            .from('workspaces')
            .select('plan, name')
            .eq('id', cfg.workspace_id)
            .single()

          if (!ws || !['agency', 'agency_annual'].includes(ws.plan ?? '')) return

          const { data: authUser } = await admin.auth.admin.getUserById(cfg.user_id)
          const ownerEmail = authUser?.user?.email
          if (!ownerEmail) return

          const { data: posts } = await admin
            .from('posts')
            .select('platforms, published_at')
            .eq('workspace_id', cfg.workspace_id)
            .eq('status', 'published')
            .gte('published_at', weekAgo.toISOString())

          const { data: scheduled } = await admin
            .from('posts')
            .select('id')
            .eq('workspace_id', cfg.workspace_id)
            .eq('status', 'scheduled')
            .gte('scheduled_at', now.toISOString())

          const totalPublished  = (posts ?? []).length
          const totalScheduled  = (scheduled ?? []).length
          const platformSet     = new Set((posts ?? []).flatMap((p: any) => p.platforms ?? []))
          const activePlatforms = Array.from(platformSet).join(', ') || 'None'

          const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
            <div style="background:#f59e0b;padding:20px 24px;border-radius:8px;margin-bottom:24px;">
              <h1 style="color:#000;margin:0;font-size:20px;">Weekly Client Report</h1>
              <p style="color:#000;margin:6px 0 0;font-size:13px;">${ws.name} &middot; ${weekStr}</p>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#000;">${totalPublished}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">Posts Published</div>
                </td>
                <td style="width:12px;"></td>
                <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#000;">${totalScheduled}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">Scheduled Ahead</div>
                </td>
                <td style="width:12px;"></td>
                <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <div style="font-size:13px;font-weight:700;color:#000;">${activePlatforms}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">Active Platforms</div>
                </td>
              </tr>
            </table>
            <a href="${APP_URL}/analytics" style="display:inline-block;background:#000;color:#fff;font-weight:700;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;">View Full Analytics</a>
            <p style="color:#9ca3af;font-size:11px;margin-top:24px;">Powered by SocialMate &middot; <a href="${APP_URL}/agents/client-report" style="color:#9ca3af;">Manage settings</a></p>
          </div>`

          const recipients = [ownerEmail, ...(cfg.recipient_emails ?? [])]
          for (const email of recipients) {
            await getResend().emails.send({
              from:    'SocialMate Reports <reports@socialmate.studio>',
              to:      email,
              subject: `Weekly Report: ${ws.name} — ${weekStr}`,
              html,
            }).catch((e: any) => console.error('[ClientReportAgent] send failed:', e?.message))
          }

          await admin.from('client_report_settings')
            .update({ last_sent_at: now.toISOString() })
            .eq('workspace_id', cfg.workspace_id)

          sent++
        })
      } catch (err: any) {
        console.error(`[ClientReportAgent] workspace ${cfg.workspace_id}:`, err?.message)
      }
    }

    console.log(`[ClientReportAgent] sent: ${sent}`)
    return { sent }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Repurpose Agent — every Wednesday 9am UTC (Pro+)
// Picks each workspace's best recent post and generates configured formats
// as draft posts in the queue. Free, no credits charged per run.
// ─────────────────────────────────────────────────────────────────────────────
export const repurposeAgent = inngest.createFunction(
  { id: 'repurpose-agent', name: 'Repurpose Agent', retries: 2 },
  { cron: '0 9 * * 3' },
  async ({ step }) => {
    const admin  = getSupabaseAdmin()
    const now    = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const settings = await step.run('fetch-enabled-settings', async () => {
      const { data } = await admin
        .from('repurpose_settings')
        .select('*')
        .eq('enabled', true)
      return data ?? []
    })

    if (!settings.length) return { processed: 0 }

    let processed = 0

    for (const cfg of settings as any[]) {
      try {
        await step.run(`repurpose-${cfg.workspace_id}`, async () => {
          // Verify Pro+ plan
          const { data: ws } = await admin
            .from('workspaces')
            .select('plan')
            .eq('id', cfg.workspace_id)
            .single()

          if (!ws || ws.plan === 'free') return

          // Pick the most recent published post from the last 2 weeks
          const { data: posts } = await admin
            .from('posts')
            .select('id, content, platforms')
            .eq('workspace_id', cfg.workspace_id)
            .eq('status', 'published')
            .gte('published_at', twoWeeksAgo.toISOString())
            .order('published_at', { ascending: false })
            .limit(1)

          if (!posts || posts.length === 0) return

          const sourcePost = posts[0]
          if (!sourcePost.content || sourcePost.content.trim().length < 20) return

          const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
          if (!apiKey) return

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

          const formats: string[] = Array.isArray(cfg.formats) ? cfg.formats : ['thread', 'caption']

          for (const format of formats) {
            const instruction = REPURPOSE_PROMPTS[format]
            if (!instruction) continue

            try {
              const prompt = `You are a content repurposing expert. ${instruction} Return only the repurposed content, nothing else.\n\nOriginal post:\n${sourcePost.content}`
              const result = await model.generateContent(prompt)
              const text   = result.response.text().trim()
              if (!text) continue

              const label: Record<string, string> = {
                thread: 'Thread', caption: 'Caption', linkedin_post: 'LinkedIn Post',
                email: 'Email Snippet', short_hook: 'Short Hook',
              }

              const draftContent = `[Repurposed as ${label[format] ?? format}]\n\n${text}`

              await admin.from('posts').insert({
                workspace_id: cfg.workspace_id,
                user_id:      cfg.user_id,
                content:      draftContent,
                platforms:    [],
                status:       cfg.mode === 'auto' ? 'scheduled' : 'draft',
                scheduled_at: cfg.mode === 'auto' ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
              })
            } catch (fmtErr: any) {
              console.error(`[RepurposeAgent] format ${format} workspace ${cfg.workspace_id}:`, fmtErr?.message)
            }
          }

          await admin.from('repurpose_settings')
            .update({ last_ran_at: now.toISOString() })
            .eq('workspace_id', cfg.workspace_id)

          // Notify owner that new drafts are ready
          if (cfg.mode === 'draft') {
            try {
              await admin.from('notifications').insert({
                user_id:    cfg.user_id,
                type:       'repurpose_ready',
                title:      '♻️ Repurposed drafts ready',
                body:       `${formats.length} new draft${formats.length > 1 ? 's' : ''} generated from your best post this week.`,
                action_url: '/drafts',
                read:       false,
              })
            } catch {}
          }

          processed++
        })
      } catch (err: any) {
        console.error(`[RepurposeAgent] workspace ${cfg.workspace_id}:`, err?.message)
      }
    }

    console.log(`[RepurposeAgent] processed: ${processed}`)
    return { processed }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Caption Agent — every day at 11am UTC (Agency only)
// Checks configured RSS feeds for new items, generates social post drafts via
// Gemini, drops them into the workspace queue. Free, no per-draft credits.
// ─────────────────────────────────────────────────────────────────────────────

interface RSSItem {
  guid:        string
  title:       string
  link:        string
  description: string
  pubDate:     string
}

function parseRSSFeed(xml: string): RSSItem[] {
  const items: RSSItem[] = []

  // Support both RSS 2.0 <item> and Atom <entry>
  const itemPattern = xml.includes('<item>') || xml.includes('<item ')
    ? /<item[^>]*>([\s\S]*?)<\/item>/g
    : /<entry[^>]*>([\s\S]*?)<\/entry>/g

  let m: RegExpExecArray | null
  while ((m = itemPattern.exec(xml)) !== null) {
    const block = m[1]

    const get = (tag: string, fallback = '') => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i')
      const match = block.match(r)
      return match ? match[1].trim() : fallback
    }

    // <link> can be text content or href attribute (Atom)
    let link = get('link')
    if (!link) {
      const linkHref = block.match(/<link[^>]+href="([^"]+)"/)
      if (linkHref) link = linkHref[1]
    }

    const guid = get('guid') || get('id') || link
    const title = get('title')
    const description = get('description') || get('summary') || get('content')
    const pubDate = get('pubDate') || get('published') || get('updated') || ''

    if (!title && !description) continue
    items.push({ guid, title, link, description: description.replace(/<[^>]+>/g, '').slice(0, 500), pubDate })
  }

  return items
}

export const captionAgent = inngest.createFunction(
  { id: 'caption-agent', name: 'Caption Agent', retries: 2 },
  { cron: '0 11 * * *' },
  async ({ step }) => {
    const admin = getSupabaseAdmin()
    const now   = new Date()
    const since = new Date(now.getTime() - 25 * 60 * 60 * 1000) // last 25h with overlap buffer

    const settings = await step.run('fetch-enabled-settings', async () => {
      const { data } = await admin
        .from('caption_agent_settings')
        .select('*')
        .eq('enabled', true)
      return data ?? []
    })

    if (!settings.length) return { processed: 0, drafted: 0 }

    let processed = 0
    let drafted   = 0

    for (const cfg of settings as any[]) {
      try {
        await step.run(`caption-${cfg.workspace_id}`, async () => {
          // Verify Agency plan
          const { data: ws } = await admin
            .from('workspaces')
            .select('plan')
            .eq('id', cfg.workspace_id)
            .single()

          if (!ws || !['agency', 'agency_annual'].includes(ws.plan ?? '')) return

          const feeds: Array<{ url: string; label: string }> = Array.isArray(cfg.feed_urls) ? cfg.feed_urls : []
          if (!feeds.length) return

          const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
          if (!apiKey) return

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

          const maxDrafts = cfg.max_per_day ?? 3
          const platforms: string[] = Array.isArray(cfg.platforms) ? cfg.platforms : []
          const toneHint  = cfg.tone_hint ? ` Write in this tone: ${cfg.tone_hint}.` : ''
          let draftsThisRun = 0

          for (const feed of feeds) {
            if (draftsThisRun >= maxDrafts) break

            try {
              const res = await fetch(feed.url, {
                headers: { 'User-Agent': 'SocialMate/1.0 RSS Bot (+https://socialmate.studio)' },
                signal: AbortSignal.timeout(10000),
              })
              if (!res.ok) continue
              const xml = await res.text()
              const items = parseRSSFeed(xml)

              // Filter to only items published since last run (or last 25h)
              const cutoff = cfg.last_ran_at ? new Date(cfg.last_ran_at) : since
              const newItems = items.filter(item => {
                if (!item.pubDate) return true // include if no date
                const d = new Date(item.pubDate)
                return !isNaN(d.getTime()) && d > cutoff
              })

              for (const item of newItems.slice(0, maxDrafts - draftsThisRun)) {
                if (draftsThisRun >= maxDrafts) break

                const context = [item.title, item.description].filter(Boolean).join('\n\n')
                if (!context.trim()) continue

                const prompt = `You are a social media content writer. Write a short, engaging social media post based on the following article.${toneHint}

Rules:
- Under 280 characters
- Engaging opener — no "Check out this article" or "I just read"
- Add 2-3 relevant hashtags at the end
- Sound human, not like a bot
- Include the link at the end: ${item.link || ''}

Article:
Title: ${item.title}
${item.description}

Return ONLY the post text, nothing else.`

                try {
                  const result = await model.generateContent(prompt)
                  const text   = result.response.text().trim()
                  if (!text) continue

                  await admin.from('posts').insert({
                    workspace_id: cfg.workspace_id,
                    user_id:      cfg.user_id,
                    content:      text,
                    platforms:    platforms,
                    status:       cfg.mode === 'auto' ? 'scheduled' : 'draft',
                    scheduled_at: cfg.mode === 'auto'
                      ? new Date(now.getTime() + (draftsThisRun + 1) * 2 * 60 * 60 * 1000).toISOString()
                      : null,
                  })

                  draftsThisRun++
                  drafted++
                } catch (genErr: any) {
                  console.error(`[CaptionAgent] Gemini error workspace ${cfg.workspace_id}:`, genErr?.message)
                }
              }
            } catch (feedErr: any) {
              console.error(`[CaptionAgent] feed fetch error ${feed.url}:`, feedErr?.message)
            }
          }

          await admin.from('caption_agent_settings')
            .update({ last_ran_at: now.toISOString() })
            .eq('workspace_id', cfg.workspace_id)

          if (draftsThisRun > 0 && cfg.mode === 'draft') {
            try {
              await admin.from('notifications').insert({
                user_id:    cfg.user_id,
                type:       'caption_drafts_ready',
                title:      '✍️ Caption drafts ready',
                body:       `${draftsThisRun} new post draft${draftsThisRun > 1 ? 's' : ''} generated from your RSS feeds.`,
                action_url: '/drafts',
                read:       false,
              })
            } catch {}
          }

          processed++
        })
      } catch (err: any) {
        console.error(`[CaptionAgent] workspace ${cfg.workspace_id}:`, err?.message)
      }
    }

    console.log(`[CaptionAgent] processed: ${processed}, drafted: ${drafted}`)
    return { processed, drafted }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Trend Scout Agent — every day at 7am UTC (Pro+)
// Analyzes competitor posts from the last 48h via Gemini and surfaces
// 5 trending content angles with a ready-to-use draft for each.
// ─────────────────────────────────────────────────────────────────────────────
export const trendScoutAgent = inngest.createFunction(
  { id: 'trend-scout-agent', name: 'Trend Scout Agent', retries: 2 },
  { cron: '0 7 * * *' },
  async ({ step }) => {
    const admin = getSupabaseAdmin()
    const now   = new Date()
    const since48h = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    const settings = await step.run('fetch-enabled-settings', async () => {
      const { data } = await admin
        .from('trend_scout_settings')
        .select('*')
        .eq('enabled', true)
      return data ?? []
    })

    if (!settings.length) return { processed: 0 }

    let processed = 0

    for (const cfg of settings as any[]) {
      try {
        await step.run(`trend-scout-${cfg.workspace_id}`, async () => {
          const { data: ws } = await admin
            .from('workspaces')
            .select('plan')
            .eq('id', cfg.workspace_id)
            .single()

          if (!ws || ws.plan === 'free') return

          const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
          if (!apiKey) return

          // Fetch competitor accounts + recent posts
          const { data: competitors } = await admin
            .from('competitor_accounts')
            .select('id, username, platform')
            .eq('workspace_id', cfg.workspace_id)

          const competitorIds = (competitors ?? []).map((c: any) => c.id)
          let postBlock = ''

          if (competitorIds.length > 0) {
            const { data: posts } = await admin
              .from('competitor_posts')
              .select('content, platform, engagement_score')
              .in('competitor_id', competitorIds)
              .gte('posted_at', since48h.toISOString())
              .order('engagement_score', { ascending: false })
              .limit(30)

            postBlock = (posts ?? [])
              .map((p: any) => `[${p.platform}] ${p.content?.slice(0, 200)}`)
              .join('\n')
          }

          // Also pull the user's own recent posts for context
          const { data: myPosts } = await admin
            .from('posts')
            .select('content, platforms')
            .eq('workspace_id', cfg.workspace_id)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(10)

          const myBlock = (myPosts ?? [])
            .map((p: any) => `[${(p.platforms ?? []).join('/')}] ${p.content?.slice(0, 150)}`)
            .join('\n')

          const prompt = `You are a social media trend analyst. Based on the content below, identify 5 distinct trending content angles a creator should post about today.

${postBlock ? `COMPETITOR POSTS (last 48h):\n${postBlock}\n\n` : ''}${myBlock ? `CREATOR'S RECENT POSTS:\n${myBlock}\n\n` : ''}

For each trend, return:
- topic: the specific subject or theme (max 6 words)
- why_now: brief reason it's relevant today (max 15 words)
- angle: the unique spin this creator should take (max 20 words)
- sample_caption: a ready-to-post caption under 280 chars with 2-3 hashtags

${postBlock ? '' : 'No competitor data yet — generate evergreen creator/business content angles instead.\n\n'}

Return ONLY valid JSON array:
[{"topic":"...","why_now":"...","angle":"...","sample_caption":"..."}]`

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

          const result = await model.generateContent(prompt)
          const text   = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

          let trends: any[] = []
          try { trends = JSON.parse(text) } catch { return }
          if (!Array.isArray(trends) || trends.length === 0) return

          await admin.from('trend_scout_results').insert({
            workspace_id: cfg.workspace_id,
            user_id:      cfg.user_id,
            trends,
          })

          await admin.from('trend_scout_settings')
            .update({ last_ran_at: now.toISOString() })
            .eq('workspace_id', cfg.workspace_id)

          try {
            await admin.from('notifications').insert({
              user_id:    cfg.user_id,
              type:       'trend_scout_ready',
              title:      '📈 Today\'s trends are in',
              body:       `${trends.length} content angles identified for today. Post while they\'re hot.`,
              action_url: '/agents/trend-scout',
              read:       false,
            })
          } catch {}

          processed++
        })
      } catch (err: any) {
        console.error(`[TrendScoutAgent] workspace ${cfg.workspace_id}:`, err?.message)
      }
    }

    console.log(`[TrendScoutAgent] processed: ${processed}`)
    return { processed }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Inbox Agent — every 2 hours (Pro+)
// Fetches unread Bluesky mentions for each enabled workspace, drafts smart
// replies via Gemini, stores them in inbox_reply_drafts for user review.
// ─────────────────────────────────────────────────────────────────────────────
export const inboxAgent = inngest.createFunction(
  { id: 'inbox-agent', name: 'Inbox Agent', retries: 1 },
  { cron: '0 */2 * * *' },
  async ({ step }) => {
    const admin = getSupabaseAdmin()
    const now   = new Date()

    const settings = await step.run('fetch-enabled-settings', async () => {
      const { data } = await admin
        .from('inbox_agent_settings')
        .select('*')
        .eq('enabled', true)
      return data ?? []
    })

    if (!settings.length) return { processed: 0, drafted: 0 }

    let processed = 0
    let drafted   = 0

    for (const cfg of settings as any[]) {
      try {
        await step.run(`inbox-agent-${cfg.workspace_id}`, async () => {
          const { data: ws } = await admin
            .from('workspaces')
            .select('plan')
            .eq('id', cfg.workspace_id)
            .single()

          if (!ws || ws.plan === 'free') return

          const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
          if (!apiKey) return

          // Get Bluesky connected account for this user
          const { data: account } = await admin
            .from('connected_accounts')
            .select('access_token, refresh_token, platform_user_id')
            .eq('user_id', cfg.user_id)
            .eq('platform', 'bluesky')
            .maybeSingle()

          if (!account) return

          // Refresh token
          let accessJwt = account.access_token
          try {
            const refreshRes = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
              method: 'POST',
              headers: { Authorization: `Bearer ${account.refresh_token}` },
            })
            if (refreshRes.ok) {
              const session = await refreshRes.json()
              accessJwt = session.accessJwt
              await admin
                .from('connected_accounts')
                .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
                .eq('user_id', cfg.user_id)
                .eq('platform', 'bluesky')
            }
          } catch {}

          // Fetch notifications
          const notifRes = await fetch(
            'https://bsky.social/xrpc/app.bsky.notification.listNotifications?limit=20',
            { headers: { Authorization: `Bearer ${accessJwt}` } }
          )
          if (!notifRes.ok) return

          const { notifications } = await notifRes.json()
          const mentions = (notifications ?? []).filter(
            (n: any) => ['mention', 'reply'].includes(n.reason) && !n.isRead
          )

          if (!mentions.length) return

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
          const toneHint = cfg.tone_hint ? ` Tone: ${cfg.tone_hint}.` : ''

          for (const n of mentions.slice(0, 5)) {
            const mentionId   = n.uri
            const mentionText = n.record?.text ?? ''
            const author      = n.author?.handle ? `@${n.author.handle}` : 'someone'
            const postUrl     = n.uri
              ? `https://bsky.app/profile/${n.author?.handle}/post/${n.uri.split('/').pop()}`
              : null

            // Skip if already drafted
            const { data: existing } = await admin
              .from('inbox_reply_drafts')
              .select('id')
              .eq('workspace_id', cfg.workspace_id)
              .eq('platform', 'bluesky')
              .eq('mention_id', mentionId)
              .maybeSingle()

            if (existing) continue
            if (!mentionText.trim()) continue

            try {
              const prompt = `Write a short, genuine reply to this social media mention.${toneHint}

From: ${author}
Message: "${mentionText}"

Rules:
- Under 250 characters
- Natural and human — not corporate
- Don't start with "Great question!" or "Thanks for reaching out"
- If it's a question, answer it. If it's a comment, engage with it.

Return ONLY the reply text, nothing else.`

              const result = await model.generateContent(prompt)
              const reply  = result.response.text().trim()
              if (!reply) continue

              // Build reply metadata for Bluesky threading
              const replyMeta: Record<string, string> = {
                parent_uri: n.uri,
                parent_cid: n.cid,
                root_uri:   n.record?.reply?.root?.uri ?? n.uri,
                root_cid:   n.record?.reply?.root?.cid ?? n.cid,
              }

              await admin.from('inbox_reply_drafts').insert({
                workspace_id:    cfg.workspace_id,
                user_id:         cfg.user_id,
                platform:        'bluesky',
                mention_id:      mentionId,
                mention_text:    mentionText.slice(0, 500),
                mention_author:  author,
                mention_url:     postUrl,
                suggested_reply: reply,
                reply_metadata:  replyMeta,
                status:          'pending',
              })

              drafted++
            } catch (genErr: any) {
              console.error(`[InboxAgent] Gemini error:`, genErr?.message)
            }
          }

          await admin.from('inbox_agent_settings')
            .update({ last_ran_at: now.toISOString() })
            .eq('workspace_id', cfg.workspace_id)

          if (drafted > 0) {
            try {
              await admin.from('notifications').insert({
                user_id:    cfg.user_id,
                type:       'inbox_replies_ready',
                title:      '💬 Reply drafts ready',
                body:       `${drafted} reply suggestion${drafted > 1 ? 's' : ''} waiting for your review.`,
                action_url: '/agents/inbox-agent',
                read:       false,
              })
            } catch {}
          }

          processed++
        })
      } catch (err: any) {
        console.error(`[InboxAgent] workspace ${cfg.workspace_id}:`, err?.message)
      }
    }

    console.log(`[InboxAgent] processed: ${processed}, drafted: ${drafted}`)
    return { processed, drafted }
  }
)
