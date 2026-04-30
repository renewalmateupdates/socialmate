import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

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
