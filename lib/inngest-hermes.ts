import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dispatchHermesMessage, type HermesChannel } from '@/lib/hermes-send'

const STEP_LABELS = ['Intro', 'Follow-up 1', 'Follow-up 2', 'Break-up']

// Generates a message body via Gemini for a follow-up step
async function generateFollowUp(params: {
  campaignName: string
  goal: string | null
  personaDescription: string | null
  prospectName: string
  prospectCompany: string | null
  prospectNotes: string | null
  channel: HermesChannel
  step: number
}): Promise<{ subject: string | null; body: string }> {
  const { step, channel } = params
  const stepLabel = STEP_LABELS[step] ?? `Step ${step + 1}`
  const isEmail   = channel === 'email'
  const charLimit = channel === 'bluesky' ? 300 : channel === 'mastodon' ? 500 : 9999

  const prompt = `You are HERMES, a cold outreach assistant. Write a ${stepLabel} outreach message.

Campaign: ${params.campaignName}
Goal: ${params.goal ?? 'not specified'}
Target persona: ${params.personaDescription ?? 'not specified'}
Channel: ${channel}${isEmail ? '' : ` (max ${charLimit} characters, plain text only, no subject)`}

Prospect:
- Name: ${params.prospectName}
${params.prospectCompany ? `- Company: ${params.prospectCompany}` : ''}
${params.prospectNotes ? `- Notes: ${params.prospectNotes}` : ''}

Instructions:
- Sender is Joshua Bostic, solo founder of SocialMate (socialmate.studio).
- ${step === 1 ? 'This is follow-up 1. Brief reference to prior outreach, add a new angle.' : ''}
- ${step === 2 ? 'This is the last follow-up. Short, gracious, leave the door open.' : ''}
- ${step === 3 ? 'Break-up message. Brief, no hard feelings.' : ''}
- Write like a human. No buzzwords. No "I hope this finds you well."
- Output JSON only: { "subject": "...", "body": "..." }
- If not email, set subject to null.
${!isEmail ? `- body must be under ${charLimit} characters.` : ''}
`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(jsonStr)
    return { subject: isEmail ? (parsed.subject ?? null) : null, body: parsed.body ?? '' }
  } catch {
    return {
      subject: isEmail ? `${stepLabel} — ${params.campaignName}` : null,
      body: `Hi ${params.prospectName}, just following up on my previous message. Would love to connect. — Joshua`,
    }
  }
}

// Daily 9am UTC: find prospects due for follow-up and either draft or auto-send
export const hermesFollowUpCron = inngest.createFunction(
  { id: 'hermes-follow-up-cron', name: 'HERMES: Daily Follow-up Cron' },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    const supabase = getSupabaseAdmin()

    // Find all prospects past their next_contact_at with active campaigns
    const prospects = await step.run('load-due-prospects', async () => {
      const { data } = await supabase
        .from('hermes_prospects')
        .select(`
          id, user_id, campaign_id, name, company, notes, status, sequence_step,
          email, bluesky_handle, mastodon_handle,
          hermes_campaigns!inner(id, name, goal, persona_description, channels, sequence_days, mode, status)
        `)
        .eq('status', 'contacted')
        .lte('next_contact_at', new Date().toISOString())
        .eq('hermes_campaigns.status', 'active')
      return data ?? []
    })

    if (!prospects || prospects.length === 0) return { processed: 0 }

    let processed = 0

    for (const prospect of prospects) {
      const campaign = prospect.hermes_campaigns as unknown as {
        id: string; name: string; goal: string | null; persona_description: string | null
        channels: string[]; sequence_days: number[]; mode: string; status: string
      }

      const step_num = prospect.sequence_step ?? 1
      if (step_num >= 4) continue  // Max 4 steps

      const channel: HermesChannel = (campaign.channels?.[0] ?? 'email') as HermesChannel

      await step.run(`process-prospect-${prospect.id}`, async () => {
        const { subject, body } = await generateFollowUp({
          campaignName: campaign.name,
          goal: campaign.goal,
          personaDescription: campaign.persona_description,
          prospectName: prospect.name,
          prospectCompany: prospect.company,
          prospectNotes: prospect.notes,
          channel,
          step: step_num,
        })

        if (campaign.mode === 'draft') {
          // Save as draft only
          await supabase.from('hermes_messages').insert({
            campaign_id: campaign.id,
            prospect_id: prospect.id,
            user_id: prospect.user_id,
            channel,
            subject,
            body,
            step: step_num,
            status: 'draft',
          })
          // Advance next_contact_at to avoid re-drafting same step
          const nextDays = campaign.sequence_days?.[step_num + 1]
          const nextContactAt = nextDays != null
            ? new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString()
            : null
          await supabase
            .from('hermes_prospects')
            .update({ next_contact_at: nextContactAt })
            .eq('id', prospect.id)
        } else {
          // Auto-send mode: insert + dispatch immediately
          const { data: msg } = await supabase
            .from('hermes_messages')
            .insert({
              campaign_id: campaign.id,
              prospect_id: prospect.id,
              user_id: prospect.user_id,
              channel,
              subject,
              body,
              step: step_num,
              status: 'draft',
            })
            .select()
            .single()

          if (msg) {
            await dispatchHermesMessage({
              messageId: msg.id,
              channel,
              userId: prospect.user_id,
              prospectEmail: prospect.email,
              prospectBlueskyHandle: prospect.bluesky_handle,
              prospectMastodonHandle: prospect.mastodon_handle,
              subject,
              body,
            })

            const nextStep = step_num + 1
            const nextDays = campaign.sequence_days?.[nextStep]
            const nextContactAt = nextDays != null
              ? new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString()
              : null
            await supabase
              .from('hermes_prospects')
              .update({ sequence_step: nextStep, last_contacted_at: new Date().toISOString(), next_contact_at: nextContactAt })
              .eq('id', prospect.id)
          }
        }
      })

      processed++
    }

    return { processed }
  }
)

const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const EMAIL_BLOCK_DOMAINS = ['substack.com', 'example.com', 'sentry.io', 'amazonaws.com', 'cloudflare.com', 'google.com', 'wix.com']

function isValidContactEmail(email: string): boolean {
  const lower = email.toLowerCase()
  const domain = lower.split('@')[1] ?? ''
  if (EMAIL_BLOCK_DOMAINS.some(d => domain.includes(d))) return false
  if (lower.startsWith('noreply') || lower.startsWith('no-reply') || lower.startsWith('donotreply')) return false
  if (lower.split('@')[0].length < 2) return false
  return true
}

function extractEmailsFromHtml(html: string): string[] {
  const mailtoHits = Array.from(html.matchAll(/href="mailto:([^"?&\s]+)/gi))
    .map(m => m[1].toLowerCase().trim())
    .filter(isValidContactEmail)
  if (mailtoHits.length > 0) return Array.from(new Set(mailtoHits))
  const found = new Set(
    (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [])
      .map(e => e.toLowerCase()).filter(isValidContactEmail)
  )
  return Array.from(found)
}

async function findEmailForNewsletter(subdomain: string, customDomain?: string | null): Promise<string | null> {
  const headers = { 'User-Agent': BOT_UA }
  try {
    const res = await fetch(`https://${subdomain}.substack.com/api/v1/pub`, { headers, signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      if (data?.contact_email && isValidContactEmail(data.contact_email)) return data.contact_email.toLowerCase()
      if (data?.author?.email && isValidContactEmail(data.author.email)) return data.author.email.toLowerCase()
    }
  } catch { /* continue */ }
  const pages = [
    `https://${subdomain}.substack.com/about`,
    customDomain ? `https://${customDomain}/about` : null,
    customDomain ? `https://${customDomain}/contact` : null,
    customDomain ? `https://${customDomain}` : null,
  ].filter(Boolean) as string[]
  for (const url of pages) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const emails = extractEmailsFromHtml(await res.text())
      if (emails.length > 0) return emails[0]
    } catch { /* try next */ }
  }
  return null
}

// Weekly Monday 10am UTC: auto-discover + send for campaigns with auto_discover_enabled
export const hermesAutoDiscoverCron = inngest.createFunction(
  { id: 'hermes-auto-discover-cron', name: 'HERMES: Weekly Auto-Discover' },
  { cron: '0 10 * * 1' },
  async ({ step }) => {
    const supabase = getSupabaseAdmin()

    const campaigns = await step.run('load-auto-discover-campaigns', async () => {
      const { data } = await supabase
        .from('hermes_campaigns')
        .select('*')
        .eq('auto_discover_enabled', true)
        .eq('status', 'active')
        .not('apollo_query', 'is', null)
      return data ?? []
    })

    if (!campaigns || campaigns.length === 0) return { ran: 0 }

    let totalImported = 0
    let totalSent     = 0

    for (const campaign of campaigns) {
      await step.run(`discover-campaign-${campaign.id}`, async () => {
        const perPage  = Math.min(campaign.prospects_per_run ?? 10, 25)
        const category = (campaign.apollo_query ?? 'technology').toLowerCase()

        // Substack leaderboard discovery (free, no API key needed)
        const substackRes = await fetch(
          `https://substack.com/api/v1/leaderboard?category=${encodeURIComponent(category)}&limit=${perPage * 2}&page=0`,
          { headers: { 'User-Agent': BOT_UA } }
        )
        if (!substackRes.ok) return

        const publications: Array<{ name: string; subdomain: string; custom_domain?: string | null; author_name?: string | null }>
          = (await substackRes.json()).publications ?? []
        if (publications.length === 0) return

        // Dedup
        const { data: existingProspects } = await supabase
          .from('hermes_prospects').select('email, notes').eq('campaign_id', campaign.id)
        const existingEmails = new Set((existingProspects ?? []).map((r: { email: string }) => r.email?.toLowerCase()).filter(Boolean))
        const existingSubdomains = new Set(
          (existingProspects ?? []).map((r: { notes: string }) => r.notes?.match(/substack\.com\/([^/\s,]+)/)?.[1]).filter(Boolean)
        )
        const newPubs = publications.filter(p => !existingSubdomains.has(p.subdomain))

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        for (const pub of newPubs.slice(0, perPage)) {
          const email = await findEmailForNewsletter(pub.subdomain, pub.custom_domain)
          if (!email || existingEmails.has(email)) continue

          const prospectName = pub.author_name || pub.name
          const prompt = `Write a short cold email intro from Joshua Bostic, founder of SocialMate (socialmate.studio). Goal: ${campaign.goal ?? 'get featured in their newsletter/blog'}. Prospect: ${prospectName}, runs "${pub.name}" newsletter. Keep it 3-4 sentences, human, no buzzwords. Output JSON: {"subject":"...","body":"..."}`

          let subject = `Quick note — SocialMate`
          let body    = `Hi ${prospectName},\n\nI built SocialMate (socialmate.studio) solo — a social media scheduler + AI toolkit for $5/mo vs competitors at $99. I work a deli job nights and weekends to build this.\n\nWould you consider a mention or feature in your newsletter?\n\n— Joshua`

          try {
            const result = await model.generateContent(prompt)
            const raw    = result.response.text().trim()
            const json   = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
            const parsed = JSON.parse(json)
            subject = parsed.subject ?? subject
            body    = parsed.body ?? body
          } catch { /* fallback already set */ }

          const { data: prospect } = await supabase
            .from('hermes_prospects')
            .insert({ campaign_id: campaign.id, user_id: campaign.user_id, name: prospectName, email, company: pub.name, notes: `substack.com/${pub.subdomain}` })
            .select().single()
          if (!prospect) continue

          const { data: message } = await supabase
            .from('hermes_messages')
            .insert({ campaign_id: campaign.id, prospect_id: prospect.id, user_id: campaign.user_id, channel: 'email', subject, body, step: 0, status: 'draft' })
            .select().single()
          if (!message) continue

          totalImported++
          existingEmails.add(email)

          if (campaign.mode === 'auto') {
            const result = await dispatchHermesMessage({ messageId: message.id, channel: 'email', userId: campaign.user_id, prospectEmail: email, subject, body })
            if (result.ok) {
              totalSent++
              const nextDays = campaign.sequence_days?.[1]
              const nextContactAt = nextDays != null ? new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString() : null
              await supabase.from('hermes_prospects').update({ status: 'contacted', sequence_step: 1, last_contacted_at: new Date().toISOString(), next_contact_at: nextContactAt }).eq('id', prospect.id)
            }
          }
        }
      })
    }

    return { ran: campaigns.length, imported: totalImported, sent: totalSent }
  }
)
