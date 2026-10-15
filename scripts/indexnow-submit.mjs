#!/usr/bin/env node
/**
 * Tell IndexNow search engines (Bing, Yandex, Seznam, Naver) to recrawl our pages
 * now instead of whenever. Bing's index also feeds ChatGPT search and DuckDuckGo,
 * which between them have sent more signups than Google.
 *
 * Run it after a deploy that changes public pages, or after a blog batch:
 *
 *   node scripts/indexnow-submit.mjs                 every URL in the live sitemap
 *   node scripts/indexnow-submit.mjs --dry-run       list what would be sent
 *   node scripts/indexnow-submit.mjs <url> [<url>]   only these URLs
 *
 * The key is public by design: IndexNow checks ownership by fetching the key file
 * from the site, public/<KEY>.txt. Nothing here needs a secret.
 */

const HOST = 'socialmate.studio'
const KEY = 'ab2e4f3c0ef5ef20d6c07b2a0d1b3461'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS = 10_000 // IndexNow's limit per request

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const explicit = args.filter(a => !a.startsWith('--'))

async function sitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`)
  const xml = await res.text()
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), m => m[1].trim())
}

async function main() {
  const urls = explicit.length ? explicit : await sitemapUrls()
  const foreign = urls.filter(u => new URL(u).hostname !== HOST)
  if (foreign.length) throw new Error(`not on ${HOST}: ${foreign.slice(0, 3).join(', ')}`)
  if (!urls.length) throw new Error('no URLs to submit')
  if (urls.length > MAX_URLS) throw new Error(`${urls.length} URLs is over IndexNow's ${MAX_URLS} per request`)

  // Every engine verifies the key against the live file, so a missing file means
  // every submission is refused. Check first rather than send a request that fails.
  const keyRes = await fetch(KEY_LOCATION)
  const served = keyRes.ok ? (await keyRes.text()).trim() : ''
  if (served !== KEY) throw new Error(`${KEY_LOCATION} does not serve the key yet (status ${keyRes.status}); deploy first`)

  if (dryRun) {
    console.log(`would submit ${urls.length} URLs, for example:\n  ${urls.slice(0, 5).join('\n  ')}`)
    return
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
  })
  const body = await res.text().catch(() => '')
  // 200 and 202 both mean accepted. 403 is a key problem, 422 a URL that is not on the host.
  console.log(`IndexNow answered ${res.status} for ${urls.length} URLs${body ? `: ${body.slice(0, 300)}` : ''}`)
  if (res.status !== 200 && res.status !== 202) process.exit(1)
}

main().catch(err => { console.error(err.message); process.exit(1) })
