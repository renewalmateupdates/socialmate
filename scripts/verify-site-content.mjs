#!/usr/bin/env node
/**
 * Fails when something the site says disagrees with what the product does.
 *
 *   npm run verify:content                 static checks (no network, no keys)
 *   npm run verify:content -- --db         also every post in blog_posts (read-only, needs .env.local)
 *   npm run verify:content -- --crawl http://localhost:3000
 *                                          also fetch every sitemap URL from a running build
 *   --report <file.json>                   write every finding to a file
 *   --db-file <dump.json>                  use a saved blog_posts dump instead of the network
 *   --external                             with --crawl: also check links that leave the site
 *
 * Static checks:
 *   1. Copies of a number in files nobody may casually edit (the Stripe
 *      webhook, the publish pipeline, the credit reset) equal lib/site-facts.ts.
 *   2. No page, component, email, locale file or public text file states a
 *      price, plan limit, platform or feature that site-facts does not.
 *      Rules: scripts/lib/content-rules.mjs. Accepted exceptions, each with a
 *      reason: scripts/verify-content-allow.json.
 *   3. Every internal link in the source points at a route that exists.
 *   4. lib/generated/public-routes.json lists exactly the public pages on disk.
 *   5. robots.txt names the sitemap, blocks sign-in pages and no public page.
 *   6. /llms.txt, /llms-full.txt and /ai.txt link only to pages that exist.
 *   7. Every public page defines a title, a description and a canonical URL.
 *
 * Exit code 1 on any finding that is not in the allow file.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadTs, repoRoot as root } from './lib/load-ts.mjs'
import { buildRules, checkText } from './lib/content-rules.mjs'
import { APP_ONLY, LOCALE_PREFIXES, discover } from './gen-route-manifest.mjs'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }

const facts = loadTs(join(root, 'lib/site-facts.ts'))
const rules = buildRules(facts)
const posix = (p) => p.split(sep).join('/')
const read = (rel) => readFileSync(join(root, rel), 'utf8').replace(/\r\n/g, '\n')

/** @type {{ check: string, file: string, line?: number, rule?: string, message: string, sentence?: string }[]} */
const findings = []
const notes = []
const add = (check, file, message, extra = {}) => findings.push({ check, file, message, ...extra })

// ─── Allow list ─────────────────────────────────────────────────────────────

const allowFile = join(root, 'scripts/verify-content-allow.json')
const allow = existsSync(allowFile) ? JSON.parse(readFileSync(allowFile, 'utf8')).allow : []
const allowUsed = new Set()

function isAllowed(f) {
  for (let i = 0; i < allow.length; i++) {
    const a = allow[i]
    if (a.rule && a.rule !== f.rule && a.rule !== f.check) continue
    if (a.file) {
      const ok = a.file.endsWith('*') ? f.file.startsWith(a.file.slice(0, -1)) : f.file === a.file
      if (!ok) continue
    }
    if (a.contains && !(f.sentence || f.message).includes(a.contains)) continue
    allowUsed.add(i)
    return true
  }
  return false
}

// ─── Files ──────────────────────────────────────────────────────────────────

function walk(dir, test, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'generated') continue
      walk(full, test, out)
    } else if (test(full)) out.push(full)
  }
  return out
}

/** Source without comments, so a note about an old bug is not read as a claim. */
function stripComments(src) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, lead) => lead + ' '.repeat(m.length - lead.length))
}

/** Copy people read: pages, components, the content in lib, locale files, public text. */
function contentFiles() {
  const isSource = (f) => /\.(tsx|ts)$/.test(f) && !/\.d\.ts$/.test(f)
  const files = [
    ...walk(join(root, 'app'), isSource).filter(f => !posix(relative(root, f)).startsWith('app/admin/')),
    ...walk(join(root, 'components'), isSource),
    ...walk(join(root, 'contexts'), isSource),
    ...walk(join(root, 'lib'), isSource),
    ...walk(join(root, 'messages'), (f) => f.endsWith('.json')),
    ...walk(join(root, 'public'), (f) => /\.(txt|json|html|svg)$/.test(f)),
    ...walk(join(root, 'browser-extension'), (f) => /\.(json|html|js)$/.test(f)),
  ]
  return files.map(f => posix(relative(root, f)))
}

// ─── 1. Guarded copies ──────────────────────────────────────────────────────

function checkGuardedCopies() {
  const { PLANS, STRIPE_PLAN_PRICE_IDS, AI_TOOLS } = facts
  const table = (file, name) => {
    const src = read(file)
    const start = src.indexOf(name)
    if (start < 0) { add('guarded-copy', file, `${name} is gone. Update scripts/verify-site-content.mjs to match where the number lives now.`); return null }
    const body = src.slice(start, src.indexOf('}', start) + 1)
    const out = {}
    for (const m of body.matchAll(/\b(free|pro|agency)\s*:\s*(\d+)/g)) out[m[1]] = Number(m[2])
    return out
  }
  const expect = (file, name, field) => {
    const got = table(file, name)
    if (!got) return
    for (const tier of ['free', 'pro', 'agency']) {
      if (got[tier] !== PLANS[tier][field]) {
        add('guarded-copy', file, `${name}.${tier} is ${got[tier]}, lib/plan.ts says ${PLANS[tier][field]} (${field})`)
      }
    }
  }
  expect('app/api/stripe/webhook/route.ts', 'const PLAN_CREDITS', 'aiCreditsPerMonth')
  expect('app/api/cron/reset-credits/route.ts', 'const PLAN_CREDITS', 'aiCreditsPerMonth')
  expect('lib/inngest.ts', 'const CREDIT_MAP', 'aiCreditsPerMonth')
  expect('lib/publish/twitter.ts', 'const TWITTER_QUOTA', 'xPostsPerMonth')
  expect('app/api/accounts/twitter/quota/route.ts', 'const limits', 'xPostsPerMonth')
  expect('app/api/tiktok/post/route.ts', 'const PLAN_TIKTOK_QUOTA', 'tiktokVideosPerMonth')
  expect('app/api/tiktok/confirm-upload/route.ts', 'const PLAN_TIKTOK_QUOTA', 'tiktokVideosPerMonth')

  // Checkout screens and the webhook each name the four plan prices.
  const ids = [
    ['STRIPE_PRO_PRICE_ID', STRIPE_PLAN_PRICE_IDS.proMonthly],
    ['STRIPE_AGENCY_PRICE_ID', STRIPE_PLAN_PRICE_IDS.agencyMonthly],
    ['STRIPE_PRO_ANNUAL_PRICE_ID', STRIPE_PLAN_PRICE_IDS.proAnnual],
    ['STRIPE_AGENCY_ANNUAL_PRICE_ID', STRIPE_PLAN_PRICE_IDS.agencyAnnual],
  ]
  for (const file of ['components/Sidebar.tsx', 'app/settings/page.tsx', 'app/onboarding/OnboardingClient.tsx', 'app/pricing/page.tsx', 'app/api/stripe/webhook/route.ts']) {
    const src = read(file)
    for (const [name, id] of ids) {
      const m = src.match(new RegExp(`const ${name}\\s*=\\s*'([^']+)'`))
      if (m && m[1] !== id) add('guarded-copy', file, `${name} is ${m[1]}, lib/site-facts.ts says ${id}`)
    }
  }

  // What the AI route charges against what the site quotes.
  const aiRoute = read('app/api/ai/route.ts')
  const costs = {}
  const block = aiRoute.slice(aiRoute.indexOf('const CREDIT_COSTS'), aiRoute.indexOf('}', aiRoute.indexOf('const CREDIT_COSTS')) + 1)
  for (const m of block.matchAll(/^\s*(\w+):\s*(\d+)/gm)) costs[m[1]] = Number(m[2])
  const routeName = { Caption: 'caption', Rewrite: 'rewrite', Hook: 'hook', Thread: 'thread', Repurpose: 'repurpose', Hashtags: 'hashtags', 'Post Score': 'score', 'SM-Pulse': 'pulse', 'SM-Radar': 'radar', 'Content Gaps': 'content_gap' }
  for (const tool of AI_TOOLS) {
    const key = routeName[tool.name]
    if (key && costs[key] !== tool.credits) add('guarded-copy', 'app/api/ai/route.ts', `CREDIT_COSTS.${key} is ${costs[key]}, lib/site-facts.ts quotes ${tool.credits} for ${tool.name}`)
  }
}

// ─── 2. Claims in source ────────────────────────────────────────────────────

function checkClaims(files) {
  for (const file of files) {
    // The rules and facts themselves, and the changelog (a dated record of what was true then).
    if (file === 'lib/site-facts.ts' || file.startsWith('lib/generated/')) continue
    const raw = read(file)
    const text = /\.(tsx|ts|js)$/.test(file) ? stripComments(raw) : raw
    for (const f of checkText(text, rules)) {
      add('claim', file, `${f.why}: "${f.hit}"`, { line: f.line, rule: f.rule, sentence: f.sentence })
    }
  }
}

// ─── 3. Routes and links ────────────────────────────────────────────────────

function buildRouteTable() {
  const staticRoutes = new Set(['/'])
  const dynamic = []
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) { visit(full); continue }
      if (!/^(page\.tsx|route\.ts|route\.tsx)$/.test(entry.name)) continue
      const parts = posix(relative(join(root, 'app'), dirname(full))).split('/').filter(Boolean)
        .filter(p => !(p.startsWith('(') && p.endsWith(')')))
      const route = '/' + parts.join('/')
      if (route.includes('[')) {
        const re = '^' + route.replace(/\[\.\.\.[^\]]+\]/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+') + '$'
        dynamic.push(new RegExp(re))
      } else staticRoutes.add(route === '/' ? '/' : route)
    }
  }
  visit(join(root, 'app'))
  // Files Next serves from app/ by convention.
  for (const [file, route] of [['app/sitemap.ts', '/sitemap.xml'], ['app/robots.ts', '/robots.txt'], ['app/icon.png', '/icon.png'], ['app/apple-icon.png', '/apple-icon.png']]) {
    if (existsSync(join(root, file))) staticRoutes.add(route)
  }
  const publicFiles = new Set(walk(join(root, 'public'), () => true).map(f => '/' + posix(relative(join(root, 'public'), f))))
  return { staticRoutes, dynamic, publicFiles }
}

function knownBlogSlugs(dbSlugs) {
  const { POSTS } = loadTs(join(root, 'lib/blog/static-posts.ts'))
  return new Set([...Object.keys(POSTS), ...(dbSlugs ?? [])])
}

function makeResolver(table, blogSlugs, haveDb) {
  const { AUDIENCES } = loadTs(join(root, 'lib/audiences.ts'))
  const audienceSlugs = new Set(AUDIENCES.map(a => a.slug))
  /** null when the link is fine, else why it is not. */
  return (href) => {
    let path = href.replace(/^https?:\/\/(www\.)?socialmate\.studio/, '') || '/'
    path = path.split('#')[0].split('?')[0]
    if (path.length > 1) path = path.replace(/\/$/, '')
    if (!path.startsWith('/')) return null
    if (path.startsWith('//')) return null
    if (table.staticRoutes.has(path) || table.publicFiles.has(path)) return null
    const blog = path.match(/^\/blog\/([^/]+)$/)
    if (blog) {
      if (blogSlugs.has(blog[1])) return null
      return haveDb ? 'no such blog post' : 'skip'
    }
    const aud = path.match(/^\/for\/([^/]+)$/)
    if (aud) return audienceSlugs.has(aud[1]) ? null : 'no such audience page'
    if (/^\/(_next|api)\//.test(path)) return table.dynamic.some(re => re.test(path)) || path.startsWith('/_next/') ? null : 'no such API route'
    if (table.dynamic.some(re => re.test(path))) return null
    return 'no such page'
  }
}

/** Literal internal links in a piece of source or content. */
function extractLinks(text) {
  const links = []
  const patterns = [
    /href\s*=\s*\{?\s*["'`](\/[^"'`\s${}]*)["'`]/g,
    /href\s*:\s*["'`](\/[^"'`\s${}]*)["'`]/g,
    /(?:router\.(?:push|replace)|redirect|permanentRedirect)\(\s*["'`](\/[^"'`\s${}]*)["'`]/g,
    /\]\((\/[^)\s]*)\)/g,
    /(https?:\/\/(?:www\.)?socialmate\.studio(?:\/[^\s"'`)<>\]}]*)?)/g,
  ]
  const lineOf = (index) => text.slice(0, index).split('\n').length
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      let href = m[1].replace(/[.,;:!]+$/, '')
      if (/\[|\]|\*|\.\.\./.test(href)) continue // a pattern in docs, not a link
      links.push({ href, line: lineOf(m.index) })
    }
  }
  return links
}

function checkSourceLinks(files, resolve) {
  let skipped = 0
  for (const file of files) {
    if (!/\.(tsx|ts|txt|json)$/.test(file) || file.startsWith('messages/')) continue
    const text = /\.(tsx|ts)$/.test(file) ? stripComments(read(file)) : read(file)
    for (const { href, line } of extractLinks(text)) {
      const problem = resolve(href)
      if (problem === 'skip') { skipped++; continue }
      if (problem) add('link', file, `${href}: ${problem}`, { line, sentence: href })
    }
  }
  if (skipped) notes.push(`${skipped} blog links in source were not checked (run with --db to check them against the table).`)
}

// ─── 4. Manifest ────────────────────────────────────────────────────────────

function checkManifest() {
  const file = 'lib/generated/public-routes.json'
  if (!existsSync(join(root, file))) { add('manifest', file, 'missing. Run: npm run gen:routes'); return [] }
  const have = JSON.parse(read(file)).routes.map(r => r.path)
  const want = discover().map(r => r.path)
  for (const p of want) if (!have.includes(p)) add('manifest', file, `${p} is a public page that is not listed. Run: npm run gen:routes`)
  for (const p of have) if (!want.includes(p)) add('manifest', file, `${p} is listed but has no page. Run: npm run gen:routes`)
  return want
}

// ─── 5. robots.txt ──────────────────────────────────────────────────────────

function checkRobots(publicRoutes) {
  const file = 'app/robots.ts'
  const robots = loadTs(join(root, file)).default()
  if (robots.sitemap !== `${facts.BRAND.url}/sitemap.xml`) add('robots', file, `sitemap is ${robots.sitemap}, expected ${facts.BRAND.url}/sitemap.xml`)
  const ruleList = Array.isArray(robots.rules) ? robots.rules : [robots.rules]
  const star = ruleList.find(r => r.userAgent === '*')
  if (!star) { add('robots', file, 'no rule for every crawler (userAgent "*")'); return }
  const blocked = (path, disallow) => (Array.isArray(disallow) ? disallow : [disallow]).filter(Boolean).some(rule =>
    rule.endsWith('$') ? path === rule.slice(0, -1) : path.startsWith(rule))
  for (const rule of ruleList) {
    for (const path of publicRoutes) {
      if (blocked(path, rule.disallow)) add('robots', file, `${path} is a public page but robots.txt blocks it for ${rule.userAgent}`)
    }
  }
  const { PROTECTED_PATHS } = loadTs(join(root, 'lib/protected-paths.ts'))
  for (const path of [...PROTECTED_PATHS, '/admin', '/api/posts/create']) {
    if (!blocked(path, star.disallow)) add('robots', file, `${path} needs a sign-in (or is not content) but robots.txt lets crawlers in`)
  }
}

// ─── 6. llms.txt and friends ────────────────────────────────────────────────

function checkLlms(resolve) {
  const file = 'lib/llms.ts'
  if (!existsSync(join(root, file))) { add('llms', file, 'missing: /llms.txt has no generator'); return }
  const llms = loadTs(join(root, file))
  for (const [name, text] of [['/llms.txt', llms.buildLlmsTxt([])], ['/llms-full.txt', llms.buildLlmsFullTxt([])], ['/ai.txt', llms.buildAiTxt()]]) {
    if (name !== '/ai.txt') {
      if (!/^# \S/.test(text)) add('llms', name, 'must start with an H1 title (llmstxt.org)')
      if (!/^> \S/m.test(text.split('\n').slice(1, 6).join('\n'))) add('llms', name, 'must have a blockquote summary right after the title (llmstxt.org)')
    }
    for (const { href } of extractLinks(text)) {
      const problem = resolve(href)
      if (problem && problem !== 'skip') add('llms', name, `${href}: ${problem}`)
    }
    for (const f of checkText(text, rules)) add('claim', name, `${f.why}: "${f.hit}"`, { line: f.line, rule: f.rule, sentence: f.sentence })
  }
}

// ─── 7. Metadata defined in source ──────────────────────────────────────────

function checkMetadataDefined(publicRoutes) {
  const routeFile = new Map()
  for (const f of walk(join(root, 'app'), (p) => p.endsWith(`${sep}page.tsx`))) {
    const parts = posix(relative(join(root, 'app'), dirname(f))).split('/').filter(Boolean).filter(p => !(p.startsWith('(') && p.endsWith(')')))
    routeFile.set('/' + parts.join('/'), f)
  }
  for (const route of publicRoutes) {
    const page = routeFile.get(route)
    if (!page) continue
    // The page itself, then each layout up to (not including) the root layout.
    const sources = [page]
    let dir = dirname(page)
    while (dir !== join(root, 'app') && dir.startsWith(join(root, 'app'))) {
      if (existsSync(join(dir, 'layout.tsx'))) sources.push(join(dir, 'layout.tsx'))
      dir = dirname(dir)
    }
    // A page that builds its metadata in a helper (the landing) names the helper's file.
    const text = sources.map(s => readFileSync(s, 'utf8')).join('\n')
    const helper = text.match(/generateLocaleMetadata|generateMetadata/) ? read('components/pages/Landing.tsx') : ''
    const all = text + helper
    const rel = posix(relative(root, page))
    if (!/\b(metadata|generateMetadata)\b/.test(all)) { add('metadata', rel, `${route} sets no metadata of its own, so it inherits the home page title`); continue }
    if (!/\btitle\s*:/.test(all)) add('metadata', rel, `${route} has no title`)
    if (!/\bdescription\s*:/.test(all)) add('metadata', rel, `${route} has no meta description`)
    if (!/\bcanonical\s*:/.test(all)) add('metadata', rel, `${route} has no canonical URL`)
  }
}

// ─── --db: blog posts ───────────────────────────────────────────────────────

async function loadBlogPosts() {
  const dump = value('--db-file')
  if (dump) return JSON.parse(readFileSync(dump, 'utf8'))
  const envFile = join(root, '.env.local')
  if (!existsSync(envFile)) throw new Error('--db needs .env.local (or pass --db-file <dump.json>)')
  const env = Object.fromEntries(readFileSync(envFile, 'utf8').split(/\r?\n/).filter(l => /^[A-Z0-9_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] }))
  const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('--db needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  const rows = []
  for (let from = 0; ; from += 500) {
    // GET only: this script never writes to the database.
    const res = await fetch(`${url}/rest/v1/blog_posts?select=slug,title,excerpt,content,category,author,published_at,updated_at&order=created_at.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 499}` },
    })
    if (!res.ok) throw new Error(`blog_posts read failed: HTTP ${res.status}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < 500) break
  }
  return rows
}

function checkBlogPosts(posts, resolve) {
  const titles = new Map()
  for (const post of posts) {
    const file = `blog_posts/${post.slug}`
    const text = [post.title, post.excerpt || '', post.content || ''].join('\n\n')
    for (const f of checkText(text, rules)) add('claim', file, `${f.why}: "${f.hit}"`, { line: f.line, rule: f.rule, sentence: f.sentence })
    for (const { href } of extractLinks(post.content || '')) {
      const problem = resolve(href)
      if (problem && problem !== 'skip') add('link', file, `${href}: ${problem}`, { sentence: href })
    }
    if (!post.title?.trim()) add('blog', file, 'no title')
    if (!post.excerpt?.trim()) add('blog', file, 'no excerpt (it is the meta description)')
    if ((post.content || '').trim().length < 600) add('blog', file, `thin post: ${(post.content || '').trim().length} characters`)
    const key = (post.title || '').trim().toLowerCase()
    if (key) { if (titles.has(key)) add('blog', file, `same title as blog_posts/${titles.get(key)}`); else titles.set(key, post.slug) }
  }
}

// ─── --crawl: a running build ───────────────────────────────────────────────

async function crawl(origin, resolve) {
  const get = async (url, method = 'GET') => {
    try {
      const res = await fetch(url, { method, redirect: 'manual', headers: { 'user-agent': 'socialmate-verify-content' } })
      return { status: res.status, location: res.headers.get('location'), type: res.headers.get('content-type') || '', text: method === 'GET' ? await res.text() : '' }
    } catch (err) {
      return { status: 0, location: null, type: '', text: '', error: String(err) }
    }
  }
  const pool = async (items, size, fn) => {
    const queue = [...items]
    await Promise.all(Array.from({ length: size }, async () => { while (queue.length) await fn(queue.shift()) }))
  }
  const local = (url) => url.replace(/^https?:\/\/(www\.)?socialmate\.studio/, origin)

  const sitemap = await get(`${origin}/sitemap.xml`)
  if (sitemap.status !== 200) { add('crawl', '/sitemap.xml', `HTTP ${sitemap.status}`); return }
  const urls = Array.from(sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1])
  notes.push(`crawl: ${urls.length} URLs in the sitemap`)
  for (const u of urls) if (!u.startsWith(facts.BRAND.url)) add('crawl', '/sitemap.xml', `${u} is not on ${facts.BRAND.url}`)

  const robots = await get(`${origin}/robots.txt`)
  if (robots.status !== 200) add('crawl', '/robots.txt', `HTTP ${robots.status}`)
  else if (!robots.text.includes(`Sitemap: ${facts.BRAND.url}/sitemap.xml`)) add('crawl', '/robots.txt', 'does not name the sitemap')
  for (const path of ['/llms.txt', '/llms-full.txt', '/ai.txt', '/blog/feed.xml', '/manifest.json', '/humans.txt']) {
    const res = await get(`${origin}${path}`)
    if (res.status !== 200) add('crawl', path, `HTTP ${res.status}`)
  }

  const titles = new Map(), descriptions = new Map()
  const internal = new Map() // href -> first page that links it
  const external = new Map()
  const pageStats = { ok: 0 }
  await pool(urls, 8, async (url) => {
    const path = url.replace(facts.BRAND.url, '') || '/'
    const res = await get(local(url))
    if (res.status !== 200) { add('crawl', path, `in the sitemap but answers HTTP ${res.status}${res.location ? ` -> ${res.location}` : ''}`); return }
    pageStats.ok++
    const html = res.text
    const head = html.slice(0, html.indexOf('</head>') > 0 ? html.indexOf('</head>') : 20000)
    const title = (head.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1]?.trim()
    const desc = (head.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/) || [])[1]?.trim()
    const canonical = (head.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/) || [])[1]
    const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(head)
    if (!title) add('crawl', path, 'no <title>')
    else { if (titles.has(title)) add('crawl', path, `same <title> as ${titles.get(title)}: "${title}"`); else titles.set(title, path) }
    if (!desc) add('crawl', path, 'no meta description')
    else { if (descriptions.has(desc)) add('crawl', path, `same meta description as ${descriptions.get(desc)}`); else descriptions.set(desc, path) }
    if (!canonical) add('crawl', path, 'no canonical link')
    else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) add('crawl', path, `canonical is ${canonical}, the sitemap lists ${url}`)
    if (noindex) add('crawl', path, 'is noindex but listed in the sitemap')
    const h1 = (html.match(/<h1[\s>]/g) || []).length
    if (h1 !== 1) add('crawl', path, `${h1} <h1> elements (expected 1)`)
    if (!/<meta[^>]+property="og:title"/.test(head)) add('crawl', path, 'no og:title')
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      let data
      try { data = JSON.parse(m[1]) } catch { add('crawl', path, 'JSON-LD does not parse'); continue }
      const visit = (node) => {
        if (!node || typeof node !== 'object') return
        if (Array.isArray(node)) { node.forEach(visit); return }
        if (node['@type'] === 'Offer' && typeof node.name === 'string') {
          const tier = /Agency/.test(node.name) ? 'agency' : /Pro\b/.test(node.name) ? 'pro' : /Free/.test(node.name) ? 'free' : null
          if (tier && !/White Label|HERMES|SOMA/.test(node.name) && node.price != null) {
            const ok = [facts.PLANS[tier].monthly, facts.PLANS[tier].annual].includes(Number(node.price))
            if (!ok) add('crawl', path, `JSON-LD offer "${node.name}" is priced ${node.price}`)
          }
        }
        if (node['@type'] === 'AggregateRating' || node.aggregateRating) add('crawl', path, 'JSON-LD has a rating, and there is no review system to back one')
        Object.values(node).forEach(visit)
      }
      visit(data)
    }
    const body = html.slice(html.indexOf('<body'))
    for (const m of body.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const href = m[1].replace(/&amp;/g, '&')
      if (href.startsWith('/') && !href.startsWith('//')) { if (!internal.has(href)) internal.set(href, path) }
      else if (/^https?:\/\/(www\.)?socialmate\.studio/.test(href)) { if (!internal.has(href)) internal.set(href, path) }
      else if (/^https?:\/\//.test(href)) { if (!external.has(href)) external.set(href, path) }
    }
    for (const m of body.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt="/.test(m[0])) add('crawl', path, `image without alt text: ${(m[0].match(/src="([^"]+)"/) || [])[1]?.slice(0, 80)}`)
    }
  })
  notes.push(`crawl: ${pageStats.ok} of ${urls.length} sitemap URLs answered 200`)

  // Internal links: resolve statically first, then ask the server for the rest.
  const toFetch = []
  for (const [href, from] of internal) {
    const problem = resolve(href)
    if (problem === null && !/^\/blog\/|^\/for\//.test(href.replace(/^https?:\/\/(www\.)?socialmate\.studio/, ''))) continue
    toFetch.push([href, from])
  }
  let checked = 0
  await pool(toFetch, 8, async ([href, from]) => {
    const target = /^https?:/.test(href) ? local(href) : `${origin}${href}`
    const res = await get(target.split('#')[0])
    checked++
    const loginRedirect = res.status >= 300 && res.status < 400 && /\/login/.test(res.location || '')
    if (res.status === 200 || loginRedirect) return
    if (res.status >= 300 && res.status < 400) { notes.push(`redirect: ${href} -> ${res.location} (linked from ${from})`); return }
    add('crawl', from, `links to ${href}, which answers HTTP ${res.status}`)
  })
  notes.push(`crawl: ${internal.size} distinct internal links, ${checked} fetched, the rest matched a route on disk`)

  if (flag('--external')) {
    let bad = 0
    await pool(Array.from(external), 6, async ([href, from]) => {
      if (/discord\.gg|linkedin\.com|x\.com|twitter\.com|instagram\.com|tiktok\.com|facebook\.com|threads\.(net|com)|pinterest\.com/.test(href)) return // block bots; not evidence of a dead link
      let res = await get(href, 'HEAD')
      if (res.status === 405 || res.status === 403 || res.status === 0) res = await get(href)
      if (res.status >= 400 || res.status === 0) { bad++; add('external', from, `links to ${href}, which answers ${res.status || res.error}`) }
    })
    notes.push(`crawl: ${external.size} distinct external links checked, ${bad} failed`)
  } else notes.push(`crawl: ${external.size} distinct external links not checked (pass --external)`)
}

// ─── Run ────────────────────────────────────────────────────────────────────

const files = contentFiles()
checkGuardedCopies()
checkClaims(files)
const table = buildRouteTable()
let posts = null
if (flag('--db') || value('--db-file')) posts = await loadBlogPosts()
const resolve = makeResolver(table, knownBlogSlugs(posts?.map(p => p.slug)), !!posts)
checkSourceLinks(files, resolve)
const publicRoutes = checkManifest()
checkRobots(publicRoutes)
checkLlms(resolve)
checkMetadataDefined(publicRoutes)
if (posts) { checkBlogPosts(posts, resolve); notes.push(`blog_posts: ${posts.length} posts checked`) }
const origin = value('--crawl')
if (origin) await crawl(origin.replace(/\/$/, ''), resolve)

const open = findings.filter(f => !isAllowed(f))
const allowed = findings.length - open.length
allow.forEach((a, i) => { if (!allowUsed.has(i) && !a.dbOnly && !a.crawlOnly) notes.push(`allow entry no longer matches anything (remove it): ${a.rule || ''} ${a.file || ''} ${a.contains || ''}`) })

const report = value('--report')
if (report) writeFileSync(report, JSON.stringify({ generated: new Date().toISOString(), open, allowed, notes }, null, 2))

const byCheck = {}
for (const f of open) (byCheck[f.rule || f.check] ||= []).push(f)
const quiet = flag('--summary')
for (const [check, list] of Object.entries(byCheck).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${check}: ${list.length}`)
  if (quiet) continue
  for (const f of list.slice(0, flag('--all') ? Infinity : 40)) {
    console.log(`  ${f.file}${f.line ? ':' + f.line : ''}  ${f.message}`)
    if (f.sentence && f.sentence !== f.message && !f.message.includes(f.sentence)) console.log(`      ${f.sentence}`)
  }
  if (!flag('--all') && list.length > 40) console.log(`  ... ${list.length - 40} more (--all shows every one)`)
}
if (notes.length) { console.log(''); for (const n of notes) console.log(`note: ${n}`) }
console.log(`\n${files.length} files checked. ${open.length} finding${open.length === 1 ? '' : 's'}${allowed ? `, ${allowed} accepted in scripts/verify-content-allow.json` : ''}.`)
process.exit(open.length ? 1 : 0)
