#!/usr/bin/env node
/**
 * Writes lib/generated/public-routes.json: every public, indexable page that
 * has its own page.tsx, with the date its file last changed in git.
 *
 *   node scripts/gen-route-manifest.mjs          rewrite the file
 *   node scripts/gen-route-manifest.mjs --check  exit 1 if the route list is stale
 *
 * app/sitemap.ts, /llms.txt and the /vs hub read the result, so a new page is
 * listed everywhere by adding its folder and running this once. Until Nov 2026
 * the sitemap kept its own list of 100 comparison pages and 60 core pages by
 * hand, with today's date as every page's lastmod.
 *
 * A page is left out when it needs a sign-in (lib/protected-paths.ts), is an
 * app screen or utility page (APP_ONLY below), is a locale copy of an English
 * page (LOCALE_PREFIXES), has a dynamic segment (those
 * come from their own data: blog posts, /for/[slug]), or marks itself noindex.
 * `--check` compares routes only, never dates, so a commit does not stale it.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadTs } from './lib/load-ts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'lib/generated/public-routes.json')

/**
 * Screens that only make sense signed in, plus utility and redirect pages.
 * Prefix match by path segment. Marketing pages are never listed here.
 */
export const APP_ONLY = [
  '/admin', '/api', '/auth', '/billing', '/invite', '/start', '/unsubscribe',
  '/login', '/forgot-password', '/reset-password',
  '/ab-tests', '/activity', '/agents', '/clips', '/create', '/discord', '/links',
  '/listings', '/partners', '/refer', '/schedule-templates', '/schedules',
  '/streak', '/hermes/dashboard', '/hermes/campaigns', '/soma/dashboard',
  '/soma/onboarding', '/soma/projects', '/soma/upgrade', '/soma/voice',
  '/soma/weekly', '/tiktok/studio', '/studio-stax/checkout',
  '/studio-stax/portal', '/studio-stax/renew', '/gils-guide', '/demo',
  '/components', '/l', '/z', '/go', '/creator', '/accounts',
  '/analytics', '/settings',
]

/**
 * Locale folders hold client-side translations of English pages. Each one's
 * canonical is the English URL, so none of them belongs in the sitemap.
 */
export const LOCALE_PREFIXES = ['/de', '/es', '/fr', '/pt', '/ru', '/zh', '/ja', '/ko']

const startsWithSegment = (path, prefix) => path === prefix || path.startsWith(prefix + '/')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name === 'page.tsx') out.push(full)
  }
  return out
}

/** app/blog/(index)/page.tsx -> /blog */
function routeOf(file) {
  const parts = relative(join(root, 'app'), dirname(file)).split(sep).filter(Boolean)
  return '/' + parts.filter(p => !(p.startsWith('(') && p.endsWith(')'))).join('/')
}

/** True when the page, or a layout above it, sets robots index:false. */
function isNoindex(file) {
  const sources = [file]
  let dir = dirname(file)
  while (dir.startsWith(join(root, 'app'))) {
    const layout = join(dir, 'layout.tsx')
    if (existsSync(layout) && dir !== join(root, 'app')) sources.push(layout)
    dir = dirname(dir)
  }
  return sources.some(src => /robots\s*:\s*\{[^}]*index\s*:\s*false/.test(readFileSync(src, 'utf8')))
}

/** file (posix, repo-relative) -> ISO date of the last commit that touched it. */
function gitDates() {
  const dates = new Map()
  let log = ''
  try {
    log = execFileSync('git', ['log', '--format=@%cs', '--name-only', '--', 'app'], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  } catch {
    return dates
  }
  let current = null
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) current = line.slice(1).trim()
    else if (line.trim() && current && !dates.has(line.trim())) dates.set(line.trim(), current)
  }
  return dates
}

export function discover() {
  const { isProtectedPath } = loadTs(join(root, 'lib/protected-paths.ts'))
  const dates = gitDates()
  const routes = []
  for (const file of walk(join(root, 'app'))) {
    const route = routeOf(file)
    if (route.includes('[')) continue
    if (isProtectedPath(route)) continue
    if (APP_ONLY.some(p => startsWithSegment(route, p))) continue
    if (LOCALE_PREFIXES.some(p => startsWithSegment(route, p))) continue
    if (isNoindex(file)) continue
    const rel = relative(root, file).split(sep).join('/')
    routes.push({ path: route === '/' ? '/' : route, lastModified: dates.get(rel) ?? null })
  }
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const routes = discover()
  if (process.argv.includes('--check')) {
    const have = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).routes.map(r => r.path) : []
    const want = routes.map(r => r.path)
    const missing = want.filter(p => !have.includes(p))
    const extra = have.filter(p => !want.includes(p))
    if (missing.length || extra.length) {
      console.error('lib/generated/public-routes.json is stale. Run: node scripts/gen-route-manifest.mjs')
      if (missing.length) console.error('  not listed: ' + missing.join(', '))
      if (extra.length) console.error('  listed but gone: ' + extra.join(', '))
      process.exit(1)
    }
    console.log(`route manifest is current (${want.length} routes)`)
  } else {
    mkdirSync(dirname(OUT), { recursive: true })
    writeFileSync(OUT, JSON.stringify({
      note: 'Generated by scripts/gen-route-manifest.mjs. Do not edit by hand.',
      routes,
    }, null, 2) + '\n')
    console.log(`wrote ${routes.length} routes to lib/generated/public-routes.json`)
  }
}
