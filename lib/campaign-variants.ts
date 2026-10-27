// AI rewrites for campaign messages, written once when the campaign is made.
//
// One model call covers every message. Each rewrite is checked before it is
// kept (lib/campaigns.ts acceptRewrite): it must carry every link and price the
// message had, add none, and fit the shortest platform the campaign posts to.
// A message whose rewrites all fail the check rotates as written.

import { GoogleGenerativeAI } from '@google/generative-ai'
import { VARIANTS_PER_MESSAGE, acceptRewrite, charLimitFor, type CampaignMessage } from './campaigns'

const MODEL = 'gemini-3.6-flash'
const TIMEOUT_MS = 30_000

export type VariantResult =
  | { ok: true; messages: CampaignMessage[]; rewordedCount: number }
  | { ok: false; error: string }

export async function writeVariants(apiKey: string, messages: CampaignMessage[], platforms: string[]): Promise<VariantResult> {
  const maxChars = charLimitFor(platforms)
  const list = messages.map((m, i) => `[${i}] ${m.text}`).join('\n\n')
  const prompt = `You rewrite social media posts for a campaign that repeats on a schedule, so the same message never goes out word for word twice.

For each numbered message below, write ${VARIANTS_PER_MESSAGE} different versions.

Rules for every version:
- Keep the meaning. Add no new facts, claims, numbers, offers or hashtags that are not in the message.
- Copy every link exactly as written, and keep every price exactly as written.
- Each version must be at most ${maxChars} characters, including links.
- Write in the same language and voice as the message. Vary the opening line and the structure.
- Never use "game-changer", "Let's dive in", "In today's world", "synergy" or "leverage".

Messages:
${list}

Return ONLY valid JSON in this shape:
{"messages":[{"index":0,"versions":["...","..."]}]}`

  let parsed: unknown
  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL }, { timeout: TIMEOUT_MS })
    const text = (await model.generateContent(prompt)).response.text()
    parsed = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim())
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[campaigns] rewording failed:', msg)
    if (/429|quota|rate|RESOURCE_EXHAUSTED/i.test(msg)) return { ok: false, error: 'The AI is busy right now. Wait a minute and try again.' }
    return { ok: false, error: 'The AI could not write the versions this time. Try again, or turn rewording off.' }
  }

  const answers = (parsed as { messages?: { index?: unknown; versions?: unknown }[] })?.messages
  const byIndex = new Map<number, unknown[]>()
  if (Array.isArray(answers)) {
    for (const a of answers) {
      if (typeof a?.index === 'number' && Array.isArray(a.versions)) byIndex.set(a.index, a.versions)
    }
  }

  let rewordedCount = 0
  const out = messages.map((m, i) => {
    const kept: string[] = []
    for (const v of byIndex.get(i) ?? []) {
      const ok = acceptRewrite(m.text, v, maxChars)
      if (ok && !kept.includes(ok)) kept.push(ok)
      if (kept.length >= VARIANTS_PER_MESSAGE) break
    }
    if (kept.length) rewordedCount++
    return { ...m, variants: kept }
  })
  return { ok: true, messages: out, rewordedCount }
}
