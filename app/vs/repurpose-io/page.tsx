import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// Repurpose.io facts checked Nov 11, 2026 against repurpose.io/pricing and
// repurpose.io/content-creators. The pricing page's FAQ could not be read, and
// no full source/destination list was found, so rows say "not listed" where
// that is all we know.
export default function VsRepurposePage() {
  return (
    <VsComparison
      competitor="Repurpose.io"
      checked="Repurpose.io facts checked against repurpose.io/pricing and repurpose.io/content-creators on Nov 11, 2026."
      intro="Repurpose.io and SocialMate do different jobs. Repurpose.io takes a video you posted on one platform and posts it to your others. SocialMate schedules your posts, text, images and TikTok video, to 7 platforms."
      them={{
        title: 'Video cross-posting on autopilot, from $35/month',
        points: [
          '✅ Re-posts your videos across TikTok, YouTube Shorts, Instagram, Facebook, Snapchat, LinkedIn, Pinterest and X',
          '✅ Removes watermarks and resizes for each platform',
          '✅ 14-day free trial and 10 free videos, no card',
          '❌ Starter is $35/month',
          '❌ Built for video; scheduling text posts is not listed',
        ],
      }}
      us={{ title: 'Schedule new posts, free to start', points: SM_POINTS }}
      rows={[
        { feature: 'What it does',          them: 'Re-posts videos from one account to your others',       us: 'Schedules new posts to 7 platforms' },
        { feature: 'Cheapest plan',         them: '$35/mo Starter ($349/yr): up to 3 accounts per network', us: `$0 Free, or $${SM.proPrice}/mo Pro: ${SM.proAccounts} per platform` },
        { feature: 'Free option',           them: '14-day trial and 10 free videos, no card',              us: `Free plan, ${SM.freePosts} posts/month, no card` },
        { feature: 'Video to Instagram, YouTube Shorts, Facebook, Snapchat', them: '✅',                  us: '❌ Not yet' },
        { feature: 'TikTok video',          them: '✅',                                                    us: `✅ TikTok Studio, ${SM.freeTikTok}/month free` },
        { feature: 'Text posts to Discord, Telegram, Bluesky, Mastodon', them: 'Not listed',              us: '✅' },
        { feature: 'Watermark removal',     them: '✅',                                                    us: 'Not needed: you upload your own file' },
        { feature: 'AI writing',            them: 'Not listed',                                            us: '15+ AI writing tools' },
      ]}
      theyWin={[
        'You already post videos on one platform and want them on your others without touching them.',
        'You need Instagram Reels, YouTube Shorts, Facebook or Snapchat.',
      ]}
      weWin={[
        { title: 'You write posts, not just videos', desc: 'SocialMate schedules text and image posts to LinkedIn, X, Bluesky, Discord, Telegram and Mastodon, and TikTok video from TikTok Studio.' },
        { title: 'Free to keep', desc: `Repurpose.io's free videos and trial run out. SocialMate's free plan does not: ${SM.freePosts} posts every month.` },
      ]}
      faq={[
        { q: 'Is Repurpose.io a social media scheduler?', a: 'Mostly it distributes video: it takes videos you post on one platform and posts them to others, with watermarks removed. SocialMate is a scheduler for new posts on 7 platforms.' },
        { q: 'Can I use both?', a: 'Yes, they barely overlap. You could post TikTok videos from SocialMate\'s TikTok Studio and use Repurpose.io to copy them to YouTube Shorts and Reels.' },
        { q: 'How much is Repurpose.io?', a: `Starter is $35 a month ($349 a year) with up to 3 accounts per network, Pro is $79 and Agency $179, after a 14-day trial. SocialMate is free for ${SM.freePosts} posts a month; Pro is $${SM.proPrice}.` },
      ]}
      closing={{ title: 'Schedule what you write.', body: `Text, images and TikTok video to 7 platforms. ${SM.freePosts} posts a month free, no card.` }}
    />
  )
}
