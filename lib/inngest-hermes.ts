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
