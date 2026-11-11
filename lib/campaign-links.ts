import type { SupabaseClient } from '@supabase/supabase-js'
import { linkTargets, type CampaignMessage, type CampaignLink } from '@/lib/campaigns'

// Campaign link tracking (campaign mode phase 2). When a campaign is created
// with click counting on, every link in its messages gets a short link in
// `short_links`, owned by the campaign's creator, and the campaign's posts use
// the short link (lib/campaign-run.ts). /go/[slug] counts each click and
// redirects. The links also show on the creator's Link Shortener page.
//
// A link that can't get a short link is posted as written and just isn't
// counted: tracking never stops a campaign from being saved.

// No 0/o/1/l, so a slug read aloud or retyped comes out right.
const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'
const SLUG_LENGTH = 7

function newSlug(): string {
  const bytes = new Uint8Array(SLUG_LENGTH)
  globalThis.crypto.getRandomValues(bytes)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length]
  return s
}

async function insertShortLink(db: SupabaseClient, userId: string, url: string, title: string): Promise<string | null> {
  try {
    new URL(url)
  } catch {
    return null
  }
  // slug is UNIQUE: on the rare collision (23505) try another.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = newSlug()
    const { error } = await db.from('short_links').insert({ user_id: userId, slug, original_url: url, title })
    if (!error) return slug
    if (error.code !== '23505') {
      console.warn('[campaign-links] short link insert failed:', error.message)
      return null
    }
  }
  console.warn('[campaign-links] no free slug after 5 tries')
  return null
}

/** The messages with `links` filled in, and how many links could not be tracked. */
export async function addTrackedLinks(
  db: SupabaseClient,
  userId: string,
  campaignName: string,
  messages: CampaignMessage[],
): Promise<{ messages: CampaignMessage[]; tracked: number; untracked: number }> {
  const out: CampaignMessage[] = []
  let tracked = 0
  let untracked = 0
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]
    // AI versions keep every link of the message (acceptRewrite), so the
    // message's own links cover them; reading them too costs nothing.
    const urls = linkTargets([m.text].concat(m.variants ?? []))
    const links: CampaignLink[] = []
    for (const url of urls) {
      const slug = await insertShortLink(db, userId, url, `Campaign "${campaignName}", message ${i + 1}`.slice(0, 200))
      if (slug) { links.push({ url, slug }); tracked++ } else untracked++
    }
    out.push(links.length ? { ...m, links } : m)
  }
  return { messages: out, tracked, untracked }
}
