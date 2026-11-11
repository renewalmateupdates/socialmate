import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Mixpost facts checked Nov 11, 2026 against mixpost.app/pricing,
// mixpost.app/cloud and mixpost.app. Whether its AI needs your own API key was
// not stated on those pages, so this page doesn't say.
export default function VsMixpostPage() {
  return (
    <VsComparison
      competitor="Mixpost"
      checked="Mixpost facts checked against mixpost.app/pricing, mixpost.app/cloud and mixpost.app on Nov 11, 2026."
      intro={`Mixpost is software you host and buy once ($299 for Pro), with a free open-source Lite edition and a hosted Cloud from $29 a month. SocialMate is hosted only: free to start, $${SM.proPrice} a month for Pro.`}
      them={{
        title: 'Own it: self-hosted, one-time license',
        points: [
          '✅ Free open-source Lite edition (Facebook Pages, X and Mastodon)',
          '✅ Pro license $299 once, on your own server',
          '✅ 12 platforms, including Instagram, Facebook, Threads, YouTube, Pinterest and Pixelfed',
          '❌ Self-hosting needs PHP 8.3+, MySQL and Redis, and you handle updates and backups',
          '❌ Hosted Cloud starts at $29/month for 100 scheduled posts',
        ],
      }}
      us={{ title: 'Hosted, so you don\'t have to', points: SM_POINTS }}
      rows={[
        { feature: 'Free option',         them: 'Lite (self-hosted): Facebook Pages, X and Mastodon only',  us: `Free plan (hosted): ${SM.freePosts} posts/month on 7 platforms` },
        { feature: 'Pricing',             them: 'Pro $299 one-time (1 year of updates), Enterprise $1,199', us: `Free, Pro $${SM.proPrice}/mo, Agency $${SM.agencyPrice}/mo` },
        { feature: 'Cheapest hosted plan', them: 'Cloud Spark $29/mo: 100 scheduled posts, 1 member',       us: `Pro $${SM.proPrice}/mo: ${SM.proPosts.toLocaleString('en-US')} posts, ${SM.proSeats} seats` },
        { feature: 'Running it yourself', them: 'PHP 8.3+, MySQL, Redis and a web server; you handle updates', us: 'Not needed' },
        { feature: 'Instagram, Facebook, Threads, YouTube, Pinterest', them: '✅ (Pro and Cloud)',            us: '❌ Not yet' },
        { feature: 'Discord and Telegram', them: 'Not listed',                                              us: '✅' },
        { feature: 'Bluesky and Mastodon', them: '✅',                                                      us: '✅' },
        { feature: 'TikTok',              them: '✅',                                                       us: `✅ TikTok Studio, ${SM.freeTikTok} videos/month free` },
        { feature: 'AI',                  them: 'AI assistant (Pro; Cloud with monthly credits)',           us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
      ]}
      theyWin={[
        'You want to own the software and your data, pay once, and run it on your own server.',
        'You need Instagram, Facebook, Threads, YouTube, Pinterest or Pixelfed.',
      ]}
      weWin={[
        { title: 'No server to look after', desc: 'Mixpost Lite is free but self-hosted, and it only posts to Facebook Pages, X and Mastodon. SocialMate\'s free plan is hosted and covers 7 platforms.' },
        { title: 'Cheaper hosted', desc: `Mixpost Cloud starts at $29 a month for 100 scheduled posts and 1 team member. SocialMate Pro is $${SM.proPrice} a month for ${SM.proPosts.toLocaleString('en-US')} posts and ${SM.proSeats} seats.` },
        { title: 'Discord and Telegram', desc: 'Mixpost does not list them. SocialMate posts to both on the free plan.' },
      ]}
      faq={[
        { q: 'Is Mixpost free?', a: 'Mixpost Lite is free and open source, but you host it yourself and it posts to Facebook Pages, X and Mastodon. Pro is a $299 one-time license, and Mixpost Cloud starts at $29 a month.' },
        { q: 'What do I need to self-host Mixpost?', a: 'Mixpost lists PHP 8.3+, MySQL, Redis and a web server such as Nginx or Apache, installed with Docker or Composer. Updates and backups are yours to manage.' },
        { q: 'Can I self-host SocialMate?', a: `No. SocialMate is hosted only: nothing to install, and the free plan has ${SM.freePosts} posts a month.` },
      ]}
      closing={{ title: 'Hosted, so you don\'t have to.', body: `${SM.freePosts} posts a month on 7 platforms. No server, no license, no card.` }}
    />
  )
}
