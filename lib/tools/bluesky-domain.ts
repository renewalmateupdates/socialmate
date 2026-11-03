// Bluesky custom domain handles, for /tools/bluesky-custom-domain. Pure parts
// only (tested by scripts/test-bluesky-domain.mjs); the page does the two
// lookups in the browser: Bluesky's public API for the account's DID, and a
// public DNS-over-HTTPS resolver to see whether the record is live yet.
//
// A domain becomes a Bluesky handle when a TXT record at _atproto.<domain>
// holds "did=<your DID>", or when https://<domain>/.well-known/atproto-did
// returns the DID as plain text.

/** "@Name.bsky.social " -> "name.bsky.social". */
export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').replace(/\.$/, '').toLowerCase()
}

/** Accepts a bare domain or a pasted URL; returns the hostname, or null when it is not a usable domain. */
export function normalizeDomain(raw: string): string | null {
  let v = raw.trim().toLowerCase().replace(/^@+/, '')
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').split(/[/?#]/)[0].replace(/\.$/, '')
  if (!isValidDomain(v)) return null
  return v
}

export function isValidDomain(domain: string): boolean {
  if (domain.length > 253 || !domain.includes('.')) return false
  const labels = domain.split('.')
  if (labels.some(l => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l))) return false
  // The last label must be a real-looking top-level domain, not a number.
  return /^[a-z]{2,63}$/.test(labels[labels.length - 1]) || /^xn--[a-z0-9-]+$/.test(labels[labels.length - 1])
}

export function isDid(value: string): boolean {
  return /^did:(plc:[a-z2-7]{24}|web:[a-z0-9.-]+)$/.test(value.trim())
}

/** What to enter at the domain's DNS provider. */
export function dnsRecord(domain: string, did: string) {
  return {
    type: 'TXT' as const,
    // Most providers want only the part before the domain; some want the full name.
    host: '_atproto',
    fullName: `_atproto.${domain}`,
    value: `did=${did.trim()}`,
  }
}

/** The file alternative: served at https://<domain>/.well-known/atproto-did. */
export function wellKnownUrl(domain: string): string {
  return `https://${domain}/.well-known/atproto-did`
}

/** A Cloudflare DNS-over-HTTPS URL that reads the TXT record (JSON API, works from a browser). */
export function dohUrl(domain: string): string {
  return `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(`_atproto.${domain}`)}&type=TXT`
}

export function resolveHandleUrl(handle: string): string {
  return `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(normalizeHandle(handle))}`
}

export type DnsVerdict =
  | { status: 'match' }
  | { status: 'missing' }
  | { status: 'wrong'; found: string[] }
  | { status: 'multiple'; found: string[] }
  | { status: 'error'; message: string }

/**
 * Reads a DNS JSON answer (RFC 8484 JSON form, as Cloudflare and Google return
 * it). TXT data arrives quoted and may be split into several quoted strings.
 */
export function checkDnsAnswer(json: unknown, did: string): DnsVerdict {
  const body = json as { Status?: number; Answer?: { type?: number; data?: string }[] } | null
  if (!body || typeof body !== 'object') return { status: 'error', message: 'The DNS lookup returned something unreadable.' }
  // 3 is NXDOMAIN: the name does not exist yet, which is the usual "not added yet" case.
  if (body.Status !== 0 && body.Status !== 3) return { status: 'error', message: `The DNS lookup failed (code ${body.Status}). Try again in a minute.` }
  const values = (body.Answer ?? [])
    .filter(a => a.type === 16 && typeof a.data === 'string')
    .map(a => joinTxt(a.data as string))
    .filter(v => v.startsWith('did='))
  if (values.length === 0) return { status: 'missing' }
  const want = `did=${did.trim()}`
  if (values.length > 1) return { status: 'multiple', found: values }
  return values[0] === want ? { status: 'match' } : { status: 'wrong', found: values }
}

/** '"did=did:plc:ab" "cd"' -> 'did=did:plc:abcd'. */
export function joinTxt(data: string): string {
  const parts = data.match(/"((?:[^"\\]|\\.)*)"/g)
  if (!parts) return data.trim()
  return parts.map(p => p.slice(1, -1).replace(/\\(.)/g, '$1')).join('')
}
