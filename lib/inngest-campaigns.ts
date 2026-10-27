import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { topUpCampaign, type CampaignRow } from '@/lib/campaign-run'

// Once a day, make the next week of posts for every running campaign.
//
// Campaigns make their posts a week ahead (lib/campaign-run.ts), so a daily run
// is plenty: each run only adds the day that just came into the window. One
// step per campaign keeps one failing campaign from stopping the rest, and the
// whole job is a handful of steps a day against the Inngest plan's budget.
export const campaignTopUp = inngest.createFunction(
  { id: 'campaign-top-up', name: 'Campaign Top-Up', retries: 1 },
  { cron: '20 6 * * *' },
  async ({ step }) => {
    const campaigns = await step.run('find-active', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .limit(500)
      if (error) throw new Error(`active campaigns lookup failed: ${error.message}`)
      return (data ?? []) as CampaignRow[]
    })

    let created = 0
    for (const c of campaigns) {
      const result = await step.run(`top-up-${c.id}`, async () =>
        topUpCampaign(getSupabaseAdmin(), c, new Date(), async items => {
          if (items.length) await inngest.send(items.map(p => ({ name: 'post/scheduled', data: p })))
        }),
      )
      created += result.created
    }
    return { campaigns: campaigns.length, created }
  },
)
