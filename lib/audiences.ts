// Audience pages served by app/for/[slug]. ChatGPT sends most of SocialMate's
// signups, almost all of them to /for/* pages (9 of 12 since Oct 15 landed on
// /for/tiktok-creators), so these answer the questions each audience asks AI,
// for the platforms where SocialMate does something few schedulers do.
//
// Every claim here is checked against the code it describes. Plan numbers are
// not written here: the page reads them from lib/plan.ts and lib/post-limits.ts
// so a price or limit change can never leave these pages behind.
//
// The hand-built pages in app/for/<name>/ take priority over this route, so a
// slug here must never repeat one of those folders.

export type FeatureIcon =
  | 'calendar' | 'radio' | 'repeat' | 'clock' | 'image' | 'reply' | 'chart'
  | 'thread' | 'bot' | 'store' | 'sparkles' | 'users' | 'globe' | 'send'

export interface Audience {
  slug: string
  /** <title> and the search result headline. */
  title: string
  description: string
  eyebrow: string
  h1: string
  /** The direct answer, first thing on the page. AI search quotes this. */
  answer: string
  features: { icon: FeatureIcon; title: string; body: string }[]
  steps: string[]
  /** What it does not do. Said plainly so nobody signs up for the wrong thing. */
  limits: string[]
  faq: { q: string; a: string }[]
  related: { href: string; label: string }[]
}

export const AUDIENCES: Audience[] = [
  {
    slug: 'discord-communities',
    title: 'Free Discord Announcement Scheduler',
    description: 'Schedule announcements to your Discord server, rotate reminders automatically and post when you go live on Twitch. Free plan included.',
    eyebrow: 'For Discord server owners and mods',
    h1: 'Schedule Discord announcements, free',
    answer: 'SocialMate posts to your Discord server on a schedule. Add the SocialMate bot, pick the channel, and write announcements, event reminders or patch notes ahead of time. The free plan covers one server and 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Scheduled announcements', body: 'Write it now and pick the time. The post lands in your channel then, with images if you attach them, up to Discord\'s 2,000 characters.' },
      { icon: 'repeat', title: 'Reminders that rotate', body: 'Campaign mode posts a set of messages on the days and times you choose until an end date, so server rules, event reminders and links come around on their own.' },
      { icon: 'radio', title: 'Go-live alerts', body: 'When your Twitch stream starts, SocialMate posts your alert to the channel, once per stream, in your own words.' },
      { icon: 'clock', title: 'Timestamps in everyone\'s time zone', body: 'Our free Discord timestamp generator makes the codes Discord shows in each reader\'s own time zone. Paste them into any scheduled post.' },
      { icon: 'send', title: 'The same post everywhere else', body: 'Send one announcement to Discord, Telegram, Bluesky, Mastodon, LinkedIn and X at the same time, instead of copying it six times.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'On the Accounts page, connect Discord, add the SocialMate bot to your server and pick the channel it posts into.',
      'Open Compose, write your announcement, choose Discord and pick a time.',
      'For a channel the bot is not in, add a webhook for it on the Destinations page.',
    ],
    limits: [
      'SocialMate posts to channels. It does not moderate, assign roles or reply to members for you.',
      'The bot needs permission to see and send messages in the channel it posts to. If a post fails, the error says which permission is missing.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free Discord scheduler?', a: 'Yes. SocialMate\'s free plan schedules posts to one Discord server, up to 250 posts a month across all your platforms, up to 2 weeks ahead. Pro ($8 a month) covers up to 5 servers and schedules a month ahead.' },
      { q: 'Do I need to run my own Discord bot?', a: 'No. You add SocialMate\'s bot to your server and pick a channel. If you would rather not add a bot, you can post through a channel webhook instead.' },
      { q: 'Can it post when I go live on Twitch?', a: 'Yes. Go-live alerts post to Discord when your Twitch stream starts, once per stream. The free plan includes one alert, Pro up to 5.' },
      { q: 'Can I repeat an announcement every week?', a: 'Yes. Campaign mode rotates up to 20 messages on the days and times you pick until an end date, up to 26 weeks.' },
    ],
    related: [
      { href: '/tools/discord-timestamp', label: 'Free Discord timestamp generator' },
      { href: '/for/streamers', label: 'SocialMate for streamers' },
      { href: '/for/telegram-channels', label: 'Telegram channel scheduler' },
    ],
  },
  {
    slug: 'telegram-channels',
    title: 'Free Telegram Channel Scheduler',
    description: 'Schedule posts to your Telegram channel or group through your own bot, with images, rotating campaigns and go-live alerts. Free plan included.',
    eyebrow: 'For Telegram channel and group admins',
    h1: 'Schedule Telegram channel posts, free',
    answer: 'SocialMate schedules posts to your Telegram channel or group through a bot you own. Make a bot with @BotFather in about two minutes, add it to your channel as an admin, and SocialMate posts through it at the times you pick. The free plan covers one bot and 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Scheduled channel posts', body: 'Write posts ahead and pick the time. Long text posts go up to Telegram\'s 4,096-character limit, and you can attach images.' },
      { icon: 'bot', title: 'Your bot, your channel', body: 'Posts come from a bot you created, so your channel never depends on someone else\'s bot staying in it.' },
      { icon: 'repeat', title: 'Campaigns that rotate', body: 'Campaign mode posts a set of messages on your chosen days and times until an end date, reworded by AI if you want, so promos never read the same twice in a row.' },
      { icon: 'radio', title: 'Go-live alerts', body: 'When your Twitch stream starts, SocialMate posts your alert to Telegram, once per stream.' },
      { icon: 'send', title: 'Cross-post in one step', body: 'Send the same post to Telegram, Discord, Bluesky, Mastodon, LinkedIn and X at once.' },
    ],
    steps: [
      'In Telegram, message @BotFather, create a bot and copy the token it gives you.',
      'Add your bot to your channel or group as an admin.',
      'In SocialMate, connect Telegram with the bot token, then add your channel username or chat ID on the Destinations page.',
      'Write a post in Compose, choose Telegram and pick a time.',
    ],
    limits: [
      'SocialMate posts to channels and groups. It does not reply to members or run commands in your chat.',
      'The bot has to be an admin of the channel to post there.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Can I schedule posts to a Telegram channel for free?', a: 'Yes. SocialMate\'s free plan schedules posts to a Telegram channel through one bot, up to 250 posts a month across all platforms, up to 2 weeks ahead.' },
      { q: 'Why do I need my own bot?', a: 'Telegram channels only accept posts from admins, and a bot you create can be made an admin of your channel. It takes about two minutes with @BotFather and keeps your channel under your control.' },
      { q: 'Can it post images?', a: 'Yes. Attach images in Compose and they post with the message.' },
      { q: 'Can I post the same thing to Discord and X too?', a: 'Yes. Pick every platform you want in Compose and SocialMate posts to each one. X needs the Pro plan.' },
    ],
    related: [
      { href: '/for/discord-communities', label: 'Discord announcement scheduler' },
      { href: '/for/streamers', label: 'SocialMate for streamers' },
      { href: '/pricing', label: 'Plans and limits' },
    ],
  },
  {
    slug: 'bluesky-creators',
    title: 'Free Bluesky Scheduler',
    description: 'Schedule Bluesky posts, post real threads, reply to mentions and see your engagement, with an app password. Free plan included.',
    eyebrow: 'For Bluesky creators',
    h1: 'Schedule Bluesky posts, free',
    answer: 'SocialMate schedules posts to Bluesky with an app password, so your main password never leaves Bluesky. Plan posts ahead, publish real threads, reply to mentions from one inbox and pull your likes, reposts and replies into analytics. The free plan covers one Bluesky account and 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Scheduled posts', body: 'Write posts ahead and pick the time, with images. Bluesky allows 300 characters, and an emoji counts as one.' },
      { icon: 'thread', title: 'Real threads', body: 'The thread builder publishes each part as a reply to the one before, so it reads as a proper thread on Bluesky.' },
      { icon: 'reply', title: 'Replies from one inbox', body: 'See your Bluesky mentions and replies next to your other platforms and answer them without switching apps.' },
      { icon: 'chart', title: 'Engagement in one place', body: 'Sync your likes, reposts and replies into SocialMate\'s analytics to see which posts land.' },
      { icon: 'repeat', title: 'Campaigns and go-live alerts', body: 'Rotate a set of posts on a schedule until an end date, and post automatically when your Twitch stream starts.' },
    ],
    steps: [
      'In Bluesky, go to Settings, then App Passwords, and create one for SocialMate.',
      'In SocialMate, connect Bluesky with your handle and that app password.',
      'Write a post or a thread in Compose, choose Bluesky and pick a time.',
    ],
    limits: [
      'Threads publish as a reply chain when you post them now. A scheduled post is a single post.',
      'Bluesky\'s 300-character limit applies to each post.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free Bluesky scheduler?', a: 'Yes. SocialMate\'s free plan schedules posts to one Bluesky account, up to 250 posts a month across all platforms, up to 2 weeks ahead.' },
      { q: 'Is it safe to connect my Bluesky account?', a: 'SocialMate connects with an app password, which Bluesky made for exactly this. You can revoke it in Bluesky\'s settings at any time, and your main password is never shared.' },
      { q: 'Can I schedule a Bluesky thread?', a: 'You can write a thread in the thread builder and post it now as a proper reply chain. Scheduled posts go out one at a time.' },
      { q: 'Can I post to Bluesky and X at the same time?', a: 'Yes. Choose both in Compose. X needs the Pro plan; Bluesky is free.' },
    ],
    related: [
      { href: '/tools/thread-splitter', label: 'Free thread splitter for Bluesky and X' },
      { href: '/for/mastodon-users', label: 'Mastodon scheduler' },
      { href: '/pricing', label: 'Plans and limits' },
    ],
  },
  {
    slug: 'mastodon-users',
    title: 'Free Mastodon Scheduler for Any Instance',
    description: 'Schedule Mastodon posts on any instance, reply to mentions and see favourites and boosts, alongside Bluesky and your other platforms. Free plan included.',
    eyebrow: 'For Mastodon and the fediverse',
    h1: 'Schedule Mastodon posts on any instance, free',
    answer: 'SocialMate schedules posts to Mastodon on whichever instance you use. Sign in through your instance, plan posts ahead, reply to mentions from one inbox and pull your favourites, boosts and replies into analytics. The free plan covers one Mastodon account and 250 posts a month.',
    features: [
      { icon: 'globe', title: 'Any instance', body: 'Type your instance, sign in there, and SocialMate posts to your account. Your password stays with your instance.' },
      { icon: 'calendar', title: 'Scheduled posts', body: 'Write ahead and pick the time, with images, up to the usual 500 characters.' },
      { icon: 'reply', title: 'Replies from one inbox', body: 'Mastodon mentions sit next to Bluesky and your other platforms, and you can reply from there.' },
      { icon: 'chart', title: 'Favourites and boosts', body: 'Sync your favourites, boosts and replies into analytics to see what your followers respond to.' },
      { icon: 'send', title: 'Post to both networks', body: 'Most people on Mastodon are on Bluesky too. Post to both, and to Discord, Telegram and LinkedIn, in one step.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'On the Accounts page, connect Mastodon, type your instance and sign in there.',
      'Write a post in Compose, choose Mastodon and pick a time.',
    ],
    limits: [
      'SocialMate posts and replies. It does not follow, boost or favourite for you.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Does SocialMate work with my Mastodon instance?', a: 'It works with Mastodon instances that allow apps to sign in, which is the standard setup. You type your instance and sign in there.' },
      { q: 'Is Mastodon scheduling free?', a: 'Yes. The free plan schedules posts to one Mastodon account, up to 250 posts a month across all platforms, up to 2 weeks ahead.' },
      { q: 'Can I post to Mastodon and Bluesky together?', a: 'Yes. Choose both in Compose and the same post goes to each.' },
    ],
    related: [
      { href: '/for/bluesky-creators', label: 'Bluesky scheduler' },
      { href: '/tools/thread-splitter', label: 'Free thread splitter for Mastodon' },
      { href: '/pricing', label: 'Plans and limits' },
    ],
  },
  {
    slug: 'shopify-stores',
    title: 'Promote Your Shopify Products on Social, Automatically',
    description: 'Import your Shopify products into a campaign and SocialMate posts them on your schedule until an end date, reworded each time, to Bluesky, Mastodon, Discord, Telegram, LinkedIn and X.',
    eyebrow: 'For Shopify store owners',
    h1: 'Promote your Shopify products automatically',
    answer: 'SocialMate can turn your Shopify store into a posting schedule. Type your store address, pick the products, and campaign mode posts them on the days and times you choose until an end date, with each product\'s link and photo, reworded by AI so the same words never post twice in a row.',
    features: [
      { icon: 'store', title: 'Import your products', body: 'SocialMate reads your store\'s public product list, up to your 50 newest products, and turns each one into a post with its link and photo.' },
      { icon: 'repeat', title: 'Posts on a rotation', body: 'Pick the days of the week, up to 4 times a day, and an end date up to 26 weeks out. Posts are made a week ahead, so you can check and edit them in your queue.' },
      { icon: 'sparkles', title: 'Reworded every time', body: 'Turn on rewording and each message gets 6 AI versions. It costs 2 AI credits per message, once, when you create the campaign.' },
      { icon: 'send', title: 'Where it posts', body: 'Bluesky, Mastodon, Discord, Telegram, LinkedIn and X. X needs the Pro plan.' },
      { icon: 'users', title: 'Your community too', body: 'Post drops and restocks straight into your Discord server or Telegram channel, where your regulars already are.' },
    ],
    steps: [
      'Create a free SocialMate account and connect the platforms you post to.',
      'Open Campaigns, start a new campaign and type your store address.',
      'Pick the products, the days and times, and an end date.',
      'Turn on rewording if you want fresh wording each time, then start the campaign.',
    ],
    limits: [
      'SocialMate does not post to Instagram, Facebook or Pinterest yet.',
      'Imports read your store\'s public product list. Products hidden from your online store are not imported.',
      'A campaign can be run by the workspace owner or an admin.',
    ],
    faq: [
      { q: 'How do I promote my Shopify products on social media automatically?', a: 'In SocialMate, start a campaign, type your Shopify store address and pick your products. SocialMate posts them on the days and times you choose until your end date, each with its link and photo.' },
      { q: 'Do I need to install a Shopify app?', a: 'No. Every Shopify store publishes a public product list, and SocialMate reads that. Nothing is installed in your store.' },
      { q: 'Does it post to Instagram or Facebook?', a: 'Not yet. Campaigns post to Bluesky, Mastodon, Discord, Telegram, LinkedIn and X.' },
      { q: 'What does it cost?', a: 'Campaigns are included on the free plan, which posts up to 250 times a month. AI rewording costs 2 credits per message, once; the free plan includes AI credits every month.' },
    ],
    related: [
      { href: '/for/small-business', label: 'SocialMate for small businesses' },
      { href: '/for/discord-communities', label: 'Discord announcement scheduler' },
      { href: '/pricing', label: 'Plans and limits' },
    ],
  },
  {
    slug: 'indie-hackers',
    title: 'Build in Public on X, Bluesky, LinkedIn and Mastodon',
    description: 'A free scheduler for solo founders building in public: write once, post to X, Bluesky, LinkedIn, Mastodon, Discord and Telegram, with real threads and launch campaigns.',
    eyebrow: 'For solo founders building in public',
    h1: 'Build in public everywhere, from one place',
    answer: 'SocialMate lets a solo founder write an update once and post it to Bluesky, LinkedIn, Mastodon, Discord, Telegram and X on a schedule. Plan a launch as a campaign, post threads as real reply chains, and keep going on the free plan until the product pays for Pro.',
    features: [
      { icon: 'send', title: 'One update, every network', body: 'Write your progress update once and post it to every platform you use, at the time each audience is awake.' },
      { icon: 'thread', title: 'Threads that stay threads', body: 'The thread builder posts each part as a reply to the last on Bluesky, Mastodon and X.' },
      { icon: 'repeat', title: 'Launch campaigns', body: 'Line up your launch posts and reminders as a campaign that runs on your schedule until launch day.' },
      { icon: 'sparkles', title: 'Drafts in your voice', body: 'On Pro, SOMA reads your notes or a doc and drafts posts in your voice for you to approve, so a busy week still gets posted.' },
      { icon: 'users', title: 'Your community channels', body: 'Post updates straight into your Discord server or Telegram channel, next to your public posts.' },
    ],
    steps: [
      'Create a free SocialMate account and connect your platforms.',
      'Write your update in Compose and pick every platform it should go to.',
      'Pick a time, or post it now.',
    ],
    limits: [
      'Posting to X needs the Pro plan ($8 a month), because X charges for every post.',
      'Instagram, Facebook and YouTube posting are not available yet.',
    ],
    faq: [
      { q: 'What is a free tool to build in public on multiple platforms?', a: 'SocialMate\'s free plan posts to Bluesky, LinkedIn, Mastodon, Discord, Telegram and TikTok, up to 250 posts a month. Add X on Pro for $8 a month.' },
      { q: 'Can I post a thread to X and Bluesky at the same time?', a: 'Yes. Write it once in the thread builder, pick both and post it now; each part replies to the one before on each platform. X needs Pro.' },
      { q: 'Who built SocialMate?', a: 'One founder, building it after a day job and in public, which is why the free plan is real and the paid plans are priced for people paying out of pocket.' },
    ],
    related: [
      { href: '/tools/thread-splitter', label: 'Free thread splitter' },
      { href: '/for/bluesky-creators', label: 'Bluesky scheduler' },
      { href: '/story', label: 'How SocialMate was built' },
    ],
  },
]

export function audienceFor(slug: string): Audience | undefined {
  return AUDIENCES.find(a => a.slug === slug)
}
