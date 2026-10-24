// Reads a master doc from a public link, for SOMA's "ingest from URL".
//
// The project page used to send Gemini the literal string "Auto-collected
// from: <link>" as the document. Nothing ever fetched the page, so every URL
// ingestion diffed one line of text. This fetches it, server side.
//
// Only public http(s) pages. Local and private addresses are refused when the
// link is checked, and again at the moment of connecting: the address check
// runs inside the socket's own DNS lookup, so a name that resolves to a public
// address for a pre-check and a private one for the request (DNS rebinding)
// still can't reach this server's network. Every redirect is checked the same way.

import { lookup as dnsLookup, type LookupAddress } from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import { isIP } from 'node:net'
import zlib from 'node:zlib'
import type { Readable } from 'node:stream'

const MAX_BYTES = 2_000_000
/** The longest master doc SOMA keeps, pasted or fetched. */
export const MAX_DOC_CHARS = 500_000
const TIMEOUT_MS = 15_000
const MAX_REDIRECTS = 3
const MIN_TEXT_CHARS = 200

export type DocFetchResult = { ok: true; text: string; url: string } | { ok: false; error: string }

/** True for hosts that must never be fetched: this machine, private networks, link-local. */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (!h || h === 'localhost' || /\.(localhost|local|internal|lan|home|corp)$/.test(h)) return true
  if (h.includes(':')) return true // IPv6 literals: none of these are public docs
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const [a, b] = [Number(m[1]), Number(m[2])]
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
}

/**
 * Validates a link and rewrites the ones whose page is not the document itself:
 * a Google Doc becomes its plain-text export, a GitHub file its raw text.
 */
export function normalizeDocUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  let u: URL
  try { u = new URL(raw.trim()) } catch { return { ok: false, error: 'That is not a valid link.' } }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, error: 'The link must start with https://' }
  if (u.port && u.port !== '80' && u.port !== '443') return { ok: false, error: 'SOMA only reads links on standard web ports.' }
  if (u.username || u.password) return { ok: false, error: 'Links with a username or password are not supported.' }
  if (isBlockedHost(u.hostname)) return { ok: false, error: 'SOMA only reads public web pages.' }

  const host = u.hostname.toLowerCase()
  const gdoc = u.pathname.match(/^\/document\/d\/([A-Za-z0-9_-]{20,})(?:\/|$)/)
  if (host === 'docs.google.com' && gdoc) {
    return { ok: true, url: `https://docs.google.com/document/d/${gdoc[1]}/export?format=txt` }
  }
  const gh = u.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/)
  if (host === 'github.com' && gh) {
    return { ok: true, url: `https://raw.githubusercontent.com/${gh[1]}/${gh[2]}/${gh[3]}` }
  }
  return { ok: true, url: u.toString() }
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }

/** Readable text from an HTML page: scripts, styles and tags out, block elements as line breaks. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|template|head)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(ul|ol)>/gi, '\n\n')
    .replace(/<\/(p|div|section|article|h[1-6]|tr|blockquote|pre)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeChar(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeChar(Number(dec)))
    .replace(/&([a-z]+);/gi, (all, name) => ENTITIES[name.toLowerCase()] ?? all)
    .split('\n')
    .map(line => line.replace(/[ \t\f\v\r]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function safeChar(code: number): string {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' '
}

/** True for a resolved address that must never be connected to. */
export function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip)
  if (kind === 4) return isBlockedHost(ip)
  if (kind !== 6) return true
  const a = ip.toLowerCase()
  const dotted = a.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)
  if (dotted) return isBlockedHost(dotted[1])
  const hex = a.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (hex) {
    const hi = parseInt(hex[1], 16), lo = parseInt(hex[2], 16)
    return isBlockedHost(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`)
  }
  return a === '::' || a === '::1' ||
    /^f[cd]/.test(a) ||     // fc00::/7, unique local
    /^fe[89ab]/.test(a) ||  // fe80::/10, link-local
    a.startsWith('ff')      // multicast
}

const BLOCKED = 'EBLOCKEDADDR'

// Same signature as dns.lookup. Refuses the connection if any address is private.
function publicOnlyLookup(
  hostname: string,
  options: { all?: boolean } & Record<string, unknown>,
  callback: (err: NodeJS.ErrnoException | null, address?: string | LookupAddress[], family?: number) => void,
) {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses: LookupAddress[]) => {
    if (err) return callback(err)
    if (!addresses.length || addresses.some(a => isBlockedAddress(a.address))) {
      return callback(Object.assign(new Error('Refused a private address'), { code: BLOCKED }))
    }
    if (options.all) return callback(null, addresses)
    callback(null, addresses[0].address, addresses[0].family)
  })
}

type Fetched =
  | { kind: 'redirect'; status: number; location: string | null }
  | { kind: 'error'; status: number }
  | { kind: 'too_big' }
  | { kind: 'body'; contentType: string; body: string }

function getOnce(url: string, signal: AbortSignal): Promise<Fetched> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http
    const req = mod.request(url, {
      method: 'GET',
      signal,
      lookup: publicOnlyLookup as unknown as typeof dnsLookup,
      headers: {
        'User-Agent': 'SocialMate-SOMA/1.0 (+https://socialmate.studio/soma)',
        Accept: 'text/html,text/plain,text/markdown,*/*;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    }, res => {
      const status = res.statusCode ?? 0
      if (status >= 300 && status < 400) {
        res.resume()
        return resolve({ kind: 'redirect', status, location: res.headers.location ?? null })
      }
      if (status < 200 || status >= 300) {
        res.resume()
        return resolve({ kind: 'error', status })
      }
      const enc = String(res.headers['content-encoding'] ?? '').toLowerCase()
      const stream: Readable =
        enc === 'gzip' ? res.pipe(zlib.createGunzip()) :
        enc === 'br' ? res.pipe(zlib.createBrotliDecompress()) :
        enc === 'deflate' ? res.pipe(zlib.createInflate()) : res
      const chunks: Buffer[] = []
      let total = 0
      // The cap counts decompressed bytes, so a small compressed bomb still stops at 2 MB.
      stream.on('data', (chunk: Buffer) => {
        total += chunk.length
        if (total > MAX_BYTES) { req.destroy(); resolve({ kind: 'too_big' }); return }
        chunks.push(chunk)
      })
      stream.on('end', () => resolve({
        kind: 'body',
        contentType: String(res.headers['content-type'] ?? '').toLowerCase(),
        body: Buffer.concat(chunks).toString('utf8'),
      }))
      stream.on('error', reject)
    })
    req.on('error', reject)
    req.end()
  })
}

/** Fetches a public link and returns its readable text, or a message saying why it couldn't. */
export async function fetchDocText(raw: string): Promise<DocFetchResult> {
  const first = normalizeDocUrl(raw)
  if (!first.ok) return first
  let url = first.url
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await getOnce(url, controller.signal)
      if (res.kind === 'redirect') {
        if (!res.location) return { ok: false, error: 'That link redirected nowhere.' }
        const next = normalizeDocUrl(new URL(res.location, url).toString())
        if (!next.ok) return next
        url = next.url
        continue
      }
      if (res.kind === 'error') {
        if (res.status === 401 || res.status === 403) {
          return { ok: false, error: 'That page is private. For a Google Doc, set sharing to "Anyone with the link", or paste the text instead.' }
        }
        return { ok: false, error: `That link returned an error (HTTP ${res.status}).` }
      }
      if (res.kind === 'too_big') return { ok: false, error: 'That page is over 2 MB. Paste the part SOMA should read instead.' }

      const type = res.contentType
      const isHtml = type.includes('html')
      const isText = !type || isHtml || type.startsWith('text/') || /json|xml|markdown/.test(type)
      if (!isText) return { ok: false, error: 'SOMA reads web pages and text files. For anything else, paste the text instead.' }

      const text = (isHtml || /^\s*<(!doctype|html)/i.test(res.body) ? htmlToText(res.body) : res.body).trim()
      if (text.length < MIN_TEXT_CHARS) {
        return { ok: false, error: "There was almost no text at that link. Pages that load their text with JavaScript (Notion, for one) can't be read, so paste the text instead." }
      }
      return { ok: true, text, url }
    }
    return { ok: false, error: 'That link redirected too many times.' }
  } catch (err) {
    const e = err as NodeJS.ErrnoException
    if (e?.code === BLOCKED) return { ok: false, error: 'SOMA only reads public web pages.' }
    if (e?.code === 'ENOTFOUND') return { ok: false, error: 'SOMA could not find that website.' }
    if (e?.name === 'AbortError' || e?.code === 'ABORT_ERR') return { ok: false, error: 'That page took too long to load.' }
    return { ok: false, error: 'SOMA could not reach that link.' }
  } finally {
    clearTimeout(timer)
  }
}
