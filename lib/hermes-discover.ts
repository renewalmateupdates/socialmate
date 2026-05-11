const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const EMAIL_BLOCK = [
  'substack.com', 'beehiiv.com', 'ghost.io', 'example.com', 'sentry.io',
  'amazonaws.com', 'cloudflare.com', 'google.com', 'wix.com', 'squarespace.com',
  'mailchimp.com', 'convertkit.com', 'hubspot.com', 'zendesk.com', 'intercom.io',
  'typeform.com', 'notion.so', 'airtable.com', 'stripe.com',
]

export type DiscoveredProspect = {
  name: string
  email: string
  company: string | null
  notes: string | null
  source: string
}

export function parseDiscoverConfig(apolloQuery: string | null): { keyword: string; sources: string[] } {
  if (!apolloQuery) return { keyword: 'technology', sources: ['substack', 'github', 'devto', 'hashnode'] }
  try {
    const parsed = JSON.parse(apolloQuery)
    return { keyword: parsed.keyword ?? 'technology', sources: parsed.sources ?? ['substack'] }
  } catch {
    return { keyword: apolloQuery, sources: ['substack'] }
  }
}

function isValidEmail(email: string): boolean {
  const lower = email.toLowerCase()
  const [local, domain] = lower.split('@')
  if (!domain || local.length < 2) return false
  if (EMAIL_BLOCK.some(d => domain.includes(d))) return false
  if (/^(noreply|no-reply|donotreply|admin|support|billing|help|webmaster|postmaster|abuse|spam)/.test(local)) return false
  return true
}

function extractEmails(html: string): string[] {
  const mailto = Array.from(html.matchAll(/href="mailto:([^"?&\s]+)/gi))
    .map(m => m[1].toLowerCase()).filter(isValidEmail)
  if (mailto.length > 0) return Array.from(new Set(mailto))
  const plain = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [])
    .map(e => e.toLowerCase()).filter(isValidEmail)
  return Array.from(new Set(plain))
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      headers: { 'User-Agent': BOT_UA },
      signal: AbortSignal.timeout(5000),
    })
    return res.ok ? await res.text() : null
  } catch { return null }
}

async function findEmailAtUrl(url: string): Promise<string | null> {
  if (!url) return null
  const html = await fetchHtml(url)
  if (!html) return null
  return extractEmails(html)[0] ?? null
}

// ── Substack ──────────────────────────────────────────────────────────────

const SUBSTACK_CAT: Record<string, string> = {
  technology: 'technology', tech: 'technology', javascript: 'technology', coding: 'technology',
  software: 'technology', saas: 'technology', webdev: 'technology', developer: 'technology',
  ai: 'technology', startup: 'business', business: 'business', entrepreneur: 'business',
  founder: 'business', marketing: 'business', growth: 'business',
  creator: 'culture', creative: 'culture', design: 'culture', art: 'culture',
  science: 'science', health: 'health', fitness: 'health',
}

async function findEmailForSubstack(subdomain: string, customDomain?: string | null): Promise<string | null> {
  try {
    const res = await fetch(`https://${subdomain}.substack.com/api/v1/pub`, {
      headers: { 'User-Agent': BOT_UA }, signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const d = await res.json()
      if (d?.contact_email && isValidEmail(d.contact_email)) return d.contact_email.toLowerCase()
      if (d?.author?.email && isValidEmail(d.author.email)) return d.author.email.toLowerCase()
    }
  } catch { /* continue */ }

  const pages = [
    `https://${subdomain}.substack.com/about`,
    customDomain ? `https://${customDomain}/about` : null,
    customDomain ? `https://${customDomain}/contact` : null,
    customDomain ? `https://${customDomain}` : null,
  ].filter(Boolean) as string[]

  for (const url of pages) {
    const email = await findEmailAtUrl(url)
    if (email) return email
  }
  return null
}

async function discoverSubstack(keyword: string, limit: number): Promise<DiscoveredProspect[]> {
  const category = SUBSTACK_CAT[keyword.toLowerCase()] ?? 'technology'
  const res = await fetch(
    `https://substack.com/api/v1/leaderboard?category=${encodeURIComponent(category)}&limit=${limit * 2}&page=0`,
    { headers: { 'User-Agent': BOT_UA } }
  )
  if (!res.ok) return []

  const pubs: Array<{ name: string; subdomain: string; custom_domain?: string | null; author_name?: string | null }>
    = (await res.json()).publications ?? []

  const results: DiscoveredProspect[] = []
  for (const pub of pubs) {
    if (results.length >= limit) break
    const email = await findEmailForSubstack(pub.subdomain, pub.custom_domain)
    if (!email) continue
    results.push({ name: pub.author_name || pub.name, email, company: pub.name, notes: `substack.com/${pub.subdomain}`, source: 'substack' })
  }
  return results
}

// ── GitHub ────────────────────────────────────────────────────────────────

async function discoverGitHub(keyword: string, limit: number): Promise<DiscoveredProspect[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = { 'User-Agent': BOT_UA, 'Accept': 'application/vnd.github.v3+json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const q = encodeURIComponent(`${keyword} in:bio followers:>50`)
  const searchRes = await fetch(`https://api.github.com/search/users?q=${q}&per_page=${limit * 2}&sort=followers`, { headers })
  if (!searchRes.ok) return []

  const { items = [] } = await searchRes.json()
  const results: DiscoveredProspect[] = []

  for (const user of items) {
    if (results.length >= limit) break
    const profileRes = await fetch(`https://api.github.com/users/${user.login}`, { headers })
    if (!profileRes.ok) continue
    const p = await profileRes.json()

    let email: string | null = p.email && isValidEmail(p.email) ? p.email.toLowerCase() : null
    if (!email && p.blog) email = await findEmailAtUrl(p.blog)
    if (!email) continue

    results.push({
      name: p.name || p.login,
      email,
      company: p.company?.replace('@', '').trim() || null,
      notes: `github.com/${p.login}`,
      source: 'github',
    })
  }
  return results
}

// ── Dev.to ────────────────────────────────────────────────────────────────

async function discoverDevTo(keyword: string, limit: number): Promise<DiscoveredProspect[]> {
  const tag = keyword.toLowerCase().replace(/\s+/g, '')
  const res = await fetch(
    `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${limit * 2}&top=7`,
    { headers: { 'User-Agent': BOT_UA } }
  )
  if (!res.ok) return []

  const articles: Array<{
    user: { name: string; username: string; github_username?: string; website_url?: string }
  }> = await res.json()

  const seen = new Set<string>()
  const results: DiscoveredProspect[] = []

  for (const { user: u } of articles) {
    if (results.length >= limit) break
    if (seen.has(u.username)) continue
    seen.add(u.username)

    let email: string | null = null
    if (u.website_url) email = await findEmailAtUrl(u.website_url)

    if (!email && u.github_username) {
      const ghRes = await fetch(`https://api.github.com/users/${u.github_username}`, {
        headers: { 'User-Agent': BOT_UA, 'Accept': 'application/vnd.github.v3+json' },
      })
      if (ghRes.ok) {
        const gh = await ghRes.json()
        email = gh.email && isValidEmail(gh.email) ? gh.email.toLowerCase() : await findEmailAtUrl(gh.blog)
      }
    }

    if (!email) continue
    results.push({ name: u.name || u.username, email, company: null, notes: `dev.to/${u.username}`, source: 'devto' })
  }
  return results
}

// ── Hashnode ──────────────────────────────────────────────────────────────

async function discoverHashnode(keyword: string, limit: number): Promise<DiscoveredProspect[]> {
  const tag = keyword.toLowerCase().replace(/\s+/g, '-')
  const query = `{
    tag(slug: "${tag}") {
      posts(first: ${limit * 2}) {
        edges {
          node {
            author { name socialMediaLinks { website } }
            publication { url }
          }
        }
      }
    }
  }`

  const res = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': BOT_UA },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) return []

  const { data } = await res.json()
  const edges: Array<{ node: { author: { name: string; socialMediaLinks?: { website?: string } }; publication?: { url: string } } }>
    = data?.tag?.posts?.edges ?? []

  const seen = new Set<string>()
  const results: DiscoveredProspect[] = []

  for (const { node } of edges) {
    if (results.length >= limit) break
    const author = node?.author
    if (!author?.name || seen.has(author.name)) continue
    seen.add(author.name)

    let email: string | null = null
    if (author.socialMediaLinks?.website) email = await findEmailAtUrl(author.socialMediaLinks.website)
    if (!email && node?.publication?.url) email = await findEmailAtUrl(`${node.publication.url}/about`)
    if (!email) continue

    results.push({
      name: author.name,
      email,
      company: null,
      notes: node?.publication?.url ?? `hashnode/${tag}`,
      source: 'hashnode',
    })
  }
  return results
}

// ── Main export ───────────────────────────────────────────────────────────

export async function discoverProspects(params: {
  sources: string[]
  keyword: string
  limitPerSource: number
}): Promise<DiscoveredProspect[]> {
  const { sources, keyword, limitPerSource } = params
  const buckets = await Promise.allSettled([
    sources.includes('substack') ? discoverSubstack(keyword, limitPerSource) : Promise.resolve([]),
    sources.includes('github')   ? discoverGitHub(keyword, limitPerSource)   : Promise.resolve([]),
    sources.includes('devto')    ? discoverDevTo(keyword, limitPerSource)     : Promise.resolve([]),
    sources.includes('hashnode') ? discoverHashnode(keyword, limitPerSource)  : Promise.resolve([]),
  ])

  const all: DiscoveredProspect[] = []
  for (const result of buckets) {
    if (result.status === 'fulfilled') all.push(...result.value)
  }

  // Dedup by email across all sources
  const seen = new Set<string>()
  return all.filter(p => {
    if (seen.has(p.email)) return false
    seen.add(p.email)
    return true
  })
}
