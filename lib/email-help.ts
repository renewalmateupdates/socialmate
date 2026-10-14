/**
 * Helpers for getting a new account through email confirmation.
 *
 * Why they exist: from Sept 24 to Oct 14, 2026, 5 of 22 email signups never
 * confirmed (23%), while all 21 Google signups got in. One had typed
 * "gmaip.com", so the confirmation could never arrive, and the screen after
 * signup offered no way to fix the address or send the email again.
 *
 * Pure, no imports, so it can be checked without the app running.
 */

// Real mailbox domains. One of these is never "corrected", which is why the
// international ones are listed: a real yahoo.co.jp or hotmail.fr must not be
// nudged towards a lookalike.
const KNOWN_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'ymail.com', 'rocketmail.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.co.jp',
  'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it', 'yahoo.ca', 'yahoo.com.br', 'yahoo.com.au',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
  'outlook.com', 'outlook.fr', 'outlook.de', 'outlook.es', 'outlook.it',
  'live.com', 'live.co.uk', 'live.fr', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me', 'pm.me',
  'gmx.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de', 'mail.com', 'zoho.com',
  'yandex.com', 'yandex.ru', 'mail.ru', 'rambler.ru',
  'orange.fr', 'free.fr', 'laposte.net', 'libero.it',
  'qq.com', '163.com', '126.com', 'naver.com', 'daum.net',
  'uol.com.br', 'bol.com.br', 'terra.com.br',
  'comcast.net', 'att.net', 'verizon.net', 'sbcglobal.net', 'cox.net', 'charter.net',
])

// Only the big consumer providers are worth correcting towards. Keeping this
// short is what keeps a real company domain from being second-guessed.
const SUGGESTABLE = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'live.com', 'aol.com', 'msn.com', 'protonmail.com', 'comcast.net',
]

// Endings that are not real top-level domains but are one slip away from one.
// Real ones that look similar (.co, .cm, .om) are deliberately absent.
const TLD_FIXES: Record<string, string> = {
  con: 'com', cmo: 'com', cpm: 'com', vom: 'com', xom: 'com', comm: 'com', coom: 'com', ocm: 'com', ckm: 'com',
  nte: 'net', ner: 'net', nett: 'net',
  ogr: 'org', orgg: 'org', rog: 'org',
}

/** Edit distance where swapping two neighbouring letters counts as one slip. */
function distance(a: string, b: string): number {
  const rows: number[][] = []
  for (let i = 0; i <= a.length; i++) {
    const row: number[] = []
    for (let j = 0; j <= b.length; j++) row.push(i === 0 ? j : j === 0 ? i : 0)
    rows.push(row)
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let best = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) best = Math.min(best, rows[i - 2][j - 2] + 1)
      rows[i][j] = best
    }
  }
  return rows[a.length][b.length]
}

/**
 * The address the person probably meant, or null when nothing looks wrong.
 * "sam@gmaip.com" gives "sam@gmail.com"; "sam@acme.con" gives "sam@acme.com".
 */
export function suggestEmailFix(raw: string): string | null {
  const email = raw.trim()
  const at = email.lastIndexOf('@')
  if (at < 1 || at === email.length - 1) return null
  const local = email.slice(0, at)
  const domain = email.slice(at + 1).toLowerCase()
  if (!domain.includes('.') || KNOWN_DOMAINS.has(domain)) return null

  let best = ''
  let bestDist = Infinity
  let tie = false
  for (const candidate of SUGGESTABLE) {
    const d = distance(domain, candidate)
    if (d < bestDist) { best = candidate; bestDist = d; tie = false }
    else if (d === bestDist) tie = true
  }
  // One slip for short domains, two for long ones, and never a coin toss.
  const limit = domain.length >= 10 ? 2 : 1
  if (best && !tie && bestDist > 0 && bestDist <= limit) return `${local}@${best}`

  const dot = domain.lastIndexOf('.')
  const fixed = TLD_FIXES[domain.slice(dot + 1)]
  if (fixed) return `${local}@${domain.slice(0, dot + 1)}${fixed}`
  return null
}

const INBOXES: { label: string; href: string; domains: string[] }[] = [
  { label: 'Open Gmail', href: 'https://mail.google.com/mail/u/0/#inbox', domains: ['gmail.com', 'googlemail.com'] },
  {
    label: 'Open Outlook', href: 'https://outlook.live.com/mail/0/',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'hotmail.co.uk', 'live.co.uk', 'hotmail.fr', 'outlook.fr', 'hotmail.de', 'outlook.de', 'hotmail.it', 'outlook.it', 'hotmail.es', 'outlook.es', 'live.fr'],
  },
  {
    label: 'Open Yahoo Mail', href: 'https://mail.yahoo.com/',
    domains: ['yahoo.com', 'ymail.com', 'rocketmail.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it', 'yahoo.ca', 'yahoo.com.br', 'yahoo.com.au'],
  },
  { label: 'Open iCloud Mail', href: 'https://www.icloud.com/mail', domains: ['icloud.com', 'me.com', 'mac.com'] },
  { label: 'Open Proton Mail', href: 'https://mail.proton.me/', domains: ['protonmail.com', 'proton.me', 'pm.me'] },
]

/** A one-tap way into the person's inbox, for the providers most people use. */
export function inboxLinkFor(email: string): { label: string; href: string } | null {
  const domain = email.trim().slice(email.trim().lastIndexOf('@') + 1).toLowerCase()
  const box = INBOXES.find(b => b.domains.includes(domain))
  return box ? { label: box.label, href: box.href } : null
}

/** Supabase's rate-limit text, said plainly. */
export function friendlyResendError(message: string): string {
  const wait = /after (\d+) seconds?/i.exec(message)
  if (wait) return `You can send another in ${wait[1]} seconds.`
  if (/rate limit/i.test(message)) return 'Too many emails were sent just now. Try again in a few minutes.'
  return message
}
