import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Supergrow facts checked Nov 12, 2026 against supergrow.ai/pricing. The page
// names no platform other than LinkedIn. Re-check before changing a number.
export default function VsSupergrowPage() {
  return (
    <VsComparison
      competitor="Supergrow"
      checked="Supergrow facts checked against supergrow.ai/pricing on Nov 12, 2026."
      intro="Supergrow is built for LinkedIn: $39 a month for one account after a 7-day trial ($31 billed yearly), with AI that learns your voice. SocialMate schedules LinkedIn plus 6 other platforms, free to start, Pro $8."
      them={{
        title: 'Deep LinkedIn AI, from $39/month',
        points: [
          '✅ AI that learns your voice, AI interviews, carousels',
          '✅ Auto first comment when you schedule',
          '✅ Approval workflows on Teams',
          '❌ No free plan: a 7-day trial, then $39/month',
          '❌ LinkedIn only',
          '❌ Teams is $199/month for 5 accounts',
        ],
      }}
      us={{ title: 'LinkedIn plus 6 platforms, free to start', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest paid plan',       them: '$39/mo Pro ($31/mo billed yearly), 1 account', us: `$${SM.proPrice}/mo Pro ($${SM.proAnnual}/yr)` },
        { feature: 'Free option',              them: '7-day free trial',                            us: `Free plan: ${SM.freePosts} posts a month, no card` },
        { feature: 'Teams',                    them: '$199/mo for 5 accounts',                      us: `$${SM.agencyPrice}/mo Agency, ${SM.agencySeats} seats` },
        { feature: 'Platforms',                them: 'LinkedIn',                                    us: SM.livePlatforms.join(', ') },
        { feature: 'Auto first comment',       them: '✅',                                          us: '❌ Not yet' },
        { feature: 'Approval before posting',  them: 'Teams plan',                                  us: 'Pro and Agency' },
        { feature: 'AI',                       them: 'Voice learning, AI interviews, repurposing, carousels', us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
        { feature: 'Free LinkedIn formatter',  them: 'Not listed',                                  us: '✅ No signup needed' },
      ]}
      theyWin={[
        'LinkedIn is your only channel and you want AI built around it: voice learning, interviews that turn into posts, carousels.',
        'You want the first comment scheduled with the post. SocialMate does not do that yet.',
        'You ghostwrite for executives and want an organization dashboard and Slack notifications (Teams).',
      ]}
      weWin={[
        { title: 'More than LinkedIn', desc: 'Post the same update to LinkedIn, X, Bluesky, Mastodon, Discord and Telegram at once, and TikTok video from TikTok Studio.' },
        { title: 'Free, then $8', desc: `Supergrow has no free plan and starts at $39 a month for one account. SocialMate's free plan covers ${SM.freePosts} posts a month, and Pro is $${SM.proPrice} with ${SM.proSeats} seats.` },
        { title: 'A team for $29', desc: `Supergrow Teams is $199 a month for 5 accounts. SocialMate Agency is $${SM.agencyPrice} a month with ${SM.agencySeats} seats and 5 client workspaces.` },
      ]}
      faq={[
        { q: 'Does Supergrow have a free plan?', a: 'No. Every plan starts with a 7-day trial: Pro is $39 a month ($31 billed yearly) for one account, Teams is $199 a month for 5.' },
        { q: 'Is SocialMate a LinkedIn scheduler?', a: 'Yes, for personal profiles, alongside X, TikTok, Bluesky, Mastodon, Discord and Telegram. LinkedIn company pages are not available yet.' },
        { q: 'Which is better for a LinkedIn ghostwriter?', a: `If LinkedIn is all you do and you want AI tuned to it, Supergrow. If your clients post on other platforms too, or you want to start free, SocialMate: Pro is $${SM.proPrice} with ${SM.proSeats} seats.` },
      ]}
      closing={{ title: 'LinkedIn and everywhere else.', body: `${SM.freePosts} posts a month on 7 platforms, free. Pro is $${SM.proPrice} a month.` }}
    />
  )
}
