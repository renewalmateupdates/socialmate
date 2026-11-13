/**
 * The claim checks behind `npm run verify:content`: given a piece of text and
 * the facts in lib/site-facts.ts, return every sentence that says something
 * the product does not do or charge.
 *
 * Text in, findings out. No file or network access here, so the same rules
 * run over source files, the nine locale files, public text files and blog
 * posts from the database.
 *
 * A rule looks at one sentence at a time. Rules err toward flagging: a false
 * alarm costs one line in scripts/verify-content-allow.json (with a reason),
 * a miss costs a wrong price on a page AI crawlers quote.
 */

/** Names whose plans are also called "Pro" or "Agency", so "$N Pro" after one of them is not ours. */
const OTHER_PRODUCTS = [
  'White Label', 'HERMES', 'Hermes', 'SOMA', 'Studio Stax', 'Enki', 'RenewalMate', 'Credits', 'Credit',
  'Buffer', 'Hootsuite', 'Later', 'Sprout', 'Agorapulse', 'Sendible', 'Loomly', 'Planable', 'Publer',
  'Metricool', 'SocialBee', 'Vista', 'Typefully', 'Postiz', 'SocialPilot', 'Zoho', 'CoSchedule',
  'MeetEdgar', 'Iconosquare', 'Tailwind', 'Crowdfire', 'Pallyy', 'Sprinklr', 'ContentStudio',
  'Missinglettr', 'RecurPost', 'Nuelink', 'Fedica', 'Statusbrew', 'eClincher', 'Oktopost', 'NapoleonCat',
  'Hopper', 'Sked', 'Onlypult', 'SmarterQueue', 'Hypefury', 'Postcron', 'Planly', 'Flick', 'Canva',
  'Plann', 'Ripl', 'Preview', 'Gain', 'Kontentino', 'UNUM', 'Taplio', 'Shield', 'Tweet Hunter',
  'TweetHunter', 'Circleboom', 'Postly', 'PromoRepublic', 'SocialOomph', 'Tweepsmap', 'Audiense',
  'HubSpot', 'Semrush', 'StoryChief', 'OneUp', 'Brand24', 'Combin', 'Mention', 'Emplifi', 'POSTOPLAN',
  'Khoros', 'Talkwalker', 'FeedHive', 'PostPickr', 'Mailchimp', 'Substack', 'Brandwatch', 'Klaviyo',
  'Linktree', 'beehiiv', 'Beehiiv', 'ConvertKit', 'Kit', 'Notion', 'Planoly', 'Predis', 'Ocoya',
  'Repurpose', 'Mixpost', 'Post Bridge', 'Blotato', 'Supergrow', 'AuthoredUp', 'OpusClip', 'Opus Clip',
  'Social Champ', 'Postpone', 'Twitch', 'YouTube', 'Discord', 'Nitro', 'X Premium', 'LinkedIn', 'Premium',
  'ChatGPT', 'Claude', 'Gemini', 'Zapier', 'Shopify', 'Patreon', 'OnlyFans', 'Vercel', 'Supabase',
  'Stripe', 'Dropbox', 'Peloton', 'Tidal', 'Spotify', 'Netflix', 'GitHub', 'Cursor', 'Midjourney',
  'CapCut', 'Descript', 'Riverside', 'Streamlabs', 'StreamElements', 'Restream', 'Vyra', 'Printify',
  'Google', 'Apple', 'Adobe', 'Figma', 'Grammarly', 'Jasper', 'Copy.ai', 'Notion AI', 'Loom',
]

const NEGATION = /\b(not|no|never|isn't|aren't|doesn't|don't|can't|cannot|won't|without|unlike|instead of|rather than|yet|until|waiting|declined|unavailable|not available|planned|roadmap|needs?|require[sd]?|n't)\b/i

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Text as a reader sees it: tags, code fences and markup noise removed. */
export function plainText(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/&apos;|&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
}

/** Split into sentence-sized pieces, each with the line it starts on. */
export function sentences(text) {
  const out = []
  let line = 1
  for (const raw of text.split('\n')) {
    for (const piece of raw.split(/(?<=[.!?])\s+(?=[A-Z"'(\[])|\s[·•|]\s/)) {
      const s = piece.trim()
      if (s.length >= 4) out.push({ text: s, line })
    }
    line++
  }
  return out
}

const num = (s) => Number(String(s).replace(/,/g, ''))

/**
 * True when "Pro" or "Agency" at `index` belongs to another product:
 * "White Label Pro", "Buffer Pro", "HERMES Pro".
 */
function isOtherProductsPlan(sentence, index) {
  const before = sentence.slice(Math.max(0, index - 28), index)
  return OTHER_PRODUCTS.some(name => new RegExp(`${escapeRe(name)}('s)?\\s+$`).test(before))
}

function mentionsCompetitorOnly(sentence) {
  return !/SocialMate|\b(we|our|us)\b/i.test(sentence) &&
    OTHER_PRODUCTS.some(name => new RegExp(`\\b${escapeRe(name)}\\b`).test(sentence))
}

/**
 * The part of a sentence that speaks for SocialMate. A comparison table row
 * ({ feature, buffer: '...', socialmate: '...' }) is judged on its socialmate
 * or us column only; a sentence about a competitor alone says nothing about us.
 */
export function ourPart(sentence) {
  const cols = Array.from(sentence.matchAll(/\b(?:socialmate|us|sm)\s*:\s*(['"`])((?:(?!\1).)*)\1/gi)).map(m => m[2])
  if (cols.length) return cols.join(' . ')
  if (/\bfeature\s*:/.test(sentence)) return ''
  return mentionsCompetitorOnly(sentence) ? '' : sentence
}

/** Wraps a rule so it only ever sees SocialMate's part of a sentence. */
const ours = (rule) => ({ ...rule, check: (s) => { const part = ourPart(s); return part ? rule.check(part) : [] } })

export function buildRules(facts) {
  const { PLANS, PLATFORMS, UNAVAILABLE_PLATFORM_NAMES, AI_TOOLS, AFFILIATE } = facts
  const liveCount = PLATFORMS.length
  const freeCount = PLATFORMS.filter(p => p.minPlan === 'free').length
  const price = {
    Pro: new Set([PLANS.pro.monthly, PLANS.pro.annual]),
    Agency: new Set([PLANS.agency.monthly, PLANS.agency.annual]),
  }
  const planKey = { Free: 'free', Pro: 'pro', Agency: 'agency' }

  /** Quantities a sentence may state about a plan, and the fact each must equal. */
  const QUANTITIES = [
    { unit: /(?:scheduled )?posts?(?:\s*(?:\/|a|per|each|every)\s*(?:mo|month))/, field: 'postsPerMonth', label: 'posts a month' },
    { unit: /(?:AI )?credits?(?:\s*(?:\/|a|per|each|every)\s*(?:mo|month))/, field: 'aiCreditsPerMonth', label: 'AI credits a month' },
    { unit: /(?:team )?(?:seats|team members)/, field: 'seats', label: 'seats' },
    { unit: /client workspaces?/, field: 'clientWorkspaces', label: 'client workspaces' },
    { unit: /accounts? per platform/, field: 'accountsPerPlatform', label: 'accounts per platform' },
  ]

  return [
    ours({
      id: 'plan-price',
      why: 'A SocialMate plan price that is not the one in lib/plan.ts',
      check(s) {
        const hits = []
        // "Pro is $5/month", "Agency ($20/mo)", "Pro: $55/year"
        const forward = /\b(Pro|Agency)\b(?: plan| tier| monthly| annual| yearly)?(?:\s*(?:is|at|costs?|for|from|starts at|—|–|-|:|,|\(|=|→|\|)\s*|\s+)(?:just |only |still |now )?\$(\d+(?:\.\d+)?)(?!\d)/g
        for (const m of s.matchAll(forward)) {
          if (isOtherProductsPlan(s, m.index)) continue
          if (!price[m[1]].has(Number(m[2]))) hits.push(`${m[1]} at $${m[2]}`)
        }
        // "$5/month Pro plan", "$20 a month for Agency"
        const backward = /\$(\d+(?:\.\d+)?)(?!\d)\s*(?:\/|a |per )?\s*(?:mo|month|yr|year)\b(?:ly)?\s*(?:for |on |with )?(?:the |our |SocialMate )?\b(Pro|Agency)\b(?! Annual credits)/g
        for (const m of s.matchAll(backward)) {
          const at = m.index + m[0].lastIndexOf(m[2])
          if (isOtherProductsPlan(s, at)) continue
          if (!price[m[2]].has(Number(m[1]))) hits.push(`${m[2]} at $${m[1]}`)
        }
        return hits
      },
    }),
    {
      id: 'old-price',
      why: 'A price SocialMate used before the August 2026 repricing',
      check(s) {
        if (!/SocialMate/.test(s)) return []
        if (mentionsCompetitorOnly(s)) return []
        const hits = []
        for (const m of s.matchAll(/\$(55|209|4\.58|17\.42)(?![\d.])/g)) hits.push(`$${m[1]}`)
        return hits
      },
    },
    ours({
      id: 'plan-limit',
      why: 'A plan limit that is not the one the server enforces',
      check(s) {
        const names = Array.from(new Set(Array.from(s.matchAll(/\b(Free|Pro|Agency|free(?= (?:plan|tier|account|users?)))\b(?! (?:tools?|to |and easy|trial))/g))
          .filter(m => !isOtherProductsPlan(s, m.index)).map(m => m[1].charAt(0).toUpperCase() + m[1].slice(1))))
        if (names.length !== 1) return []
        if (mentionsCompetitorOnly(s)) return []
        if (/\bpack|booster|SOMA|HERMES|bank|bonus|earn|referral|TikTok|videos?\b|tweets?|X posts|outreach|prospects/i.test(s)) return []
        const facts = PLANS[planKey[names[0]]]
        const hits = []
        for (const q of QUANTITIES) {
          const re = new RegExp(`(\\d[\\d,]*)\\+?\\s+${q.unit.source}`, 'gi')
          for (const m of s.matchAll(re)) {
            const said = num(m[1])
            if (said !== facts[q.field]) hits.push(`${names[0]} with ${m[1]} ${q.label} (it is ${facts[q.field]})`)
          }
        }
        return hits
      },
    }),
    ours({
      id: 'platform-count',
      why: `SocialMate posts to ${liveCount} platforms (${freeCount} on Free)`,
      check(s) {
        if (mentionsCompetitorOnly(s)) return []
        const hits = []
        for (const m of s.matchAll(/\b(\d{1,2})\+?\s+(?:live |social |major |supported |different |social media )?(?:platforms|networks|channels)\b/gi)) {
          const n = Number(m[1])
          if (n === liveCount || n === freeCount) continue
          // "5 accounts per platform", "post to 3 platforms at once" style advice is not a claim about us
          if (!/SocialMate|\b(we|our)\b|all \d/i.test(s)) continue
          if (n < liveCount && /\b(at least|pick|choose|start with|focus on|one or|up to|select|or more|of the)\b/i.test(s)) continue
          hits.push(`${m[1]} platforms`)
        }
        return hits
      },
    }),
    ours({
      id: 'unavailable-platform',
      why: `SocialMate does not post to ${UNAVAILABLE_PLATFORM_NAMES.join(', ')}`,
      check(s) {
        if (!/SocialMate|\b(our scheduler|we support|we post)\b/i.test(s)) return []
        if (/\?\s*['"`,]*\s*$|\bq\s*:/.test(s)) return [] // a question is not a claim
        if (NEGATION.test(s)) return []
        if (/\b(clips?|feed|RSS|link|bio|profile|handle|competitor|alternative|vs\.?|compared|like|such as|whether|native|app itself|subscribers?|channel grid|videos? from|Shorts feed|Twitch)\b/i.test(s)) return []
        const hits = []
        const verb = /\b(schedul\w*|post\w*|publish\w*|cross-?post\w*|connect\w*|supports?|includ\w*|integrat\w*|works with|available (on|for))\b/i
        if (!verb.test(s)) return []
        for (const name of UNAVAILABLE_PLATFORM_NAMES) {
          if (new RegExp(`\\b${name}\\b`).test(s)) hits.push(name)
        }
        return hits
      },
    }),
    ours({
      id: 'unlimited',
      why: 'Every plan is capped. Only Enterprise seats are unlimited',
      check(s) {
        const m = s.match(/\bunlimited\b|\bno (?:post |posting |monthly )?(?:caps?|limits?)\b|\bwithout (?:limits|caps)\b|\blimitless\b|\bno post cap\b/i)
        if (!m) return []
        if (mentionsCompetitorOnly(s)) return []
        if (/Enterprise/i.test(s) && /seats?/i.test(s)) return []
        if (/\b(not|never|isn't|aren't|no such|nothing is|none are)\b[^.]{0,40}unlimited/i.test(s)) return []
        return [m[0]]
      },
    }),
    ours({
      id: 'ai-tool-count',
      why: `There are ${AI_TOOLS.length} AI tools`,
      check(s) {
        const hits = []
        for (const m of s.matchAll(/\b(\d{1,3})\+?\s+(?:built-in |free |different )?AI(?:-powered)? (?:content |writing )?tools\b/gi)) {
          if (Number(m[1]) > AI_TOOLS.length && /SocialMate|\b(we|our)\b|includ|built-in/i.test(s)) hits.push(`${m[0]} (there are ${AI_TOOLS.length})`)
        }
        return hits
      },
    }),
    {
      id: 'ai-tool-cost',
      why: 'An AI tool credit cost that is not what the route charges',
      check(s) {
        const hits = []
        const named = [
          ['Hashtag', 5], ['Repurpos', 10], ['Post Score', 5], ['SM-Pulse', 20], ['SM-Radar', 20],
          ['Bio Writer', 5], ['Profile Optimizer', 5], ['TikTok Script', 5], ['Thread Generator', 10],
          ['Caption Generator', 5], ['Hook Generator', 5], ['Content Gap', 10], ['Content Calendar', 5],
        ]
        for (const [name, cost] of named) {
          const re = new RegExp(`${escapeRe(name)}[^.;\\n]{0,70}?\\b(\\d+)[ -]credits?\\b`, 'i')
          const m = s.match(re)
          if (m && Number(m[1]) !== cost) hits.push(`${name} at ${m[1]} credits (it is ${cost})`)
        }
        return hits
      },
    },
    {
      id: 'affiliate-rate',
      why: `Partner rates are ${AFFILIATE.recurringPercent}%, ${AFFILIATE.milestonePercent}%, ${AFFILIATE.smallPackPercent}% and ${AFFILIATE.largePackPercent}%`,
      check(s) {
        if (!/\b(affiliate|referral|partner|commission)\b/i.test(s) || !/SocialMate|\b(we|our|you)\b/i.test(s)) return []
        if (mentionsCompetitorOnly(s)) return []
        const ok = new Set([AFFILIATE.recurringPercent, AFFILIATE.milestonePercent, AFFILIATE.smallPackPercent, AFFILIATE.largePackPercent])
        const hits = []
        for (const m of s.matchAll(/\b(\d{1,2})%\s+(?:recurring|commission|lifetime|of every|on every|on all)/gi)) {
          if (!ok.has(Number(m[1]))) hits.push(`${m[1]}%`)
        }
        return hits
      },
    },
    {
      id: 'mailbox',
      why: 'socialmate.studio has no mailbox. The public address is in lib/site-facts.ts',
      check(s) {
        const m = s.match(/[A-Za-z0-9._%+-]+@socialmate\.studio/)
        // A sending address (Resend sends from the domain) is fine; a contact address is not.
        if (m && /\bfrom\s*:|\bFROM_|<[^>]*@socialmate\.studio>|noreply@|notifications@/.test(s)) return []
        return m ? [m[0]] : []
      },
    },
    {
      id: 'domain',
      why: 'The canonical origin is https://socialmate.studio (no www, no http)',
      check(s) {
        const m = s.match(/https?:\/\/www\.socialmate\.studio|http:\/\/socialmate\.studio/)
        return m ? [m[0]] : []
      },
    },
    ours({
      id: 'trial-or-refund',
      why: 'There is no free trial and no refund. The free plan is the trial',
      check(s) {
        if (mentionsCompetitorOnly(s)) return []
        const m = s.match(/\b(\d+)[- ]day (?:free )?trial\b|\bfree trial\b|\bmoney[- ]back\b|\bfull refund\b|\brefund guarantee\b/i)
        if (!m) return []
        if (!/SocialMate|\b(we|our)\b/i.test(s)) return []
        if (NEGATION.test(s)) return []
        return [m[0]]
      },
    }),
    {
      id: 'coming-soon',
      why: 'A "coming soon" that may describe something already shipped, or never planned',
      check(s) {
        const m = s.match(/\bcoming soon\b|\bapproval pending\b|\bpending approval from\b|\blaunching soon\b/i)
        return m ? [m[0]] : []
      },
    },
    {
      id: 'stale-year',
      why: 'A year that has passed, in copy that reads as current',
      check(s) {
        const hits = []
        for (const m of s.matchAll(/\b(?:in|for|of|best|top|guide|updated|early|late|mid)[ -](202[0-5])\b|\((202[0-5])\)/gi)) hits.push(m[1] || m[2])
        return hits
      },
    },
    {
      id: 'placeholder',
      why: 'Placeholder text that reached a page',
      check(s) {
        const m = s.match(/lorem ipsum|\bTODO:|\bTBD\b|\[placeholder\]|\[insert [^\]]+\]|\bXXX\b/i)
        return m ? [m[0]] : []
      },
    },
    {
      id: 'enki',
      why: 'Enki is a separate project and is not sold or described on SocialMate',
      check(s) {
        if (!/\bEnki\b/.test(s)) return []
        if (/\b(separate|not (a |part )|no longer|wound down|removed|is not|moved out|its own product)\b/i.test(s)) return []
        return ['Enki']
      },
    },
  ]
}

/** Run every rule over a text. Returns [{ rule, why, line, hit, sentence }]. */
export function checkText(text, rules) {
  const findings = []
  for (const { text: s, line } of sentences(plainText(text))) {
    for (const rule of rules) {
      for (const hit of rule.check(s)) {
        findings.push({ rule: rule.id, why: rule.why, line, hit, sentence: s.length > 260 ? s.slice(0, 257) + '...' : s })
      }
    }
  }
  return findings
}
