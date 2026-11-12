import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// AuthoredUp facts checked Nov 12, 2026 against authoredup.com/pricing.
// Re-check before changing a number.
export default function VsAuthoredUpPage() {
  return (
    <VsComparison
      competitor="AuthoredUp"
      checked="AuthoredUp facts checked against authoredup.com/pricing on Nov 12, 2026."
      intro="AuthoredUp is a LinkedIn editor and analytics tool that schedules through its Chrome extension, from $19.95 a month for one profile. SocialMate schedules LinkedIn and 6 other platforms from the web, free to start."
      them={{
        title: 'A LinkedIn editor, from $19.95/month',
        points: [
          '✅ Editor with formatting, previews and LinkedIn analytics',
          '✅ Business plan: pay per profile, invite unlimited members',
          '✅ Analytics API on every plan',
          '❌ $19.95/month for one profile ($16.63 billed yearly)',
          '❌ LinkedIn only',
          '❌ Scheduling runs through its Chrome extension',
        ],
      }}
      us={{ title: 'LinkedIn plus 6 platforms, free to start', points: SM_POINTS }}
      rows={[
        { feature: 'One person',              them: '$19.95/mo Individual, 1 profile',               us: `$0 Free, or $${SM.proPrice}/mo Pro` },
        { feature: 'Teams',                   them: '$14.95 per profile per month, 3-profile minimum', us: `$${SM.proPrice}/mo Pro with ${SM.proSeats} seats, $${SM.agencyPrice}/mo Agency with ${SM.agencySeats}` },
        { feature: 'Free option',             them: 'Free trial, no card',                           us: `Free plan: ${SM.freePosts} posts a month, no card` },
        { feature: 'Platforms',               them: 'LinkedIn (profiles, company pages, groups)',    us: `${SM.livePlatforms.join(', ')} (LinkedIn personal profiles)` },
        { feature: 'How you schedule',        them: 'Chrome extension',                              us: 'The web app, in any browser' },
        { feature: 'LinkedIn analytics',      them: '✅',                                             us: '❌ Not yet' },
        { feature: 'AI writing',              them: 'Coauthor (closed beta)',                        us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
        { feature: 'Free LinkedIn formatter', them: 'Inside the paid editor',                        us: '✅ No signup needed' },
      ]}
      theyWin={[
        'LinkedIn is your main channel and you want its analytics and post previews in one editor.',
        'You post to LinkedIn company pages or groups. SocialMate posts to personal profiles only.',
        'Your team is large: AuthoredUp bills per profile and lets you invite unlimited members.',
      ]}
      weWin={[
        { title: 'More than LinkedIn', desc: 'Schedule the same post to LinkedIn, X, Bluesky, Mastodon, Discord and Telegram at once, and TikTok video from TikTok Studio.' },
        { title: 'No extension needed', desc: 'SocialMate schedules from the web app in any browser, so posts go out whether or not your computer is on.' },
        { title: 'Free formatter, free plan', desc: `Bold, italics and bullets that survive LinkedIn's paste come from a free tool with no signup, and the free plan schedules ${SM.freePosts} posts a month.` },
      ]}
      faq={[
        { q: 'How much does AuthoredUp cost?', a: 'Individual is $19.95 a month for one profile ($16.63 a month billed yearly). Business is $14.95 per profile per month with a 3-profile minimum ($12.46 billed yearly).' },
        { q: 'Can SocialMate schedule LinkedIn posts?', a: 'Yes, to personal profiles, from the web app. Company pages are not available yet.' },
        { q: 'Is there a free LinkedIn text formatter?', a: 'Yes. SocialMate\'s LinkedIn formatter at socialmate.studio/tools/linkedin-formatter is free with no signup.' },
      ]}
      closing={{ title: 'Your LinkedIn post, everywhere.', body: `Write it once and post it to 7 platforms. ${SM.freePosts} posts a month free.` }}
    />
  )
}
