import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Planoly facts checked Nov 11, 2026 against planoly.com/pricing and
// planoly.com. Its upload limits disagree between those two pages, so this
// page does not quote one.
export default function VsPlanolyPage() {
  return (
    <VsComparison
      competitor="Planoly"
      checked="Planoly facts checked against planoly.com/pricing and planoly.com on Nov 11, 2026."
      intro="Planoly is built around Instagram: a grid planner, link in bio and DM automation. SocialMate posts to TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon, and has no Instagram yet."
      them={{
        title: 'Instagram-first planning from $14/month',
        points: [
          '✅ Instagram grid planner',
          '✅ Instagram, TikTok, LinkedIn, Facebook, Pinterest, YouTube and Threads',
          '✅ Link in bio with product sales, Instagram DM automation',
          '❌ X is reminders only',
          '❌ The free plan is in the mobile app, with 10 uploads a month',
          '❌ Starter ($14/month) has 1 user',
        ],
      }}
      us={{ title: 'Seven platforms, free to start', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest paid plan',   them: '$14/mo Starter: 1 social set, 1 user',                     us: `$${SM.proPrice}/mo Pro: ${SM.proAccounts} per platform, ${SM.proSeats} seats` },
        { feature: 'Free option',          them: 'Mobile app, 10 uploads/month; 14-day trial of paid plans',  us: `Free plan on the web, ${SM.freePosts} posts/month` },
        { feature: 'Instagram',            them: '✅ Grid planner and posting',                                us: '❌ Not yet' },
        { feature: 'TikTok',               them: '✅ Auto-posts videos with original audio, otherwise a reminder', us: '✅ Posts directly from TikTok Studio' },
        { feature: 'X / Twitter',          them: 'Reminders only',                                             us: '✅ Posts directly (Pro and up)' },
        { feature: 'LinkedIn',             them: '✅',                                                         us: '✅ Personal profiles' },
        { feature: 'Facebook, Pinterest, YouTube, Threads', them: '✅',                                        us: '❌ Not yet' },
        { feature: 'Bluesky, Mastodon, Discord, Telegram',  them: 'Not listed',                                us: '✅' },
        { feature: 'Link in bio',          them: '✅ With digital product sales',                              us: '✅ Free' },
        { feature: 'AI',                   them: 'Post ideas and caption suggestions on every plan',           us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
        { feature: 'Team members',         them: '1 Starter, 2 Growth, 6 Pro',                                 us: `${SM.freeSeats} Free, ${SM.proSeats} Pro, ${SM.agencySeats} Agency` },
      ]}
      theyWin={[
        'Instagram is your main channel. Planoly\'s grid planner, link in bio storefront and DM automation are built for it, and SocialMate does not post to Instagram.',
        'You also need Pinterest, YouTube, Facebook or Threads.',
      ]}
      weWin={[
        { title: 'You post to X, Bluesky, Discord, Telegram or Mastodon', desc: 'Planoly lists none of these except X, and X is reminders only. SocialMate posts to all five directly.' },
        { title: 'TikTok videos that just post', desc: `Planoly auto-posts a TikTok only when the video has its original audio; otherwise it sends a reminder. SocialMate's TikTok Studio posts the video directly, ${SM.freeTikTok} a month on the free plan.` },
        { title: 'More seats for less', desc: `$${SM.proPrice} a month gets ${SM.proSeats} seats on SocialMate Pro. Planoly's $14 Starter has 1 user.` },
      ]}
      faq={[
        { q: 'Does Planoly have a free plan?', a: `Yes, in the Planoly mobile app, with 10 uploads a month, and every paid plan has a 14-day trial. SocialMate's free plan works on the web: ${SM.freePosts} posts a month, no card.` },
        { q: 'Can SocialMate replace Planoly for Instagram?', a: 'No. SocialMate does not post to Instagram yet. If Instagram is where you post most, Planoly is built for it.' },
        { q: 'Does Planoly post to X?', a: 'Planoly schedules reminders for X rather than posting. SocialMate posts to X directly on Pro and up.' },
      ]}
      closing={{ title: 'Beyond the grid.', body: `TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon from one place. ${SM.freePosts} posts a month free, Pro $${SM.proPrice}.` }}
    />
  )
}
