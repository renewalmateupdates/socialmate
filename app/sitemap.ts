import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isProtectedPath } from '@/lib/protected-paths'
import { POSTS } from '@/lib/blog/static-posts'
import { AUDIENCES } from '@/lib/audiences'

// Blog posts live in two places: the static POSTS map (lib/blog/static-posts.ts)
// and the `blog_posts` table. The sitemap lists exactly those two, the same merge
// generateStaticParams does.
//
// It used to merge the table with its own hand-maintained list of slugs instead,
// and 38 of them had no post at all. Each rendered a "coming soon" page with a
// 200, which a crawler reads as thin duplicate content. They are 404s now.
//
// Regenerated daily, so posts inserted with SQL appear without a deploy and a
// failed table lookup at build time heals within a day.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://socialmate.studio'
  const now  = new Date()

  const core: MetadataRoute.Sitemap = [
    { url: base,                          lastModified: now, changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/pricing`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/features`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/studio-stax`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/studio-stax/apply`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/give`,                lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/discount`,            lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tools`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tools/thread-splitter`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tools/discord-timestamp`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/signup`,              lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`,               lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/story`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/roadmap`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/affiliates`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/integrations`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/hashtag-collections`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/beta`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/blog`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/vs`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/gilgamesh`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/guides`,                          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/guides/starting-a-business`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/marketing-zero-budget`,       lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/business-credit-legal`,       lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/vibe-coding-with-ai`,         lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/creator-monetization`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/first-30-days-social-media`,  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/build-your-brand-from-zero`,  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/side-hustle-to-full-time-creator`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/content-creator-business`,    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/ai-tools-for-creators-2026`,  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/local-business-website`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/email-list-building`,          lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/seo-for-beginners`,            lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/guides/reddit-marketing`,             lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/support`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/changelog`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/for/streamers`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/agencies`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/small-business`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/tiktok`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/tiktok-creators`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/video-creators`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/linkedin-creators`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/fitness-coaches`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/musicians`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/restaurants`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/real-estate`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/nonprofits`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/podcasters`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/coaches`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/content-creators`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/for/bloggers`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/press`,                lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/referral`,           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/monetize`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/glossary`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/grants`,             lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/community`,          lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/achievements`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/challenge`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/zenith`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/enterprise`,         lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/soma`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/agents`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/monetize/hub`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/tiktok/studio`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
  ]

  const comparisons: MetadataRoute.Sitemap = [
    { url: `${base}/vs/hootsuite`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/buffer`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/later`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/sendible`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/metricool`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/publer`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/planable`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/sprout-social`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/socialpilot`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/zoho-social`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/socialrails`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/vs/loomly`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/coschedule`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/meetedgar`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/iconosquare`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/tailwind-social`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/crowdfire`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/pallyy`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/agorapulse`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/sprinklr`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/socialbee`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/contentstudio`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/missinglettr`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/postplanner`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/recurpost`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/nuelink`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/fedica`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/statusbrew`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/tweetdeck`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/eclincher`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/oktopost`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/napoleon-cat`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/hopper-hq`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/sked-social`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/onlypult`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/smarterqueue`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/hypefury`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/typefully`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/postcron`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/planly`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/vista-social`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/flick`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/canva`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/plann`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/social-champ`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/ripl`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/preview-app`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/gain-app`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/kontentino`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/unum`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/taplio`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/shield-app`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/tweethunter`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/circleboom`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/postly`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/promo-republic`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/socialoomph`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/tweepsmap`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/audiense`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/hubspot-social`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/semrush-social`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/later-free`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/storychief`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/oneup`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/brand24`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/post-beyond`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/combin`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/keystroke`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/mention`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/emplifi`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/postoplan`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/social-report`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/khoros`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/talkwalker`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/feedhive`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/postpickr`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/mailchimp`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/tiktok-native`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/substack`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/brandwatch`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/klaviyo`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/linktree`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/beehiiv`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/convertkit`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/notionhq`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/creatorstudio`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/discord-bots`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/tiktok-scheduler`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Same merge generateStaticParams does, so the sitemap and the set of pages
  // that actually build can no longer drift apart. A failure here degrades to
  // the static posts for a day (see revalidate above) rather than an empty sitemap.
  let dbSlugs: string[] = []
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug')
      .limit(2000)
    if (error) console.warn('[sitemap] blog_posts lookup failed:', error.message)
    else if (data) dbSlugs = data.map((row: { slug: string }) => row.slug)
  } catch (err) {
    console.warn('[sitemap] blog_posts lookup threw:', err)
  }

  const allSlugs = Array.from(new Set([...Object.keys(POSTS), ...dbSlugs]))

  const blogPosts: MetadataRoute.Sitemap = allSlugs.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Audience pages served by app/for/[slug], straight from their data file.
  const audiencePages: MetadataRoute.Sitemap = AUDIENCES.map(a => ({
    url: `${base}/for/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Final guard: a duplicate <loc> is wasted crawl budget, and core/comparisons
  // are hand-maintained lists and can pick one up.
  // Sign-in-only pages are dropped too: eight of them were listed here, and a
  // search engine sent to one only ever gets a redirect to /login.
  const seen = new Set<string>()
  return [...core, ...comparisons, ...audiencePages, ...blogPosts].filter(entry => {
    if (isProtectedPath(new URL(entry.url).pathname)) return false
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}
