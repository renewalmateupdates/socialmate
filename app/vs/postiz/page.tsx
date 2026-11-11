import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Postiz facts checked Nov 11, 2026 against postiz.com/pricing, postiz.com and
// the README at github.com/gitroomhq/postiz-app. Prices and limits are as
// Postiz states them; re-check before changing a number.
export default function VsPostizPage() {
  return (
    <VsComparison
      competitor="Postiz"
      checked="Postiz facts checked against postiz.com/pricing, postiz.com and its GitHub README on Nov 11, 2026."
      intro="Postiz is open source: free to run on your own server, or $29 a month and up hosted. SocialMate is hosted and free to start, with nothing to install."
      them={{
        title: 'Open source, 30+ channels, no free hosted plan',
        points: [
          '✅ Free to self-host (AGPL-3.0)',
          '✅ 30+ channels, including Instagram, Facebook, Threads and YouTube',
          '✅ Public API, webhooks and MCP',
          '❌ Hosted plans start at $29/month after a 7-day trial',
          '❌ Self-hosting means running Postgres, Redis and Temporal yourself',
          '❌ The cheapest hosted plan has no team members',
        ],
      }}
      us={{ title: 'Hosted, free to start, nothing to install', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest hosted plan',             them: '$29/mo Standard ($23/mo billed yearly)',                  us: `$0 Free, or $${SM.proPrice}/mo Pro` },
        { feature: 'Free option',                      them: 'Self-host it yourself, or a 7-day trial',                 us: 'Free plan, no card, nothing to install' },
        { feature: 'Running it yourself',              them: 'Your own server, Postgres, Redis, Temporal and storage',  us: 'Not needed: SocialMate runs it' },
        { feature: 'Network approvals',                them: 'Self-hosters get their own developer app approved on each network', us: 'Already approved, including TikTok Direct Post' },
        { feature: 'Posts per month',                  them: 'Unlimited on hosted plans',                               us: `${SM.freePosts} Free, ${SM.proPosts.toLocaleString('en-US')} Pro, ${SM.agencyPosts.toLocaleString('en-US')} Agency` },
        { feature: 'Channels, cheapest paid plan',     them: '5',                                                       us: `${SM.proAccounts} per platform (Pro)` },
        { feature: 'Team members, cheapest paid plan', them: 'None (a solo plan)',                                      us: `${SM.proSeats} seats on Pro, ${SM.freeSeats} on Free` },
        { feature: 'Instagram, Facebook, Threads, YouTube, Pinterest', them: '✅',                                      us: '❌ Not yet' },
        { feature: 'TikTok, LinkedIn, X, Bluesky, Mastodon', them: '✅',                                                us: '✅ (X on Pro and up)' },
        { feature: 'Discord and Telegram',             them: '✅',                                                      us: '✅' },
        { feature: 'AI',                               them: 'Copilot on all plans; AI images and video by plan (self-hosted: your own keys)', us: `15+ AI writing tools; ${SM.freeCredits} credits/month free, ${SM.proCredits} on Pro` },
      ]}
      theyWin={[
        'You need Instagram, Facebook, Threads, YouTube, Pinterest or Reddit. Postiz posts to all of them; SocialMate does not yet.',
        'You want it on your own server with your own data, and you are comfortable maintaining Postgres, Redis and Temporal.',
        'You post a lot: Postiz says its hosted plans have no post cap.',
        'You build automations on a public API, webhooks or MCP.',
      ]}
      weWin={[
        { title: 'Start free without a server', desc: `Postiz's free option is self-hosting: a server, a database, Redis, Temporal, and a developer app of your own on each network, some of which Postiz says take weeks to approve. SocialMate's free plan is a signup: ${SM.freePosts} posts a month, no card.` },
        { title: 'A small team on a small budget', desc: `Postiz Standard is $29 a month for one person, and Team is $39. SocialMate Pro is $${SM.proPrice} a month with ${SM.proSeats} seats, and Agency is $${SM.agencyPrice} with ${SM.agencySeats}.` },
        { title: 'TikTok without your own app review', desc: `TikTok approved SocialMate's Direct Post audit in October 2026, so videos post publicly from TikTok Studio, ${SM.freeTikTok} a month on the free plan. Self-hosting means taking your own TikTok app through that review.` },
      ]}
      faq={[
        { q: 'Is Postiz free?', a: `The software is free to self-host under the AGPL-3.0 license. You pay for your own server, run Postgres, Redis and Temporal, and Postiz says you need your own approved developer app on each network. The hosted version starts at $29 a month after a 7-day trial. SocialMate's free plan is hosted: ${SM.freePosts} posts a month, no card.` },
        { q: 'Does Postiz support more platforms than SocialMate?', a: 'Yes. Postiz lists 30+ channels, including Instagram, Facebook, Threads, YouTube, Pinterest and Reddit. SocialMate posts to 7: TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon.' },
        { q: 'Which is cheaper for a small team?', a: `Postiz Standard ($29/month) has no team members, and Team is $39/month. SocialMate Pro is $${SM.proPrice}/month with ${SM.proSeats} seats, and the free plan includes ${SM.freeSeats}.` },
        { q: 'Does SocialMate have unlimited posts like Postiz?', a: `No. Every SocialMate plan is capped: ${SM.freePosts} posts a month on Free, ${SM.proPosts.toLocaleString('en-US')} on Pro and ${SM.agencyPosts.toLocaleString('en-US')} on Agency.` },
      ]}
      closing={{ title: 'Skip the server.', body: `${SM.freePosts} posts a month on 7 platforms, 15+ AI writing tools, and nothing to install. SocialMate's free plan needs no card.` }}
    />
  )
}
