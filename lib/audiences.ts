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
  {
    slug: 'onlyfans-creators',
    title: 'Promote Your OnlyFans on X, Telegram and Bluesky',
    description: 'Schedule the posts that send fans to your OnlyFans: previews, links and updates on X, Telegram, Bluesky, Mastodon and Discord. For chefs, trainers, musicians and every other creator.',
    eyebrow: 'For OnlyFans creators',
    h1: 'Schedule the posts that bring fans to your OnlyFans',
    answer: 'SocialMate schedules the promo posts that point people to your OnlyFans, on X, Telegram, Bluesky, Mastodon and Discord. It does not post to OnlyFans itself, because OnlyFans has no official way for outside apps to post. Chefs, trainers, musicians and coaches sell subscriptions there too, and the free plan covers 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Promo posts on a schedule', body: 'Write a week of previews and link posts in one sitting and pick the times. They go out while you are filming, training or cooking.' },
      { icon: 'repeat', title: 'Rotate your offers', body: 'Campaign mode cycles up to 20 messages, like your subscription link, a new recipe drop or a trial offer, on the days and times you pick until an end date.' },
      { icon: 'bot', title: 'A Telegram channel for fans', body: 'Run a free Telegram channel and post updates to it through a bot you own, so your fans hear from you even when an algorithm does not show them your posts.' },
      { icon: 'sparkles', title: 'Captions and hooks', body: 'AI tools write captions and hooks from one sentence, paid for with AI credits. The free plan includes 50 a month.' },
      { icon: 'send', title: 'One post, every platform', body: 'Send the same update to X, Telegram, Bluesky, Mastodon and Discord at once, instead of copying it five times.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect the platforms where you promote, like Telegram, Bluesky or X.',
      'Write a post with your OnlyFans link in Compose and pick a time, or set up a campaign that rotates several.',
      'Check the Queue to see what goes out and when.',
    ],
    limits: [
      'SocialMate does not post to OnlyFans, read your OnlyFans stats or message your fans. OnlyFans has no official way for outside apps to do that, and tools that log in as you break its rules and put your account at risk.',
      'SocialMate does not add adult content labels on any platform, so keep what you schedule safe for work and within each platform\'s rules.',
      'Instagram, Facebook and Reddit are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Can SocialMate post to OnlyFans?', a: 'No. OnlyFans has no official way for outside apps to post. SocialMate schedules the posts on other platforms that send people to your OnlyFans page.' },
      { q: 'Is there a free scheduler for promoting an OnlyFans?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Telegram, Bluesky, Mastodon and Discord, up to 2 weeks ahead. X needs Pro, $8 a month.' },
      { q: 'Is OnlyFans only adult content?', a: 'No. Chefs, personal trainers, musicians, artists and coaches sell subscriptions there too. SocialMate works the same way for all of them.' },
      { q: 'Can I repeat my promo every week?', a: 'Yes. Campaign mode rotates up to 20 messages until an end date, up to 26 weeks, and can reword them with AI so they do not read the same every time.' },
    ],
    related: [
      { href: '/for/fansly-creators', label: 'Promote a Fansly' },
      { href: '/for/telegram-channels', label: 'Telegram channel scheduler' },
      { href: '/for/virtual-assistants', label: 'SocialMate for assistants and managers' },
    ],
  },
  {
    slug: 'patreon-creators',
    title: 'Free Post Scheduler for Patreon Creators',
    description: 'Schedule the posts that bring in new patrons: previews, launch posts and reminders on Bluesky, X, Discord, Telegram, Mastodon, LinkedIn and TikTok. Free plan included.',
    eyebrow: 'For Patreon creators',
    h1: 'Schedule the posts that bring in new patrons',
    answer: 'SocialMate schedules the public posts that send people to your Patreon, on Bluesky, X, Discord, Telegram, Mastodon, LinkedIn and TikTok. It does not post to Patreon itself. Write your previews and reminders once and they go out on their own. The free plan covers 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Previews on a schedule', body: 'Queue a preview for every new episode, chapter or track, timed to go out when it drops.' },
      { icon: 'repeat', title: 'Reminders that rotate', body: 'Campaign mode cycles your tier perks, goals and join link on the days and times you choose until an end date.' },
      { icon: 'users', title: 'Announce in your patron Discord', body: 'Post announcements to your Discord server through the SocialMate bot, at the time you pick.' },
      { icon: 'radio', title: 'Go-live alerts', body: 'If you stream on Twitch, SocialMate posts your alert when you go live, once per stream.' },
      { icon: 'send', title: 'One post, every platform', body: 'Send the same update everywhere at once instead of copying it around.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect the platforms where your audience is, like Bluesky, Discord or X.',
      'Write a post with your Patreon link in Compose and pick a time, or set up a campaign that rotates several.',
      'Check the Queue to see what goes out and when.',
    ],
    limits: [
      'SocialMate does not post to Patreon, read your Patreon stats or manage your patrons.',
      'It does not watch Patreon for new posts. Announcements go out at the time you schedule them.',
      'Instagram, Facebook and YouTube are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Can SocialMate post to Patreon?', a: 'No. SocialMate schedules the public posts on other platforms that send people to your Patreon page.' },
      { q: 'Is there a free scheduler for Patreon creators?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Discord, Telegram, Mastodon, LinkedIn and TikTok, up to 2 weeks ahead. X needs Pro, $8 a month.' },
      { q: 'Can it announce new Patreon posts in my Discord?', a: 'Yes, as a scheduled post. Write the announcement, choose Discord and pick the time. It does not detect new Patreon posts on its own.' },
    ],
    related: [
      { href: '/for/podcasters', label: 'SocialMate for podcasters' },
      { href: '/for/musicians', label: 'SocialMate for musicians' },
      { href: '/for/discord-communities', label: 'Discord announcement scheduler' },
    ],
  },
  {
    slug: 'clippers',
    title: 'Free Scheduler for Twitch Clippers and Clip Channels',
    description: 'Find the top clips on any public Twitch channel, schedule clip posts to X, Bluesky, Discord and more, and post clip videos to TikTok, across several channels. Free plan included.',
    eyebrow: 'For clippers and clip channels',
    h1: 'Find clips and schedule clip posts, free',
    answer: 'SocialMate shows the most-viewed clips on any public Twitch channel and turns one into a scheduled post with the clip link, for X, Bluesky, Mastodon, Discord, Telegram and LinkedIn. Clip videos you edit yourself go to TikTok through TikTok Studio, posted publicly or scheduled. Paid plans connect several accounts on each platform, so one queue can run several clip channels.',
    features: [
      { icon: 'radio', title: 'Clips from any Twitch channel', body: 'Search a public Twitch channel and see its 20 most-viewed clips with thumbnails. The free plan includes 100 channel lookups a month, Pro 1,000.' },
      { icon: 'calendar', title: 'One click to a post', body: 'Pick a clip and Compose opens with its title and link filled in. Add your caption, choose platforms and a time.' },
      { icon: 'send', title: 'Clip videos to TikTok', body: 'Upload a clip you edited and post it to TikTok publicly, or schedule it. The free plan includes 20 TikTok videos a month.' },
      { icon: 'sparkles', title: 'Trim and caption in the browser', body: 'Creator Studio trims a video, adds a caption on top and exports it, or makes a short GIF, without installing anything.' },
      { icon: 'users', title: 'Several channels, one queue', body: 'Pro connects up to 5 accounts on each platform and Agency up to 10, so each clip channel keeps its own account and one calendar shows them all.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect the accounts you post clips from, like X, Bluesky, Discord or TikTok.',
      'Open Clips, search a Twitch channel and pick a clip.',
      'Write the caption, choose platforms and a time, then check the Queue.',
    ],
    limits: [
      'SocialMate does not download clips. A Twitch clip post is a link. To post a clip as a video on TikTok, save or record it yourself and upload it in TikTok Studio.',
      'Only post clips you have the right to share. Many streamers welcome clippers and some do not, and platforms take reposts down on copyright claims.',
      'It does not post new clips on its own; you pick every one. YouTube Shorts, Instagram Reels and Reddit are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free tool for Twitch clippers?', a: 'Yes. SocialMate\'s free plan includes 100 Twitch channel lookups a month and up to 250 scheduled posts a month to Bluesky, Discord, Telegram, Mastodon and LinkedIn, plus 20 TikTok videos. X needs Pro, $8 a month.' },
      { q: 'Can SocialMate post new clips automatically?', a: 'No. You choose each clip, so nothing goes out under your name that you did not pick.' },
      { q: 'Can I post the same clip to TikTok and X?', a: 'Yes, in two steps: the link post goes out from Compose, and the video goes to TikTok from TikTok Studio.' },
      { q: 'Can I run more than one clip channel?', a: 'Yes. The free plan connects 1 account per platform, Pro up to 5 and Agency up to 10.' },
    ],
    related: [
      { href: '/for/streamers', label: 'SocialMate for streamers' },
      { href: '/for/tiktok-creators', label: 'TikTok scheduler' },
      { href: '/tools/thread-splitter', label: 'Free thread splitter' },
    ],
  },
  {
    slug: 'vtubers',
    title: 'Free Post Scheduler and Go-Live Alerts for VTubers',
    description: 'Schedule stream announcements, post a go-live alert the moment your Twitch stream starts, and share clips on X, Bluesky, Discord and TikTok. Free plan included.',
    eyebrow: 'For VTubers',
    h1: 'Schedule your stream posts and go-live alerts, free',
    answer: 'SocialMate schedules your stream announcements to X, Bluesky, Discord, Telegram, Mastodon and LinkedIn, posts an alert when your Twitch stream starts, and sends clip videos to TikTok. Write the week\'s posts in one sitting and get back to your model and your stream. The free plan covers 250 posts a month.',
    features: [
      { icon: 'radio', title: 'Go-live alerts', body: 'When your Twitch stream starts, SocialMate posts your alert to Discord, Bluesky, Telegram, Mastodon, LinkedIn and X, once per stream, in your own words.' },
      { icon: 'calendar', title: 'Announcements ahead of time', body: 'Post your weekly schedule, debut reminders and birthday stream countdowns days before they happen.' },
      { icon: 'clock', title: 'Start times in every viewer\'s zone', body: 'Use the free Discord timestamp generator so every viewer sees your start time in their own time zone.' },
      { icon: 'image', title: 'Share your clips', body: 'Pick a Twitch clip and schedule a post with its link, or upload an edited clip to TikTok.' },
      { icon: 'users', title: 'Your mod can post for you', body: 'The free plan has 2 seats, so a mod or manager can schedule posts to your accounts while you keep the passwords.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect where your viewers are, like X, Bluesky or your Discord server.',
      'Set up a go-live alert for your Twitch channel.',
      'Schedule the week\'s announcements in Compose and check the Queue.',
    ],
    limits: [
      'Go-live alerts work with Twitch only. YouTube and Kick streams are not detected.',
      'SocialMate does not stream, add overlays or read chat.',
      'YouTube, Instagram and Reddit are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free scheduler for VTubers?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Discord, Telegram, Mastodon and LinkedIn, plus TikTok videos. X needs Pro, $8 a month.' },
      { q: 'Can it post when I go live?', a: 'Yes, for Twitch. The free plan includes one go-live alert, Pro up to 5 and Agency up to 10.' },
      { q: 'Can my mod post for me without my password?', a: 'Yes. Invite them as an Editor. They schedule to your connected accounts from their own login.' },
    ],
    related: [
      { href: '/for/streamers', label: 'SocialMate for streamers' },
      { href: '/for/discord-communities', label: 'Discord announcement scheduler' },
      { href: '/tools/discord-timestamp', label: 'Free Discord timestamp generator' },
    ],
  },
  {
    slug: 'fansly-creators',
    title: 'Promote Your Fansly on X, Telegram and Bluesky',
    description: 'Schedule the posts that send fans to your Fansly: previews, links and updates on X, Telegram, Bluesky, Mastodon and Discord. Free plan included.',
    eyebrow: 'For Fansly creators',
    h1: 'Schedule the posts that bring fans to your Fansly',
    answer: 'SocialMate schedules the promo posts that point people to your Fansly page, on X, Telegram, Bluesky, Mastodon and Discord. It does not post to Fansly or connect to your Fansly account. Write a week of previews and link posts in one sitting and they go out on time while you create. The free plan covers 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Promo posts on a schedule', body: 'Queue your teasers, link posts and new-content announcements for the times your fans are online.' },
      { icon: 'repeat', title: 'Rotate your offers', body: 'Campaign mode cycles up to 20 messages, like your page link, a free trial or a new bundle, on the days and times you pick until an end date.' },
      { icon: 'bot', title: 'A Telegram channel you own', body: 'Post to your Telegram channel through your own bot, so fans hear from you even when an algorithm hides your posts.' },
      { icon: 'users', title: 'A manager can post for you', body: 'Invite a chatter, assistant or manager as an Editor. They schedule to your accounts without your passwords.' },
      { icon: 'send', title: 'One post, every platform', body: 'Send the same update to X, Telegram, Bluesky, Mastodon and Discord at once.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect the platforms where you promote, like Telegram, Bluesky or X.',
      'Write a post with your Fansly link in Compose and pick a time, or set up a campaign that rotates several.',
      'Check the Queue to see what goes out and when.',
    ],
    limits: [
      'SocialMate does not post to Fansly, read your Fansly stats or message your fans.',
      'SocialMate does not add adult content labels on any platform, so keep what you schedule safe for work and within each platform\'s rules.',
      'Instagram, Facebook and Reddit are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Can SocialMate post to Fansly?', a: 'No. SocialMate schedules the posts on other platforms that send people to your Fansly page.' },
      { q: 'Is there a free scheduler for promoting a Fansly?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Telegram, Bluesky, Mastodon and Discord, up to 2 weeks ahead. X needs Pro, $8 a month.' },
      { q: 'Can my manager schedule posts for me?', a: 'Yes. The free plan has 2 seats. Invite them as an Editor and they post to your connected accounts from their own login.' },
      { q: 'Can I repeat my promo every week?', a: 'Yes. Campaign mode rotates up to 20 messages until an end date, up to 26 weeks.' },
    ],
    related: [
      { href: '/for/onlyfans-creators', label: 'Promote an OnlyFans' },
      { href: '/for/telegram-channels', label: 'Telegram channel scheduler' },
      { href: '/for/virtual-assistants', label: 'SocialMate for assistants and managers' },
    ],
  },
  {
    slug: 'fanvue-creators',
    title: 'Promote Your Fanvue on X, Telegram and Bluesky',
    description: 'Schedule the posts that send fans to your Fanvue: previews, links and updates on X, Telegram, Bluesky, Mastodon and Discord. Free plan included.',
    eyebrow: 'For Fanvue creators',
    h1: 'Schedule the posts that bring fans to your Fanvue',
    answer: 'SocialMate schedules the promo posts that point people to your Fanvue page, on X, Telegram, Bluesky, Mastodon and Discord. It does not post to Fanvue or connect to your Fanvue account. Set up a week of link posts once and they go out on their own. The free plan covers 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'Promo posts on a schedule', body: 'Queue previews, link posts and announcements for the hours your fans are awake, wherever they live.' },
      { icon: 'repeat', title: 'Rotate your offers', body: 'Campaign mode cycles up to 20 messages on the days and times you pick until an end date, and can reword them with AI so they do not read the same each time.' },
      { icon: 'bot', title: 'A Telegram channel you own', body: 'Post to your Telegram channel through your own bot, a direct line to fans that no algorithm decides.' },
      { icon: 'sparkles', title: 'Captions from one sentence', body: 'AI tools write captions and hooks, paid for with AI credits. The free plan includes 50 a month.' },
      { icon: 'send', title: 'One post, every platform', body: 'Send the same update to X, Telegram, Bluesky, Mastodon and Discord at once.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect the platforms where you promote, like Telegram, Bluesky or X.',
      'Write a post with your Fanvue link in Compose and pick a time, or set up a campaign that rotates several.',
      'Check the Queue to see what goes out and when.',
    ],
    limits: [
      'SocialMate does not post to Fanvue, read your Fanvue stats or message your fans.',
      'SocialMate does not add adult content labels on any platform, so keep what you schedule safe for work and within each platform\'s rules.',
      'Instagram, Facebook and Reddit are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Can SocialMate post to Fanvue?', a: 'No. SocialMate schedules the posts on other platforms that send people to your Fanvue page.' },
      { q: 'Is there a free scheduler for promoting a Fanvue?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Telegram, Bluesky, Mastodon and Discord, up to 2 weeks ahead. X needs Pro, $8 a month.' },
      { q: 'Does it write captions for me?', a: 'It can. The AI tools turn one sentence into a caption or hook for a few credits each, and the free plan includes 50 credits a month.' },
    ],
    related: [
      { href: '/for/onlyfans-creators', label: 'Promote an OnlyFans' },
      { href: '/for/fansly-creators', label: 'Promote a Fansly' },
      { href: '/for/telegram-channels', label: 'Telegram channel scheduler' },
    ],
  },
  {
    slug: 'ko-fi-creators',
    title: 'Free Post Scheduler for Ko-fi and Buy Me a Coffee Creators',
    description: 'Schedule the posts that bring in supporters: new work, shop drops and thank-yous on Bluesky, X, Discord, Telegram, Mastodon, LinkedIn and TikTok. Free plan included.',
    eyebrow: 'For Ko-fi and Buy Me a Coffee creators',
    h1: 'Schedule the posts that bring in supporters',
    answer: 'SocialMate schedules the public posts that send people to your Ko-fi or Buy Me a Coffee page, on Bluesky, X, Discord, Telegram, Mastodon, LinkedIn and TikTok. It does not post to either site. Share new work, shop drops and commission slots on a schedule, and keep making things. The free plan covers 250 posts a month.',
    features: [
      { icon: 'calendar', title: 'New work, on time', body: 'Queue a post for every finished piece, chapter or episode, timed for when your audience is online.' },
      { icon: 'repeat', title: 'Shop and commission reminders', body: 'Campaign mode rotates your shop items, commission status and support link on the days you choose until an end date.' },
      { icon: 'users', title: 'Your Discord, kept in the loop', body: 'Announce drops in your Discord server through the SocialMate bot, at the time you pick.' },
      { icon: 'send', title: 'One post, every platform', body: 'Send the same update everywhere at once instead of copying it seven times.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect the platforms where your supporters follow you.',
      'Write a post with your Ko-fi or Buy Me a Coffee link and pick a time, or set up a campaign.',
      'Check the Queue to see what goes out and when.',
    ],
    limits: [
      'SocialMate does not post to Ko-fi or Buy Me a Coffee and does not see your supporters or sales.',
      'It does not post automatically when you get a new supporter.',
      'Instagram, Facebook and Pinterest are not available. Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free scheduler for Ko-fi creators?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Discord, Telegram, Mastodon and LinkedIn, plus TikTok videos. X needs Pro, $8 a month.' },
      { q: 'Can SocialMate post to my Ko-fi page?', a: 'No. It schedules the posts on other platforms that send people to your page.' },
      { q: 'Can I keep a "commissions open" post going every week?', a: 'Yes. Campaign mode repeats up to 20 messages on the days you choose, for up to 26 weeks.' },
    ],
    related: [
      { href: '/for/artists', label: 'SocialMate for artists' },
      { href: '/for/patreon-creators', label: 'SocialMate for Patreon creators' },
      { href: '/for/content-creators', label: 'SocialMate for content creators' },
    ],
  },
  {
    slug: 'cosplayers',
    title: 'Free Post Scheduler for Cosplayers',
    description: 'Schedule build progress, photo sets and con plans to Bluesky, X, TikTok, Discord and Mastodon in one go. Free plan included.',
    eyebrow: 'For cosplayers',
    h1: 'Schedule your cosplay posts, free',
    answer: 'SocialMate schedules your build progress, photo sets and convention plans to Bluesky, X, Mastodon, Discord, Telegram and LinkedIn, and posts videos to TikTok. Write a week of posts after a shoot and they go out while you sew. The free plan covers 250 posts a month.',
    features: [
      { icon: 'image', title: 'Photo posts', body: 'Attach photos to a post and send it to Bluesky, X, Mastodon, Discord and Telegram at once.' },
      { icon: 'send', title: 'Transformation videos to TikTok', body: 'Upload a video and post it to TikTok publicly, or schedule it. The free plan includes 20 TikTok videos a month.' },
      { icon: 'repeat', title: 'Con countdowns', body: 'Campaign mode rotates "see you at the con" posts, your panel time and your shop link until the event ends.' },
      { icon: 'calendar', title: 'Build progress, spaced out', body: 'Queue a build log over several days instead of dumping it all at once.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect Bluesky, X, TikTok or your Discord server.',
      'Write a post, attach photos and pick a time.',
      'Check the Calendar to see the week laid out.',
    ],
    limits: [
      'Instagram, Facebook and Threads are not available. They need Meta\'s app review, which SocialMate has not started.',
      'SocialMate does not edit photos. Creator Studio trims videos and adds captions; photo editing happens in your own app.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free scheduler for cosplayers?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Discord, Telegram, Mastodon and LinkedIn, plus 20 TikTok videos. X needs Pro, $8 a month.' },
      { q: 'Does it post to Instagram?', a: 'Not yet. Instagram needs Meta\'s app review, which SocialMate has not started. It posts to Bluesky, X, TikTok, Mastodon, Discord, Telegram and LinkedIn.' },
      { q: 'Can I schedule a TikTok video?', a: 'Yes. Upload it in TikTok Studio, pick the privacy and the time, and it posts on schedule.' },
    ],
    related: [
      { href: '/for/tiktok-creators', label: 'TikTok scheduler' },
      { href: '/for/bluesky-creators', label: 'Bluesky scheduler' },
      { href: '/for/event-organizers', label: 'SocialMate for event organizers' },
    ],
  },
  {
    slug: 'virtual-assistants',
    title: 'Social Media Scheduler for Virtual Assistants and Managers',
    description: 'Schedule posts to your clients\' accounts without their passwords. Each client invites you to their own SocialMate account, free, and you switch between them in one click.',
    eyebrow: 'For virtual assistants and social media managers',
    h1: 'Post for your clients without their passwords',
    answer: 'With SocialMate, each client connects their own accounts and invites you as an Editor. You schedule to their LinkedIn, Bluesky, X, Discord, Telegram, Mastodon and TikTok from your own login, and switch between clients in the sidebar. On the free plan, which has 2 seats, your posts go straight to the queue; on Pro and Agency the owner can approve them first.',
    features: [
      { icon: 'users', title: 'No shared passwords', body: 'Your client connects their accounts once. You post from your own login, and they can remove you any time.' },
      { icon: 'globe', title: 'Every client, one login', body: 'Each client who invites you shows up under "Shared with you" in the workspace switcher. Pick one and you are posting to their accounts.' },
      { icon: 'calendar', title: 'They see what you scheduled', body: 'The owner sees your posts in their Queue, Calendar and Drafts, and can move, edit or delete them.' },
      { icon: 'reply', title: 'Approval when they want it', body: 'On Pro and Agency, an Editor\'s posts wait for the owner\'s approval. On the free plan they go straight to the queue.' },
      { icon: 'chart', title: 'Agency for your own clients', body: 'If you would rather hold the accounts yourself, Agency gives you 5 client workspaces and 15 seats.' },
    ],
    steps: [
      'Your client creates a free SocialMate account and connects their platforms.',
      'They invite you from Team as an Editor.',
      'You accept, then pick their workspace under "Shared with you".',
      'Write the post, choose their accounts and a time. It shows in their Queue.',
    ],
    limits: [
      'LinkedIn posting is for personal profiles. Company pages are not available yet.',
      'Instagram, Facebook and Threads are not available. Posting to X needs the Pro plan on the client\'s account.',
      'A Viewer can look but cannot create posts. Give an assistant the Editor role.',
    ],
    faq: [
      { q: 'How can my VA post to my LinkedIn without my password?', a: 'Connect LinkedIn to your SocialMate account and invite your VA as an Editor. They schedule posts to your profile from their own login.' },
      { q: 'Is it free for a business owner and one assistant?', a: 'Yes. The free plan includes 2 seats and up to 250 posts a month.' },
      { q: 'Can I manage several clients from one login?', a: 'Yes. Each client invites you to their own account, and you switch between them in the sidebar. Or use Agency to hold up to 5 client workspaces yourself.' },
      { q: 'Can the owner check posts before they go out?', a: 'On Pro and Agency, yes: an Editor\'s posts wait for approval. On the free plan, the owner sees them in the Queue and can edit or delete them before they publish.' },
    ],
    related: [
      { href: '/for/agencies', label: 'SocialMate for agencies' },
      { href: '/for/linkedin-creators', label: 'LinkedIn scheduler' },
      { href: '/for/small-business', label: 'SocialMate for small businesses' },
    ],
  },
  {
    slug: 'artists',
    title: 'Free Post Scheduler for Artists and Illustrators',
    description: 'Schedule art posts, commission openings and shop drops to Bluesky, X, Mastodon, Discord, Telegram and TikTok. Free plan included.',
    eyebrow: 'For artists and illustrators',
    h1: 'Schedule your art posts, free',
    answer: 'SocialMate schedules your finished pieces, works in progress and commission openings to Bluesky, X, Mastodon, Discord, Telegram and LinkedIn, and posts process videos to TikTok. Post when your audience is awake, not when you finally put the pen down. The free plan covers 250 posts a month.',
    features: [
      { icon: 'image', title: 'Image posts everywhere', body: 'Attach your art and send it to Bluesky, X, Mastodon, Discord and Telegram at once.' },
      { icon: 'clock', title: 'Post while you sleep', body: 'Schedule for the hours your followers are online, in any time zone.' },
      { icon: 'repeat', title: 'Commissions open, on repeat', body: 'Campaign mode rotates your commission sheet, shop link and slot count until you close them.' },
      { icon: 'send', title: 'Process videos to TikTok', body: 'Upload a speedpaint or timelapse and post it to TikTok publicly, or schedule it.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect Bluesky, Mastodon, X or your Discord server.',
      'Write a post, attach your image and pick a time.',
      'Check the Calendar to see your week of posts.',
    ],
    limits: [
      'Instagram, Pinterest and Facebook are not available.',
      'SocialMate does not watermark or resize your images; prepare them first.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free scheduler for artists on Bluesky?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Mastodon, Discord, Telegram and LinkedIn, plus TikTok videos. X needs Pro, $8 a month.' },
      { q: 'Can I post the same piece to Bluesky and Mastodon at once?', a: 'Yes. Pick both in Compose and the image goes to each.' },
      { q: 'Does it post to Instagram or Pinterest?', a: 'Not yet. Instagram needs Meta\'s app review, and Pinterest did not approve SocialMate\'s application.' },
    ],
    related: [
      { href: '/for/bluesky-creators', label: 'Bluesky scheduler' },
      { href: '/for/mastodon-users', label: 'Mastodon scheduler' },
      { href: '/for/ko-fi-creators', label: 'SocialMate for Ko-fi creators' },
    ],
  },
  {
    slug: 'authors',
    title: 'Free Book Promotion Scheduler for Authors',
    description: 'Schedule book launch posts, preorder reminders and newsletter links to Bluesky, X, Mastodon, LinkedIn, Discord and Telegram. Free plan included.',
    eyebrow: 'For authors and writers',
    h1: 'Schedule your book promotion, free',
    answer: 'SocialMate schedules your launch posts, preorder reminders and newsletter links to Bluesky, X, Mastodon, LinkedIn, Discord and Telegram. Campaign mode keeps your buy links going out on a schedule until an end date, so promotion keeps running while you write the next book. The free plan covers 250 posts a month.',
    features: [
      { icon: 'repeat', title: 'A launch that runs itself', body: 'Campaign mode rotates up to 20 messages, like your buy link, a review quote and a preorder bonus, for up to 26 weeks.' },
      { icon: 'globe', title: 'Blog or newsletter to drafts', body: 'Import your blog or newsletter feed and each new piece becomes a draft post to edit and schedule.' },
      { icon: 'thread', title: 'Real threads', body: 'Post an excerpt as a thread to Bluesky, Mastodon or X, with each part replying to the one before.' },
      { icon: 'sparkles', title: 'Hooks from your blurb', body: 'AI tools turn a sentence about your book into hooks and captions, paid for with credits. The free plan includes 50 a month.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect Bluesky, LinkedIn, Mastodon or X.',
      'Set up a campaign with your buy links and a few quotes.',
      'Check the Queue as the posts go out.',
    ],
    limits: [
      'SocialMate does not post to Goodreads, Amazon or Instagram.',
      'It does not track book sales or link clicks.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free way to schedule book promotion posts?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Mastodon, LinkedIn, Discord and Telegram. X needs Pro, $8 a month.' },
      { q: 'Can I run a launch for several weeks without posting by hand?', a: 'Yes. Campaign mode posts your messages in turn on the days and times you choose until an end date, up to 26 weeks.' },
      { q: 'Can I turn my newsletter into social posts?', a: 'Yes. RSS import pulls each new issue from your feed as a draft you can edit and schedule.' },
    ],
    related: [
      { href: '/for/newsletter-writers', label: 'SocialMate for newsletter writers' },
      { href: '/for/bloggers', label: 'SocialMate for bloggers' },
      { href: '/tools/thread-splitter', label: 'Free thread splitter' },
    ],
  },
  {
    slug: 'newsletter-writers',
    title: 'Free Social Scheduler for Newsletter Writers',
    description: 'Turn each issue into posts for Bluesky, LinkedIn, X, Mastodon, Discord and Telegram. Import from your Substack, Beehiiv or Ghost feed. Free plan included.',
    eyebrow: 'For newsletter writers',
    h1: 'Turn every issue into social posts',
    answer: 'SocialMate imports new issues from your newsletter\'s RSS feed (Substack, Beehiiv, Ghost and most others have one) as drafts, and schedules them to Bluesky, LinkedIn, X, Mastodon, Discord and Telegram. Post the issue, a thread of its best lines and a reminder later in the week, from one place. The free plan covers 250 posts a month.',
    features: [
      { icon: 'globe', title: 'Your feed to drafts', body: 'Paste your feed address and pick the issues to import. Each becomes a draft with its link.' },
      { icon: 'thread', title: 'Threads from an issue', body: 'Turn the best lines into a thread and post it to Bluesky, Mastodon or X right away, each part replying to the one before.' },
      { icon: 'send', title: 'LinkedIn and the rest', body: 'Send the same announcement to LinkedIn, Bluesky, Mastodon, Discord and Telegram at once, with X on Pro.' },
      { icon: 'repeat', title: 'Subscribe reminders', body: 'Campaign mode rotates a few "why subscribe" posts on the days you choose, so the ask never goes quiet.' },
    ],
    steps: [
      'Create a free SocialMate account and connect your platforms.',
      'Open RSS import and paste your newsletter\'s feed address.',
      'Import the latest issue as a draft, edit it and pick a time.',
      'Check the Queue to see what goes out and when.',
    ],
    limits: [
      'SocialMate does not send your newsletter or manage subscribers.',
      'RSS import runs when you open it and pick issues; it does not watch your feed and post on its own.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'How do I share my Substack posts on Bluesky and LinkedIn automatically?', a: 'Import the issue from your Substack\'s RSS feed in SocialMate, then schedule the draft to Bluesky and LinkedIn. You pick each issue; it does not post on its own.' },
      { q: 'Is it free?', a: 'Yes. The free plan schedules up to 250 posts a month to Bluesky, LinkedIn, Mastodon, Discord and Telegram. X needs Pro, $8 a month.' },
      { q: 'Does it work with Beehiiv or Ghost?', a: 'Yes, with any newsletter that publishes an RSS or Atom feed.' },
    ],
    related: [
      { href: '/for/authors', label: 'SocialMate for authors' },
      { href: '/for/bloggers', label: 'SocialMate for bloggers' },
      { href: '/for/linkedin-creators', label: 'LinkedIn scheduler' },
    ],
  },
  {
    slug: 'open-source-maintainers',
    title: 'Announce Open Source Releases on Mastodon, Bluesky and Discord',
    description: 'Turn GitHub releases into scheduled posts for Mastodon, Bluesky, Discord, LinkedIn and X, and keep your project\'s community in the loop. Free plan included.',
    eyebrow: 'For open source maintainers',
    h1: 'Announce every release without copying it five times',
    answer: 'SocialMate imports your project\'s GitHub releases from their Atom feed as drafts, and schedules the announcement to Mastodon, Bluesky, Discord, Telegram, LinkedIn and X. Write the release post once, add a thread of highlights, and get back to the code. The free plan covers 250 posts a month.',
    features: [
      { icon: 'globe', title: 'Releases to drafts', body: 'Every GitHub repository has a releases feed at /releases.atom. Import it and each release becomes a draft with its link.' },
      { icon: 'send', title: 'Mastodon and Bluesky first', body: 'Post to any Mastodon instance and to Bluesky at once, where much of the open source crowd now reads.' },
      { icon: 'users', title: 'Your Discord server', body: 'Post release notes to your project\'s Discord channel through the SocialMate bot.' },
      { icon: 'clock', title: 'Community call reminders', body: 'Schedule the reminder, and use the free Discord timestamp generator so the time shows in every contributor\'s zone.' },
      { icon: 'users', title: 'Co-maintainers can post', body: 'The free plan has 2 seats, so a co-maintainer can schedule to the project\'s accounts.' },
    ],
    steps: [
      'Create a free SocialMate account and connect the project\'s accounts.',
      'Open RSS import and paste github.com/OWNER/REPO/releases.atom.',
      'Import the new release, edit the draft and pick platforms and a time.',
      'Post a thread of highlights to Mastodon or Bluesky if the release deserves one.',
    ],
    limits: [
      'SocialMate does not watch GitHub and post on its own; you import each release.',
      'It does not post to GitHub Discussions, Reddit or Hacker News.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'How do I announce a GitHub release on Mastodon and Bluesky?', a: 'Import the release from your repository\'s releases.atom feed in SocialMate, then schedule the draft to Mastodon and Bluesky. Both are on the free plan.' },
      { q: 'Does it work with any Mastodon instance?', a: 'Yes. Connect the account on whichever instance your project uses.' },
      { q: 'Can I post a thread of release highlights?', a: 'Yes. The thread builder posts each part as a reply to the one before, on Mastodon, Bluesky and X, when you post it right away.' },
    ],
    related: [
      { href: '/for/mastodon-users', label: 'Mastodon scheduler' },
      { href: '/for/indie-hackers', label: 'SocialMate for indie hackers' },
      { href: '/tools/discord-timestamp', label: 'Free Discord timestamp generator' },
    ],
  },
  {
    slug: 'educators',
    title: 'Free Announcement Scheduler for Teachers, Tutors and Course Creators',
    description: 'Schedule reminders and announcements to your class Discord or Telegram group, and promote your course on LinkedIn, Bluesky and X. Free plan included.',
    eyebrow: 'For teachers, tutors and course creators',
    h1: 'Schedule class reminders and course posts, free',
    answer: 'SocialMate schedules reminders to a Discord server or Telegram group, and course promotion to LinkedIn, Bluesky, Mastodon and X. Set up a term\'s worth of reminders once and they go out on time. The free plan covers 250 posts a month.',
    features: [
      { icon: 'repeat', title: 'Reminders that repeat', body: 'Campaign mode posts weekly reminders, like office hours or a due date, on the days and times you pick until the term ends.' },
      { icon: 'users', title: 'Discord and Telegram groups', body: 'Post to a Discord channel through the SocialMate bot, or to a Telegram group through your own bot.' },
      { icon: 'send', title: 'Promote your course', body: 'Share lessons, results and enrollment dates on LinkedIn, Bluesky, Mastodon and X from one place.' },
      { icon: 'sparkles', title: 'Posts from a lesson plan', body: 'AI tools turn a sentence about a lesson into a post or a thread, paid for with credits. The free plan includes 50 a month.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect your class Discord server, Telegram group or LinkedIn.',
      'Set up a campaign for weekly reminders, or schedule single announcements in Compose.',
      'Check the Calendar to see the term laid out.',
    ],
    limits: [
      'SocialMate does not post to Google Classroom, Canvas, Teachable or email.',
      'It does not read replies in Discord or Telegram.',
      'Follow your school\'s rules and each platform\'s age limits for student groups.',
    ],
    faq: [
      { q: 'Can I schedule reminders to my class Discord?', a: 'Yes. Add the SocialMate bot to your server, pick the channel and schedule the reminder. Campaign mode can repeat it every week.' },
      { q: 'Is it free for teachers?', a: 'Yes. The free plan schedules up to 250 posts a month to Discord, Telegram, LinkedIn, Bluesky and Mastodon.' },
      { q: 'Can a teaching assistant post too?', a: 'Yes. The free plan has 2 seats. Invite them as an Editor.' },
    ],
    related: [
      { href: '/for/coaches', label: 'SocialMate for coaches' },
      { href: '/for/discord-communities', label: 'Discord announcement scheduler' },
      { href: '/for/telegram-channels', label: 'Telegram channel scheduler' },
    ],
  },
  {
    slug: 'event-organizers',
    title: 'Free Event Promotion Scheduler',
    description: 'Run an event countdown across Discord, Telegram, Bluesky, LinkedIn, Mastodon and X, with start times that show in every attendee\'s time zone. Free plan included.',
    eyebrow: 'For event organizers, meetups and conventions',
    h1: 'Run your event countdown on autopilot',
    answer: 'SocialMate runs your event promotion as a campaign: up to 20 messages, like the date, the speakers and the ticket link, posted in turn on the days you pick until the event, to Discord, Telegram, Bluesky, LinkedIn, Mastodon and X. Campaigns keep going past your plan\'s scheduling window, up to 26 weeks. The free plan covers 250 posts a month.',
    features: [
      { icon: 'repeat', title: 'A countdown that runs itself', body: 'Set the messages, days and times once. Campaign mode posts them in turn until the end date.' },
      { icon: 'clock', title: 'Times in every zone', body: 'The free Discord timestamp generator makes start times that show in each attendee\'s own time zone.' },
      { icon: 'users', title: 'Community channels', body: 'Post to your Discord server and Telegram group, where attendees actually read announcements.' },
      { icon: 'users', title: 'A team on one calendar', body: 'The free plan has 2 seats, Pro 5 and Agency 15, so volunteers can schedule posts and the owner sees them all.' },
    ],
    steps: [
      'Create a free SocialMate account and connect your platforms.',
      'Open Campaigns and add your messages, days, times and the event date as the end.',
      'Add one-off posts, like "doors open now", in Compose.',
      'Watch the Queue fill in as the event gets closer.',
    ],
    limits: [
      'SocialMate does not sell tickets or post to Eventbrite, Meetup or Facebook Events.',
      'Single posts can be scheduled 2 weeks ahead on the free plan and a month ahead on Pro; campaigns top up daily within that window.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'How do I promote an event on Discord and Telegram at the same time?', a: 'Connect both in SocialMate, write the announcement once and pick both. Or set up a campaign to repeat it until the event.' },
      { q: 'Can I schedule posts months before the event?', a: 'Campaigns run up to 26 weeks and add each day\'s posts as it comes within your scheduling window. Single posts go up to 2 weeks ahead on the free plan, a month on Pro.' },
      { q: 'Is it free?', a: 'Yes. The free plan schedules up to 250 posts a month to Discord, Telegram, Bluesky, Mastodon and LinkedIn. X needs Pro, $8 a month.' },
    ],
    related: [
      { href: '/tools/discord-timestamp', label: 'Free Discord timestamp generator' },
      { href: '/for/discord-communities', label: 'Discord announcement scheduler' },
      { href: '/for/nonprofits', label: 'SocialMate for nonprofits' },
    ],
  },
  {
    slug: 'journalists',
    title: 'Free Scheduler for Journalists on Bluesky, Mastodon and LinkedIn',
    description: 'Share your stories on Bluesky, Mastodon, LinkedIn and X, with real threads and posts timed for when readers are online. Free plan included.',
    eyebrow: 'For journalists and reporters',
    h1: 'Share your stories where readers moved to',
    answer: 'SocialMate schedules links to your stories on Bluesky, Mastodon, LinkedIn and X, and posts real threads that reply part by part. Share a piece when it goes live, then again for readers in other time zones, from one place. The free plan covers 250 posts a month.',
    features: [
      { icon: 'send', title: 'Bluesky and Mastodon together', body: 'Post the same story to Bluesky and any Mastodon instance at once, and to LinkedIn.' },
      { icon: 'thread', title: 'Real threads', body: 'Post a thread of key findings right away, each part replying to the one before, on Bluesky, Mastodon or X.' },
      { icon: 'clock', title: 'Timed for readers', body: 'Schedule the second share for the morning in another time zone, so it does not land at 3am.' },
      { icon: 'reply', title: 'Mentions in one inbox', body: 'See Bluesky and Mastodon mentions in one place and reply without switching apps.' },
    ],
    steps: [
      'Create a free SocialMate account.',
      'Connect Bluesky, Mastodon, LinkedIn or X.',
      'Paste your story link in Compose, write the line that makes people click and pick a time.',
      'Check the Queue for what goes out next.',
    ],
    limits: [
      'SocialMate does not post to Threads, Facebook or Instagram.',
      'It does not post to a newsroom\'s LinkedIn company page; LinkedIn is personal profiles only.',
      'Posting to X needs the Pro plan.',
    ],
    faq: [
      { q: 'Is there a free scheduler for Bluesky and Mastodon?', a: 'Yes. SocialMate\'s free plan schedules up to 250 posts a month to Bluesky, Mastodon, LinkedIn, Discord and Telegram. X needs Pro, $8 a month.' },
      { q: 'Can I post a thread to Bluesky and Mastodon at once?', a: 'Yes. Write it once in the thread builder, pick both and post it now; each part replies to the one before on each platform.' },
      { q: 'Can I reply to mentions from SocialMate?', a: 'Yes, on Bluesky and Mastodon, from the inbox.' },
    ],
    related: [
      { href: '/for/bluesky-creators', label: 'Bluesky scheduler' },
      { href: '/for/mastodon-users', label: 'Mastodon scheduler' },
      { href: '/tools/thread-splitter', label: 'Free thread splitter' },
    ],
  },
]

export function audienceFor(slug: string): Audience | undefined {
  return AUDIENCES.find(a => a.slug === slug)
}
