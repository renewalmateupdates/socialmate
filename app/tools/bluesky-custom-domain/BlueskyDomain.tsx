'use client'
import { useState } from 'react'
import {
  checkDnsAnswer, dnsRecord, dohUrl, isDid, normalizeDomain, normalizeHandle,
  resolveHandleUrl, wellKnownUrl, type DnsVerdict,
} from '@/lib/tools/bluesky-domain'
import CopyButton from '../CopyButton'

const input = 'mt-2 min-h-[44px] w-full rounded-xl border border-edge bg-void px-4 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none'
const label = 'block font-mono text-eyebrow uppercase text-ink-muted'
const button = 'tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber px-4 text-small font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-50'

export default function BlueskyDomain() {
  const [handle, setHandle] = useState('')
  const [domainRaw, setDomainRaw] = useState('')
  const [did, setDid] = useState('')
  const [lookup, setLookup] = useState<'idle' | 'busy' | 'failed'>('idle')
  const [verdict, setVerdict] = useState<DnsVerdict | null>(null)
  const [checking, setChecking] = useState(false)

  const domain = normalizeDomain(domainRaw)
  const record = domain && isDid(did) ? dnsRecord(domain, did) : null

  const findDid = async () => {
    const h = normalizeHandle(handle)
    if (!h) return
    setLookup('busy')
    setVerdict(null)
    try {
      const res = await fetch(resolveHandleUrl(h))
      const body = await res.json().catch(() => ({}))
      if (res.ok && isDid(body.did ?? '')) {
        setDid(body.did)
        setLookup('idle')
      } else {
        setLookup('failed')
      }
    } catch {
      setLookup('failed')
    }
  }

  const checkDns = async () => {
    if (!domain || !isDid(did)) return
    setChecking(true)
    try {
      const res = await fetch(dohUrl(domain), { headers: { accept: 'application/dns-json' }, cache: 'no-store' })
      setVerdict(checkDnsAnswer(await res.json(), did))
    } catch {
      setVerdict({ status: 'error', message: 'Could not reach the DNS checker. Check your connection and try again.' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <p className="font-mono text-eyebrow uppercase text-amber">Step 1</p>
        <label htmlFor="bd-handle" className={`${label} mt-3`}>Your current Bluesky handle</label>
        <div className="mt-2 flex gap-2">
          <input id="bd-handle" value={handle} onChange={e => setHandle(e.target.value)} placeholder="yourname.bsky.social" className={`${input} mt-0`} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
          <button type="button" onClick={findDid} disabled={!normalizeHandle(handle) || lookup === 'busy'} className={`${button} shrink-0`}>
            {lookup === 'busy' ? 'Looking…' : 'Find'}
          </button>
        </div>
        {lookup === 'failed' && (
          <p className="mt-2 text-small text-alert">
            Could not find that handle. Check the spelling, or paste your DID below. Bluesky shows it when you choose to use your own domain.
          </p>
        )}
        <label htmlFor="bd-did" className={`${label} mt-4`}>Your DID</label>
        <input id="bd-did" value={did} onChange={e => { setDid(e.target.value.trim()); setVerdict(null) }} placeholder="did:plc:…" className={input} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        {did && !isDid(did) && <p className="mt-2 text-small text-alert">A DID looks like did:plc: followed by 24 letters and numbers.</p>}

        <p className="mt-8 font-mono text-eyebrow uppercase text-amber">Step 2</p>
        <label htmlFor="bd-domain" className={`${label} mt-3`}>The domain you want as your handle</label>
        <input id="bd-domain" value={domainRaw} onChange={e => { setDomainRaw(e.target.value); setVerdict(null) }} placeholder="example.com or you.example.com" className={input} autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" />
        {domainRaw.trim() && !domain && <p className="mt-2 text-small text-alert">That does not look like a domain. Try something like example.com.</p>}
      </div>

      <div className="flex flex-col gap-3" aria-live="polite">
        <p className="font-mono text-eyebrow uppercase text-ink-muted">Add this record at your domain&apos;s DNS provider</p>
        {record ? (
          <>
            <article className="rounded-2xl border border-edge bg-panel p-4">
              <dl className="space-y-3">
                <Row term="Type" value={record.type} />
                <Row term="Host / Name" value={record.host} hint={`Some providers want the full name: ${record.fullName}`} />
                <Row term="Value" value={record.value} />
              </dl>
            </article>
            <button type="button" onClick={checkDns} disabled={checking} className={button}>
              {checking ? 'Checking…' : 'Check if it is live'}
            </button>
            {verdict && <Verdict verdict={verdict} did={did} />}
            <details className="rounded-2xl border border-edge bg-panel p-4">
              <summary className="cursor-pointer text-small text-ink-body">No DNS access? Use a file instead</summary>
              <p className="mt-3 text-small text-ink-body">
                Serve a plain text file at <span className="break-all font-mono text-ink-high">{wellKnownUrl(domain as string)}</span> containing only your DID:
              </p>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-edge px-3 py-2">
                <span className="break-all font-mono text-small text-ink-high">{did}</span>
                <CopyButton text={did} className="shrink-0" />
              </div>
            </details>
          </>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-edge p-6 text-center">
            <p className="text-small text-ink-muted">Find your DID and enter a domain, and the record to add shows up here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ term, value, hint }: { term: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="font-mono text-eyebrow uppercase text-ink-muted">{term}</dt>
      <dd className="mt-1 flex items-center justify-between gap-3">
        <span className="break-all font-mono text-small text-ink-high">{value}</span>
        <CopyButton text={value} className="shrink-0" />
      </dd>
      {hint && <p className="mt-1 text-small text-ink-muted">{hint}</p>}
    </div>
  )
}

function Verdict({ verdict, did }: { verdict: DnsVerdict; did: string }) {
  const box = 'rounded-2xl border p-4 text-small'
  switch (verdict.status) {
    case 'match':
      return <p className={`${box} border-jade/40 text-jade`}>The record is live and points at your account. In Bluesky, open Settings, then Account, then Handle, choose to use your own domain, and press verify.</p>
    case 'missing':
      return <p className={`${box} border-edge text-ink-body`}>No record found yet. If you just added it, DNS can take a few minutes, sometimes longer. Check that the host is _atproto, not the bare domain.</p>
    case 'wrong':
      return <p className={`${box} border-alert/40 text-ink-body`}>A record exists but holds <span className="break-all font-mono">{verdict.found[0]}</span>, not <span className="break-all font-mono">did={did}</span>. Replace its value.</p>
    case 'multiple':
      return <p className={`${box} border-alert/40 text-ink-body`}>There are {verdict.found.length} did= records. Bluesky needs exactly one, so delete the others.</p>
    default:
      return <p className={`${box} border-alert/40 text-ink-body`}>{verdict.message}</p>
  }
}
