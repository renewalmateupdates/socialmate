import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'
import { PLAN_ACCOUNTS_PER_PLATFORM } from '@/lib/plan'

// Post Bridge facts checked Nov 12, 2026 against post-bridge.com/pricing and
// post-bridge.com/social-media-scheduler. Its FAQ mentions "5 for free users"
// while the scheduler page says it is not free and offers a 7-day trial; this
// page goes with the pricing cards (trial, then paid). Re-check before changing
// a number.
export default function VsPostBridgePage() {
  return (
    <VsComparison
      competitor="Post Bridge"
      checked="Post Bridge facts checked against post-bridge.com/pricing and its scheduler page on Nov 12, 2026."
      intro="Post Bridge starts at $39 a month for 15 accounts after a 7-day trial, and posts to 10 platforms including Instagram and YouTube. SocialMate is free to start, $8 a month for Pro, and posts to Discord, Telegram and Mastodon."
      them={{
        title: 'Unlimited posts to 10 platforms, from $39/month',
        points: [
          '✅ 10 platforms, including Instagram, Facebook, YouTube, Threads, Pinterest and Google Business',
          '✅ Unlimited posts on paid plans',
          '✅ API and MCP included on paid plans',
          '❌ No free plan on its pricing page: a 7-day trial, then $39/month',
          '❌ No Discord, Telegram or Mastodon',
          '❌ Team members only on Operator ($99/month)',
        ],
      }}
      us={{ title: 'Free to start, with Discord, Telegram and Mastodon', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest paid plan',            them: '$39/mo Marketer, 15 accounts',                 us: `$${SM.proPrice}/mo Pro ($${SM.proAnnual}/yr)` },
        { feature: 'Free option',                   them: '7-day free trial',                             us: `Free plan: ${SM.freePosts} posts a month, no card` },
        { feature: 'Accounts',                      them: '15 on Marketer; 99 on Operator ($99/mo), then $1 each', us: `${PLAN_ACCOUNTS_PER_PLATFORM.pro} per platform on Pro, ${PLAN_ACCOUNTS_PER_PLATFORM.agency} on Agency` },
        { feature: 'Posts per month',               them: 'Unlimited on paid plans',                      us: `${SM.freePosts} Free, ${SM.proPosts.toLocaleString('en-US')} Pro, ${SM.agencyPosts.toLocaleString('en-US')} Agency` },
        { feature: 'Team members',                  them: 'Operator plan only',                           us: `${SM.freeSeats} seats Free, ${SM.proSeats} Pro, ${SM.agencySeats} Agency` },
        { feature: 'Approval before posting',       them: 'Not offered (built for one person)',           us: 'Pro and Agency: teammates draft, the owner approves' },
        { feature: 'Instagram, Facebook, YouTube, Threads, Pinterest', them: '✅',                        us: '❌ Not yet' },
        { feature: 'TikTok, LinkedIn, X, Bluesky',  them: '✅',                                           us: '✅ (X on Pro and up)' },
        { feature: 'Discord, Telegram, Mastodon',   them: '❌',                                           us: '✅' },
        { feature: 'AI writing',                    them: 'Not listed',                                   us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
        { feature: 'Public API',                    them: '✅ Included, plus MCP',                         us: '❌ Not yet' },
      ]}
      theyWin={[
        'You post to Instagram, Facebook, YouTube, Threads, Pinterest or Google Business. Post Bridge covers them; SocialMate does not yet.',
        'You post a lot: Post Bridge says its paid plans have no post cap.',
        'You run many accounts: Operator covers 99, then $1 per account.',
        'You build automations on an API or MCP.',
      ]}
      weWin={[
        { title: 'Start free, stay cheap', desc: `Post Bridge has no free plan on its pricing page: a 7-day trial, then $39 a month. SocialMate's free plan is ${SM.freePosts} posts a month with no card, and Pro is $${SM.proPrice}.` },
        { title: 'Discord, Telegram and Mastodon', desc: 'If your community lives in a Discord server or a Telegram channel, SocialMate schedules to both, plus Mastodon. Post Bridge lists none of the three.' },
        { title: 'A small team for $8', desc: `Post Bridge adds team members on Operator, $99 a month. SocialMate Pro has ${SM.proSeats} seats for $${SM.proPrice}, and teammates' posts can wait for your approval.` },
      ]}
      faq={[
        { q: 'Is Post Bridge free?', a: 'Its pricing page offers a 7-day free trial, then Marketer at $39 a month for 15 accounts or Operator at $99 a month for 99 accounts. Yearly billing gives 2 months free.' },
        { q: 'Which is cheaper, Post Bridge or SocialMate?', a: `SocialMate. Its free plan covers ${SM.freePosts} posts a month, and Pro is $${SM.proPrice} a month with ${PLAN_ACCOUNTS_PER_PLATFORM.pro} accounts per platform. Post Bridge starts at $39 a month after its trial.` },
        { q: 'Does SocialMate post to Instagram like Post Bridge?', a: `No. SocialMate posts to ${SM.livePlatforms.join(', ')}. If Instagram, Facebook or YouTube is your main channel, Post Bridge is the better fit today.` },
        { q: 'Does SocialMate have an API?', a: 'Not yet. Post Bridge includes an API and an MCP server on its paid plans.' },
      ]}
      closing={{ title: 'Try it before you pay anything.', body: `${SM.freePosts} posts a month on 7 platforms, including Discord and Telegram. No card, no trial clock.` }}
    />
  )
}
