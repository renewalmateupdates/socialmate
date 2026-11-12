import VsComparison from '@/components/vs/VsComparison'
import { SM, SM_POINTS } from '@/lib/vs-facts'

// OpusClip facts checked Nov 12, 2026 against opus.pro/pricing. Only what the
// page states directly is used here: prices, and that auto-posting starts on
// Starter (YouTube Shorts, TikTok, Instagram) with the scheduler on Pro.
// Re-check before changing a number.
export default function VsOpusClipPage() {
  return (
    <VsComparison
      competitor="OpusClip"
      checked="OpusClip facts checked against opus.pro/pricing on Nov 12, 2026."
      intro="OpusClip turns long videos into short clips with AI, auto-posts them from $15 a month and adds a scheduler on Pro at $29. SocialMate is a scheduler for every kind of post, free to start."
      them={{
        title: 'AI clipping that can post the clips',
        points: [
          '✅ AI finds and cuts clips from long videos, with captions and reframing',
          '✅ Auto-posting from Starter ($15/month) to YouTube Shorts, TikTok and Instagram',
          '✅ A social scheduler on Pro ($29/month)',
          '✅ A free plan for clipping',
          '❌ No auto-posting on the free plan',
          '❌ Discord, Telegram and Mastodon not listed',
        ],
      }}
      us={{ title: 'A scheduler for every post, free to start', points: SM_POINTS }}
      rows={[
        { feature: 'What it is for',             them: 'Turning long videos into clips',          us: 'Scheduling text, images and video' },
        { feature: 'Posting on the free plan',   them: '❌',                                       us: `✅ ${SM.freePosts} posts a month` },
        { feature: 'Cheapest plan that posts',   them: '$15/mo Starter',                          us: '$0 Free' },
        { feature: 'Scheduler',                  them: '$29/mo Pro',                              us: 'Every plan' },
        { feature: 'AI clipping',                them: '✅',                                       us: '❌' },
        { feature: 'Text posts and announcements', them: 'Built for video clips',                 us: '✅' },
        { feature: 'Discord, Telegram, Mastodon', them: 'Not listed',                             us: '✅' },
        { feature: 'AI writing',                 them: 'AI captions for clips',                   us: `15+ AI writing tools; ${SM.freeCredits} credits/month free` },
      ]}
      theyWin={[
        'You start from long videos (podcasts, streams, webinars) and want AI to find and cut the clips.',
        'You post clips to YouTube Shorts and Instagram Reels. SocialMate does not post to either yet.',
        'You want captions and vertical reframing done for you.',
      ]}
      weWin={[
        { title: 'Posting on the free plan', desc: `OpusClip's free plan clips but does not post. SocialMate's free plan schedules ${SM.freePosts} posts a month to TikTok, LinkedIn, Bluesky, Mastodon, Discord and Telegram.` },
        { title: 'Every kind of post', desc: 'Announcements, threads, links and images, not only clips. Write once and send it to 7 platforms.' },
        { title: 'Use both', desc: 'Make clips in OpusClip, then schedule them with the rest of your week in SocialMate: TikTok from TikTok Studio, and video to X, LinkedIn and Bluesky from Compose.' },
      ]}
      faq={[
        { q: 'How much does OpusClip cost?', a: 'Its pricing page lists a free plan, Starter at $15 a month and Pro at $29 a month, plus Business on request. Auto-posting starts on Starter; the scheduler is on Pro.' },
        { q: 'Does SocialMate make clips?', a: 'No. SocialMate schedules and posts. Many creators clip in another tool and schedule the clips in SocialMate.' },
        { q: 'Can SocialMate post to YouTube Shorts or Instagram Reels?', a: `Not yet. SocialMate posts to ${SM.livePlatforms.join(', ')}.` },
      ]}
      closing={{ title: 'Clip anywhere. Schedule here.', body: `${SM.freePosts} posts a month on 7 platforms, free. Pro is $${SM.proPrice} a month.` }}
    />
  )
}
