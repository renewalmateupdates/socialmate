import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Predis.ai facts checked Nov 11, 2026 against predis.ai/pricing and
// predis.ai. Its yearly discount labels disagree on the pricing page, so this
// page quotes the yearly totals, not a percentage.
export default function VsPredisPage() {
  return (
    <VsComparison
      competitor="Predis.ai"
      checked="Predis.ai facts checked against predis.ai/pricing and predis.ai on Nov 11, 2026."
      intro="Predis.ai makes the content for you: AI images, carousels, videos and ads, metered by credits. SocialMate's AI writes and plans the words, and its job is getting posts out on 7 platforms."
      them={{
        title: 'AI-made visuals, from $19/month',
        points: [
          '✅ Generates images, carousels, videos and ads',
          '✅ Instagram, Facebook, TikTok, LinkedIn, YouTube Shorts, X and Google Business Profile',
          '✅ Unlimited team members on every plan',
          '❌ No free plan: a 3-day trial with a card',
          '❌ Auto posting starts at $40/month (Rise)',
        ],
      }}
      us={{ title: 'Write it, schedule it, free', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest plan',                  them: '$19/mo Core ($230 billed yearly)',            us: `$0 Free, or $${SM.proPrice}/mo Pro` },
        { feature: 'Free option',                    them: '3-day trial, card required',                  us: 'Free plan, no card' },
        { feature: 'Auto posting',                   them: 'Rise ($40/mo) and up; not on Core',           us: 'Every plan, including Free' },
        { feature: 'AI images, carousels and video', them: '✅ Metered by credits (Core: 1,300 a month)', us: '❌ SocialMate\'s AI writes text only' },
        { feature: 'AI writing',                     them: 'Captions and hashtags',                       us: '15+ tools: captions, hooks, threads, rewrites, hashtags, post scores' },
        { feature: 'Instagram, Facebook, YouTube Shorts, Google Business', them: '✅',                     us: '❌ Not yet' },
        { feature: 'TikTok, LinkedIn, X',            them: '✅',                                          us: '✅ (X on Pro and up)' },
        { feature: 'Bluesky, Mastodon, Discord, Telegram', them: 'Not listed',                            us: '✅' },
        { feature: 'Team members',                   them: 'Unlimited on every plan',                     us: `${SM.freeSeats} Free, ${SM.proSeats} Pro, ${SM.agencySeats} Agency` },
      ]}
      theyWin={[
        'You want the visuals made for you. Predis.ai generates images, carousels, videos and ads; SocialMate has no image or video generation.',
        'You post mostly to Instagram, Facebook or YouTube Shorts.',
        'Your team is large: every Predis.ai plan has unlimited team members.',
      ]}
      weWin={[
        { title: 'You write your own posts and need them out everywhere', desc: 'SocialMate posts on every plan, free included. Predis.ai\'s $19 Core plan does not auto-post; that starts on Rise at $40.' },
        { title: 'Discord, Telegram, Bluesky and Mastodon', desc: 'Predis.ai does not list them. SocialMate posts to all four on the free plan.' },
        { title: 'No card to try it', desc: 'Predis.ai starts with a 3-day trial on a card. SocialMate\'s free plan has no time limit and needs no card.' },
      ]}
      faq={[
        { q: 'Is Predis.ai free?', a: `No. Every plan starts with a 3-day free trial that needs a card, and the cheapest plan is $19 a month. SocialMate has a free plan: ${SM.freePosts} posts a month, no card.` },
        { q: 'Does SocialMate generate images like Predis.ai?', a: 'No. SocialMate\'s AI tools write: captions, hooks, threads, rewrites, hashtags and post scores. Predis.ai generates images, carousels and videos.' },
        { q: 'Can I post automatically on Predis.ai\'s cheapest plan?', a: 'Not on Core ($19/month). Predis.ai\'s pricing page lists auto posting from Rise ($40/month). Every SocialMate plan posts automatically.' },
      ]}
      closing={{ title: 'Write it once, post it everywhere.', body: `${SM.freePosts} posts a month free on 7 platforms, with 15+ AI writing tools. No card, no trial clock.` }}
    />
  )
}
