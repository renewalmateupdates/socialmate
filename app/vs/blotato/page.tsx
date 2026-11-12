import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'
import { PLAN_ACCOUNTS_PER_PLATFORM } from '@/lib/plan'

// Blotato facts checked Nov 12, 2026 against blotato.com/pricing.md (its
// machine-readable rate card, "Effective as of 2026-09-10"). Re-check before
// changing a number.
export default function VsBlotatoPage() {
  return (
    <VsComparison
      competitor="Blotato"
      checked="Blotato facts checked against blotato.com/pricing.md on Nov 12, 2026."
      intro="Blotato starts at $29 a month for 20 accounts after a 7-day trial that needs a card, with AI image and video generation and 9 platforms including Instagram and YouTube. SocialMate is free to start, $8 a month for Pro, and posts to Discord, Telegram and Mastodon."
      them={{
        title: 'AI images and video, 9 platforms, from $29/month',
        points: [
          '✅ 9 platforms, including Instagram, Facebook, Threads, Pinterest and YouTube',
          '✅ AI image and video generation (1,250 credits a month on Starter)',
          '✅ REST API, MCP, n8n and Make on paid plans',
          '❌ No free plan: a 7-day trial with a card, then $29/month',
          '❌ No Discord, Telegram or Mastodon',
          '❌ Starter holds 200 scheduled posts at a time',
        ],
      }}
      us={{ title: 'Free to start, with Discord, Telegram and Mastodon', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest paid plan',           them: '$29/mo Starter, 20 accounts',               us: `$${SM.proPrice}/mo Pro ($${SM.proAnnual}/yr)` },
        { feature: 'Free option',                  them: '7-day trial, card required',                us: `Free plan: ${SM.freePosts} posts a month, no card` },
        { feature: 'Higher plans',                 them: '$97/mo Creator (40 accounts), $499/mo Agency (100)', us: `$${SM.agencyPrice}/mo Agency, ${PLAN_ACCOUNTS_PER_PLATFORM.agency} accounts per platform` },
        { feature: 'Posting volume',               them: 'No monthly cap; 200 queued at once on Starter', us: `${SM.freePosts} Free, ${SM.proPosts.toLocaleString('en-US')} Pro, ${SM.agencyPosts.toLocaleString('en-US')} Agency a month` },
        { feature: 'Instagram, Facebook, YouTube, Threads, Pinterest', them: '✅',                     us: '❌ Not yet' },
        { feature: 'TikTok, LinkedIn, X, Bluesky', them: '✅',                                        us: '✅ (X on Pro and up)' },
        { feature: 'Discord, Telegram, Mastodon',  them: '❌',                                        us: '✅' },
        { feature: 'AI',                           them: 'AI image and video generation',             us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
        { feature: 'Team seats',                   them: 'Not listed',                                us: `${SM.freeSeats} Free, ${SM.proSeats} Pro, ${SM.agencySeats} Agency` },
        { feature: 'Public API',                   them: '✅ REST API and MCP',                        us: '❌ Not yet' },
      ]}
      theyWin={[
        'You need Instagram, Facebook, Threads, Pinterest or YouTube. Blotato posts to all of them; SocialMate does not yet.',
        'You want AI to make images and videos, not just write captions.',
        'You build automations with an API, MCP, n8n or Make.',
        'You schedule months ahead: Starter queues up to 9 months out.',
      ]}
      weWin={[
        { title: 'Start without a card', desc: `Blotato's trial needs a card and ends after 7 days. SocialMate's free plan is ${SM.freePosts} posts a month with no card and no clock.` },
        { title: 'Discord, Telegram and Mastodon', desc: 'Blotato lists 9 platforms and none of these three. SocialMate schedules community announcements to Discord and Telegram, and posts to Mastodon.' },
        { title: 'A small team on a small budget', desc: `SocialMate Pro is $${SM.proPrice} a month with ${SM.proSeats} seats and ${PLAN_ACCOUNTS_PER_PLATFORM.pro} accounts per platform. Agency is $${SM.agencyPrice} with ${SM.agencySeats} seats.` },
      ]}
      faq={[
        { q: 'Does Blotato have a free plan?', a: 'No. Blotato offers a 7-day trial that needs a card, then Starter at $29 a month, Creator at $97 or Agency at $499. Yearly billing saves about 17%.' },
        { q: 'Which is cheaper, Blotato or SocialMate?', a: `SocialMate. Its free plan covers ${SM.freePosts} posts a month, and Pro is $${SM.proPrice} a month. Blotato starts at $29 a month.` },
        { q: 'Can SocialMate make AI images and videos like Blotato?', a: 'No. SocialMate\'s AI writes captions, hooks, threads and hashtags. Blotato\'s AI credits are for images and video.' },
        { q: 'Does SocialMate post to Instagram or YouTube?', a: `Not yet. SocialMate posts to ${SM.livePlatforms.join(', ')}.` },
      ]}
      closing={{ title: 'No card. No trial clock.', body: `${SM.freePosts} posts a month on 7 platforms, including Discord and Telegram, free.` }}
    />
  )
}
