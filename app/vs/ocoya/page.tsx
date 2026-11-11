import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Ocoya facts checked Nov 11, 2026 against ocoya.com/pricing,
// ocoya.com/integrations, ocoya.com/features/design and ocoya.com.
export default function VsOcoyaPage() {
  return (
    <VsComparison
      competitor="Ocoya"
      checked="Ocoya facts checked against ocoya.com/pricing, ocoya.com/integrations and ocoya.com on Nov 11, 2026."
      intro={`Ocoya is an AI content suite: a design studio, AI images and video, 18+ social networks and blogs, from $29 a month. SocialMate is a scheduler for 7 platforms that is free to start, with Pro at $${SM.proPrice} a month.`}
      them={{
        title: 'A big AI suite, from $29/month',
        points: [
          '✅ 18+ social networks, plus blogs like WordPress and Webflow',
          '✅ Design studio, AI images and short video',
          '✅ Social inbox, workflows, API and MCP',
          '❌ No free plan: a 7-day trial with a card',
          '❌ Starter is $29/month for 5 channels',
        ],
      }}
      us={{ title: 'The scheduler, free to start', points: SM_POINTS }}
      rows={[
        { feature: 'Cheapest plan',       them: '$29/mo Starter ($290/yr): 5 channels, 300 credits',  us: `$0 Free, or $${SM.proPrice}/mo Pro ($${SM.proAnnual}/yr)` },
        { feature: 'Free option',         them: '7-day trial, card required',                         us: 'Free plan, no card' },
        { feature: 'Platforms',           them: '18+ social networks, plus blogs',                    us: '7: TikTok, LinkedIn, X, Bluesky, Discord, Telegram, Mastodon' },
        { feature: 'Discord, Telegram, Bluesky, Mastodon', them: '✅',                                us: '✅' },
        { feature: 'Instagram, Facebook, Threads, Pinterest, YouTube Shorts', them: '✅',             us: '❌ Not yet' },
        { feature: 'Design editor, AI images and video', them: '✅',                                  us: '❌' },
        { feature: 'AI writing',          them: 'Captions, translation, one-prompt campaigns',        us: `15+ AI writing tools; ${SM.freeCredits} credits/month free, ${SM.proCredits} on Pro` },
        { feature: 'Inbox',               them: 'DMs and comments',                                   us: 'Replies for Bluesky, Mastodon, Telegram and Discord' },
      ]}
      theyWin={[
        'You need Instagram, Facebook, Threads, Pinterest or YouTube Shorts, or you publish to blogs too.',
        'You want the visuals made in the same tool: Ocoya has a design studio and AI images and video.',
        'You want a social inbox for DMs, visual automations, or an API and MCP.',
      ]}
      weWin={[
        { title: 'Price', desc: `Ocoya starts at $29 a month after a trial that needs a card. SocialMate is free for ${SM.freePosts} posts a month, and Pro is $${SM.proPrice}.` },
        { title: 'Text-first creators on the open platforms', desc: 'Both tools post to Bluesky, Mastodon, Discord and Telegram. SocialMate does it on the free plan.' },
      ]}
      faq={[
        { q: 'Does Ocoya have a free plan?', a: `No. Every plan has a 7-day free trial that needs a card, and Starter is $29 a month. SocialMate's free plan has ${SM.freePosts} posts a month and no card.` },
        { q: 'Does Ocoya support more platforms than SocialMate?', a: 'Yes. Ocoya lists 18+ social networks, including Instagram, Facebook, Threads, Pinterest and YouTube Shorts, plus blogs. SocialMate posts to 7.' },
        { q: 'Which is cheaper?', a: `SocialMate. Pro is $${SM.proPrice} a month ($${SM.proAnnual} a year) and the free plan is $0. Ocoya Starter is $29 a month ($290 a year).` },
      ]}
      closing={{ title: 'The scheduler, without the suite price.', body: `${SM.freePosts} posts a month on 7 platforms and 15+ AI writing tools, free. Pro is $${SM.proPrice}.` }}
    />
  )
}
