import type { Metadata } from 'next'
import { ADDONS, usd } from '@/lib/site-facts'

// /hermes had no metadata of its own, so search results showed the home page
// title for it. The signed-in HERMES screens below it share this layout; they
// are not indexed, so inheriting the landing's canonical is harmless.
const [starter, pro] = ADDONS.hermes

export const metadata: Metadata = {
  title: 'HERMES: Cold Outreach by Email, Bluesky and Mastodon',
  description: `HERMES finds prospects and writes personal outreach sequences for email, Bluesky and Mastodon. A SocialMate add-on: ${usd(starter.monthly)}/month Starter or ${usd(pro.monthly)}/month Pro.`,
  alternates: { canonical: 'https://socialmate.studio/hermes' },
  openGraph: {
    title: 'HERMES: Cold Outreach by Email, Bluesky and Mastodon',
    url: 'https://socialmate.studio/hermes',
  },
}

export default function HermesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
