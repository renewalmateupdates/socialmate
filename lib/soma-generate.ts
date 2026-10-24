// SOMA's one generation path.
//
// Manual generate, the Monday run and Full Send's daily run each had their own
// copy of this: three prompts, three schedulers, three ways of charging. They
// drifted the way copies do. The Monday run sent every post to every platform
// in the project and timed them by the server's clock (5 AM Eastern); the daily
// run ignored the project's schedule and wrote 7 per platform every day, never
// logged its charge, and planned without looking at what the Monday run had
// already scheduled, so one platform could get 14 posts a day against a cap of
// 7. All three now run through here.
//
// What a run does:
//   1. Works out the window: the mode's (manual and Monday) or today and
//      tomorrow (Full Send's daily top-up).
//   2. Counts what the project already has in it, per platform per day, and
//      plans only the open slots (lib/soma-schedule.ts). Nothing open means no
//      model call, no charge, no run counted.
//   3. Asks Gemini for exactly that many posts per platform, in chunks.
//   4. Saves them, queues the scheduled ones, then charges once and records the
//      run.
//
// It never imports the Inngest client: lib/inngest.ts imports this file, so the
// caller passes `enqueue` to queue posts with the scheduler.

import type { SupabaseClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SOMA_COSTS } from './soma-costs'
import { SOMA_MODE_LIMITS, capSchedule, effectiveSomaMode, isSomaPlatform, type SomaMode, type PlatformSchedule } from './soma-mode'
import { nextRunCount } from './soma-runs'
import { planGapSlots, utcDayKey, windowDayKeys, type PlannedSlot } from './soma-schedule'

export const SOMA_MODEL = 'gemini-3.6-flash'
export const GENERATE_COST = SOMA_COSTS.generate_week

export type SomaTrigger = 'manual' | 'weekly' | 'daily'

const LEDGER_ACTION: Record<SomaTrigger, string> = {
  manual: 'generate_week',
  weekly: 'autopilot_run',
  daily:  'full_send_run',
}

/** Full Send's daily run tops up today and tomorrow. */
export const DAILY_WINDOW_DAYS = 2

/** Gemini reliably returns about 14 posts per call; larger asks come back truncated. */
const CHUNK_SIZE = 14
/** A few calls at a time: quick enough for the time limit, slow enough for the rate limit. */
const GEMINI_CONCURRENCY = 5
const GEMINI_TIMEOUT_MS = 20_000
const UNSPLASH_CONCURRENCY = 4

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  twitter:  'X: 280 characters max. Punchy, direct, hook in the first line. 2 hashtags at most.',
  bluesky:  'Bluesky: 300 characters max. Conversational, authentic, community-friendly.',
  linkedin: 'LinkedIn: 3-6 sentences. Professional but human. Open with a hook, end with a question or takeaway. Line breaks are fine.',
  mastodon: 'Mastodon: 500 characters max. Community-native, no corporate tone.',
  discord:  'Discord: casual announcement style. **Bold** is fine for emphasis. Keep it short.',
  telegram: 'Telegram: friendly and direct, can run a little longer. No hashtag spam.',
}

const CONTENT_TYPES = ['mindset', 'progress', 'insight', 'story', 'value', 'question', 'win', 'lesson']

export interface SomaInsights {
  key_themes?: string[]
  wins?: string[]
  challenges?: string[]
  directional_shifts?: string[]
  diff_summary?: string
  content_angles?: string[]
  emotional_tone?: string
  memory_update?: string
}

export interface SomaRunProject {
  id: string
  workspace_id: string
  user_id: string
  name?: string | null
  description?: string | null
  platforms?: string[] | null
  posts_per_day?: number | null
  content_window_days?: number | null
  mode?: string | null
  platform_schedule?: PlatformSchedule | null
  runs_this_month?: number | null
  last_generated_at?: string | null
  campaign_theme?: string | null
  campaign_start?: string | null
  campaign_end?: string | null
  include_media?: boolean | null
  include_video_url?: string | null
}

export interface SomaRunWorkspace {
  id: string
  soma_autopilot_enabled?: boolean | null
  soma_full_send_enabled?: boolean | null
}

export interface QueuedPost { postId: string; scheduledAt: string }

export interface SomaRunOptions {
  admin: SupabaseClient
  project: SomaRunProject
  workspace: SomaRunWorkspace
  trigger: SomaTrigger
  insights: SomaInsights | null
  ingestionId?: string | null
  /** Who the posts belong to: the person generating, or the project's owner for a scheduled run. */
  actorUserId: string
  /** Manual runs only: first day of the window (YYYY-MM-DD). */
  startDate?: string | null
  apiKey: string
  /** Hands scheduled posts to the publisher (post/scheduled). */
  enqueue: (posts: QueuedPost[]) => Promise<void>
  now?: Date
  /** Stop starting new model calls after this long. What is left stays open for the next run. */
  budgetMs?: number
  /**
   * A scheduled run continuing in another Inngest step, to stay inside the
   * function time limit. It fills more open slots but neither charges nor
   * counts a run: the first step of the run already did.
   */
  continuation?: boolean
}

export interface SomaRunResult {
  mode: SomaMode
  platforms: string[]
  windowDays: number
  windowStart: string
  /** Open slots in the window before this run. */
  openSlots: number
  postsCreated: number
  postIds: string[]
  platformCounts: Record<string, number>
  platformErrors: Record<string, string>
  /** Open slots this run did not fill (model came back short, or the time budget ran out). */
  unfilled: number
  charged: number
}

export class SomaRunError extends Error {
  code: 'generation_failed' | 'existing_posts_unreadable'
  constructor(code: SomaRunError['code'], message: string) {
    super(message)
    this.code = code
  }
}

// ── Pure helpers (tested in isolation) ──────────────────────────────────────

export type ExistingSlots = Record<string, Record<string, number[]>>

/** Adds one existing post to the per-platform, per-day tally. */
export function addExisting(out: ExistingSlots, row: { platforms?: unknown; scheduled_at?: string | null }) {
  if (!row.scheduled_at || !Array.isArray(row.platforms)) return
  const at = Date.parse(row.scheduled_at)
  if (Number.isNaN(at)) return
  const day = utcDayKey(new Date(at))
  for (const p of row.platforms) {
    if (typeof p !== 'string') continue
    out[p] ??= {}
    ;(out[p][day] ??= []).push(at)
  }
}

/**
 * The days a run fills. Manual and Monday runs use the mode's window, capped by
 * the project's own setting; the daily run tops up today and tomorrow. A manual
 * start date in the past starts today instead.
 */
export function runWindow(
  project: Pick<SomaRunProject, 'content_window_days'>,
  mode: SomaMode,
  trigger: SomaTrigger,
  now: Date,
  startDate?: string | null,
): { days: string[]; windowDays: number } {
  const windowDays = trigger === 'daily'
    ? DAILY_WINDOW_DAYS
    : Math.max(1, Math.min(project.content_window_days ?? 7, SOMA_MODE_LIMITS[mode].windowDays))
  let start = now
  if (trigger === 'manual' && startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    const requested = new Date(`${startDate}T00:00:00Z`)
    if (!Number.isNaN(requested.getTime()) && utcDayKey(requested) > utcDayKey(now)) start = requested
  }
  return { days: windowDayKeys(start, windowDays), windowDays }
}

/** Splits one platform's open slots into model calls of at most CHUNK_SIZE. */
export function chunkSlots(slots: PlannedSlot[]): PlannedSlot[][] {
  const byPlatform = new Map<string, PlannedSlot[]>()
  for (const s of slots) {
    const list = byPlatform.get(s.platform) ?? []
    list.push(s)
    byPlatform.set(s.platform, list)
  }
  const chunks: PlannedSlot[][] = []
  for (const list of Array.from(byPlatform.values())) {
    for (let i = 0; i < list.length; i += CHUNK_SIZE) chunks.push(list.slice(i, i + CHUNK_SIZE))
  }
  // Earliest first across platforms, so a run that stops early has filled the
  // nearest days on every platform rather than all of one platform.
  return chunks.sort((a, b) => a[0].at.getTime() - b[0].at.getTime())
}

/** The credits a charge takes from the monthly allowance first, then from purchased credits. */
export function splitCharge(
  balances: { soma_credits_monthly?: number | null; soma_credits_used?: number | null; soma_credits_purchased?: number | null },
  cost: number,
): { used: number; purchased: number; balanceAfter: number } {
  const monthly = balances.soma_credits_monthly ?? 0
  const used = balances.soma_credits_used ?? 0
  const purchased = balances.soma_credits_purchased ?? 0
  const fromMonthly = Math.min(cost, Math.max(0, monthly - used))
  const fromPurchased = cost - fromMonthly
  const newUsed = used + fromMonthly
  const newPurchased = Math.max(0, purchased - fromPurchased)
  return { used: newUsed, purchased: newPurchased, balanceAfter: Math.max(0, monthly - newUsed) + newPurchased }
}

export function parseGeminiJson(text: string): unknown {
  return JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim())
}

interface GeneratedPost { content: string; content_type?: unknown }

/** The usable posts in a model answer: objects with non-empty text, nothing else. */
export function readGeneratedPosts(parsed: unknown): GeneratedPost[] {
  const posts = (parsed as { posts?: unknown } | null)?.posts
  if (!Array.isArray(posts)) return []
  return posts.filter((p): p is GeneratedPost =>
    typeof (p as GeneratedPost)?.content === 'string' && (p as GeneratedPost).content.trim().length > 0)
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback
}

interface VoiceProfile {
  tone_profile?: unknown
  writing_style_rules?: unknown
  behavioral_traits?: unknown
  voice_examples?: unknown
  personality_summary?: string | null
  personality_tier?: string | null
}

// ── Context for the prompt ──────────────────────────────────────────────────

function voiceContext(profile: VoiceProfile | null): string {
  if (!profile) return 'No voice profile: use an authentic, direct, human tone.'
  const examples = Array.isArray(profile.voice_examples) && profile.voice_examples.length
    ? (profile.voice_examples as string[]).join(' | ')
    : 'none'
  const base = `CREATOR VOICE PROFILE:
Tone: ${JSON.stringify(profile.tone_profile ?? {})}
Style: ${JSON.stringify(profile.writing_style_rules ?? {})}
Personality: ${JSON.stringify(profile.behavioral_traits ?? {})}
Example posts (voice only; do not copy their facts or numbers): ${examples}`
  if (!profile.personality_summary) return base
  const tier = String(profile.personality_tier ?? 'foundation').replace('_', ' ')
  return `CREATOR VOICE DNA (${tier} tier):\n${profile.personality_summary}\n\n${base}`
}

function insightContext(project: SomaRunProject, insights: SomaInsights | null): string {
  const about = [
    `PROJECT: ${project.name ?? 'Untitled'}`,
    project.description ? `About: ${project.description}` : null,
  ].filter(Boolean).join('\n')
  if (!insights) return `${about}\n\nNo master doc insights yet: write from the project description and the creator's voice.`
  return `${about}

INSIGHTS FROM THE LATEST MASTER DOC:
Key themes: ${insights.key_themes?.join(', ') || 'none'}
Wins: ${insights.wins?.join(', ') || 'none'}
Challenges: ${insights.challenges?.join(', ') || 'none'}
What changed: ${insights.diff_summary || 'New content week'}
Content angles: ${insights.content_angles?.join(' | ') || 'none'}
Emotional tone: ${insights.emotional_tone || 'motivated'}`
}

function campaignContext(project: SomaRunProject): string {
  if (!project.campaign_theme) return ''
  const when = project.campaign_start && project.campaign_end ? ` It runs ${project.campaign_start} to ${project.campaign_end}.` : ''
  return `\n\nACTIVE CAMPAIGN: focus every post on "${project.campaign_theme}".${when} Make each post timely and specific to it.`
}

function videoContext(project: SomaRunProject): string {
  if (!project.include_video_url) return ''
  return `\n\nVIDEO URL TO INCLUDE: ${project.include_video_url}\nInclude this URL in every post, at the end on its own line or woven in ("Watch here:", "Full clip:").`
}

// ── Unsplash ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','to','of','in','for','on','with','at','by','from','as','it','its','this','that','and','or','but','if','you','we','your','our','my','not','just','so','up','out','down','what','how','when','where','who','why','all','can','get','let','than','then','one','more','some','here','there'])

function extractKeyword(content: string): string {
  const words = content.replace(/[#@\n]/g, ' ').replace(/[^a-zA-Z\s]/g, '').toLowerCase().split(/\s+/)
  return words.filter(w => w.length > 3 && !STOP_WORDS.has(w)).slice(0, 3).join(' ') || 'creator social media'
}

// urls.small (~400px) stays under Bluesky's 1MB blob limit. usedUrls keeps one
// photo from appearing twice in a run. Unsplash requires the download ping.
async function fetchUnsplashImage(keyword: string, usedUrls: Set<string>): Promise<string[] | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const seed = attempt > 0 ? `&seed=${Date.now()}${attempt}` : ''
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${key}${seed}`,
        { signal: AbortSignal.timeout(5000) },
      )
      if (!res.ok) return null
      const data = await res.json() as {
        urls?: { small?: string; regular?: string }
        user?: { name?: string; links?: { html?: string } }
        links?: { download_location?: string }
      }
      const url = data?.urls?.small ?? data?.urls?.regular
      if (!url) return null
      if (usedUrls.has(url) && attempt < 2) continue
      usedUrls.add(url)
      if (data?.links?.download_location) {
        fetch(`${data.links.download_location}?client_id=${key}`, { signal: AbortSignal.timeout(3000) }).catch(() => {})
      }
      return [url, `Photo by ${data?.user?.name ?? 'Unknown'} on Unsplash | ${data?.user?.links?.html ?? 'https://unsplash.com'}`]
    } catch {
      return null
    }
  }
  return null
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>, shouldStop?: () => boolean): Promise<(R | undefined)[]> {
  const results = new Array<R | undefined>(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      if (shouldStop?.()) return
      const i = next++
      if (i >= items.length) return
      results[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return results
}

// ── Reads ───────────────────────────────────────────────────────────────────

/** The project's posts in [fromIso, toIso), as a per-platform, per-day tally. */
export async function loadExistingSlots(
  admin: SupabaseClient, project: Pick<SomaRunProject, 'id' | 'workspace_id'>, fromIso: string, toIso: string,
): Promise<ExistingSlots> {
  const out: ExistingSlots = {}
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    // Older runs tagged posts metadata.project_id; this file tags soma_project_id.
    const { data, error } = await admin
      .from('posts')
      .select('platforms, scheduled_at')
      .eq('workspace_id', project.workspace_id)
      .gte('scheduled_at', fromIso)
      .lt('scheduled_at', toIso)
      .or(`metadata->>soma_project_id.eq.${project.id},metadata->>project_id.eq.${project.id}`)
      .order('scheduled_at', { ascending: true })
      .range(from, from + pageSize - 1)
    // Never plan from a failed read: an empty tally is exactly how a calendar
    // gets filled twice.
    if (error) throw new SomaRunError('existing_posts_unreadable', `Could not read the project's posts: ${error.message}`)
    for (const row of data ?? []) addExisting(out, row)
    if (!data || data.length < pageSize) break
  }
  return out
}

/**
 * Insights for a scheduled run: the project's latest ingestion when it is at
 * least as new as its latest master doc, otherwise a fresh read of that doc,
 * saved as an ingestion with its memory notes. Null when the project has no doc
 * yet; the run then writes from the project description.
 */
export async function latestInsights(
  admin: SupabaseClient, project: SomaRunProject, apiKey: string, now: Date = new Date(),
): Promise<{ insights: SomaInsights | null; ingestionId: string | null }> {
  const [{ data: ingestion, error: ingErr }, { data: docs, error: docErr }] = await Promise.all([
    admin.from('soma_weekly_ingestion')
      .select('id, extracted_insights, created_at')
      .or(`project_id.eq.${project.id},metadata->>project_id.eq.${project.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('soma_master_docs')
      .select('id, version, content, created_at')
      .eq('project_id', project.id)
      .order('version', { ascending: false })
      .limit(2),
  ])
  if (ingErr) console.warn('[SOMA] latest ingestion lookup failed:', ingErr.message)
  if (docErr) console.warn('[SOMA] master doc lookup failed:', docErr.message)

  const current = docs?.[0] ?? null
  const previous = docs?.[1] ?? null
  if (ingestion && (!current || Date.parse(ingestion.created_at) >= Date.parse(current.created_at))) {
    return { insights: (ingestion.extracted_insights ?? null) as SomaInsights | null, ingestionId: ingestion.id }
  }
  if (!current) return { insights: null, ingestionId: null }

  // A doc that was never read: read it now. A failure here is not fatal; the
  // run still writes from the project description, and generation failing for
  // the same reason (a dead key) throws on its own.
  const { data: memory } = await admin
    .from('soma_project_memory')
    .select('topics_covered, angles_used, running_summary')
    .eq('project_id', project.id)
    .maybeSingle()
  const memoryBlock = memory?.running_summary
    ? `\n\nSOMA MEMORY (do not repeat these):\n${memory.running_summary}\nTopics covered: ${(memory.topics_covered ?? []).join(', ') || 'none'}\nAngles used: ${(memory.angles_used ?? []).join(', ') || 'none'}`
    : ''
  const shape = '{"key_themes":["theme"],"wins":["win"],"challenges":["challenge"],"directional_shifts":["shift"],"content_angles":["angle1","angle2","angle3","angle4","angle5"],"emotional_tone":"grinding","diff_summary":"One sentence.","memory_update":"2-3 sentences of notes a social media manager would keep about what this covers."}'
  const prompt = previous
    ? `Compare these two master docs and extract what is NEW or CHANGED. Return ONLY valid JSON shaped like ${shape}\nPREVIOUS: ${previous.content.slice(0, 6000)}\nCURRENT: ${current.content.slice(0, 6000)}${memoryBlock}\nemotional_tone is one of: high, reflective, grinding, celebratory.`
    : `Analyze this master doc. Return ONLY valid JSON shaped like ${shape}\nMASTER DOC: ${current.content.slice(0, 8000)}${memoryBlock}\nemotional_tone is one of: high, reflective, grinding, celebratory.`

  let insights: SomaInsights
  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: SOMA_MODEL }, { timeout: GEMINI_TIMEOUT_MS })
    insights = parseGeminiJson((await model.generateContent(prompt)).response.text()) as SomaInsights
  } catch (err) {
    console.warn(`[SOMA] reading the master doc failed for project ${project.id}:`, errorMessage(err, 'unknown error'))
    return { insights: null, ingestionId: null }
  }

  const label = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  const { data: saved, error: saveErr } = await admin.from('soma_weekly_ingestion').insert({
    project_id:            project.id,
    workspace_id:          project.workspace_id,
    user_id:               project.user_id,
    week_label:            `Auto — ${label}`,
    raw_input:             current.content,
    extracted_insights:    insights,
    is_diff:               !!previous,
    generated_posts_count: 0,
    metadata:              { auto: true },
  }).select('id').single()
  if (saveErr) console.warn('[SOMA] could not save the ingestion:', saveErr.message)

  const { error: memErr } = await admin.from('soma_project_memory').upsert({
    project_id:      project.id,
    workspace_id:    project.workspace_id,
    user_id:         project.user_id,
    topics_covered:  Array.from(new Set([...(memory?.topics_covered ?? []), ...(insights.key_themes ?? [])])),
    angles_used:     Array.from(new Set([...(memory?.angles_used ?? []), ...(insights.content_angles ?? [])])),
    running_summary: [memory?.running_summary, `[Auto — ${label}]: ${insights.memory_update ?? ''}`].filter(Boolean).join('\n\n'),
    updated_at:      now.toISOString(),
  }, { onConflict: 'project_id' })
  if (memErr) console.warn('[SOMA] could not update project memory:', memErr.message)

  return { insights, ingestionId: saved?.id ?? null }
}

// ── The run ─────────────────────────────────────────────────────────────────

/** Takes one generation's credits (monthly first) and logs it. Returns what was charged. */
async function chargeRun(
  admin: SupabaseClient, workspaceId: string, userId: string, trigger: SomaTrigger, projectId: string, posts: number,
): Promise<number> {
  const { data: balances, error: balErr } = await admin
    .from('workspaces')
    .select('soma_credits_monthly, soma_credits_used, soma_credits_purchased')
    .eq('id', workspaceId)
    .single()
  if (balErr || !balances) {
    console.error('[SOMA] could not read credits to charge the run:', balErr?.message)
    return 0
  }
  const after = splitCharge(balances, GENERATE_COST)
  const { error: chargeErr } = await admin.from('workspaces')
    .update({ soma_credits_used: after.used, soma_credits_purchased: after.purchased })
    .eq('id', workspaceId)
  if (chargeErr) {
    console.error('[SOMA] charge failed:', chargeErr.message)
    return 0
  }
  const { error: ledgerErr } = await admin.from('soma_credit_ledger').insert({
    workspace_id:  workspaceId,
    user_id:       userId,
    action_type:   LEDGER_ACTION[trigger],
    credits_used:  GENERATE_COST,
    balance_after: after.balanceAfter,
    metadata:      { project_id: projectId, trigger, posts },
  })
  if (ledgerErr) console.warn('[SOMA] ledger insert failed:', ledgerErr.message)
  return GENERATE_COST
}

export async function runSomaGeneration(opts: SomaRunOptions): Promise<SomaRunResult> {
  const { admin, project, workspace, trigger, insights } = opts
  const now = opts.now ?? new Date()
  const started = Date.now()
  // Worst case is the budget plus one call already in flight (GEMINI_TIMEOUT_MS)
  // plus the saves: about 55s, inside the 60s function limit.
  const budgetMs = opts.budgetMs ?? 30_000

  const mode = effectiveSomaMode(project.mode, workspace)
  const platforms = (project.platforms ?? []).filter(isSomaPlatform)
  const { schedule } = capSchedule(platforms, project.platform_schedule, mode, project.posts_per_day ?? 1)
  const { days, windowDays } = runWindow(project, mode, trigger, now, opts.startDate)

  const result: SomaRunResult = {
    mode, platforms, windowDays, windowStart: days[0] ?? utcDayKey(now),
    openSlots: 0, postsCreated: 0, postIds: [], platformCounts: {}, platformErrors: {}, unfilled: 0, charged: 0,
  }
  if (!platforms.length || !days.length) return result

  const fromIso = `${days[0]}T00:00:00.000Z`
  const toIso = new Date(Date.parse(`${days[days.length - 1]}T00:00:00Z`) + 86_400_000).toISOString()
  const existing = await loadExistingSlots(admin, project, fromIso, toIso)
  const projectOffsetMin = parseInt(String(project.id).replace(/[^0-9a-f]/gi, '').slice(0, 4) || '0', 16) % 9
  const open = planGapSlots({ platforms, schedule, days, existing, now, extraOffsetMin: projectOffsetMin })
  result.openSlots = open.length
  if (!open.length) return result

  // Context shared by every call.
  const [{ data: profile, error: profileErr }, { data: memory, error: memoryErr }, { data: recent, error: recentErr }] = await Promise.all([
    admin.from('soma_identity_profiles')
      .select('tone_profile, writing_style_rules, behavioral_traits, voice_examples, personality_summary, personality_tier')
      .eq('workspace_id', project.workspace_id)
      .maybeSingle(),
    admin.from('soma_project_memory')
      .select('running_summary, topics_covered, angles_used, total_posts_generated')
      .eq('project_id', project.id)
      .maybeSingle(),
    admin.from('posts')
      .select('content')
      .eq('workspace_id', project.workspace_id)
      .or(`metadata->>soma_project_id.eq.${project.id},metadata->>project_id.eq.${project.id}`)
      .order('scheduled_at', { ascending: false })
      .limit(15),
  ])
  if (profileErr) console.warn('[SOMA] voice profile lookup failed:', profileErr.message)
  if (memoryErr) console.warn('[SOMA] memory lookup failed:', memoryErr.message)
  if (recentErr) console.warn('[SOMA] recent posts lookup failed:', recentErr.message)

  const memoryBlock = memory?.running_summary
    ? `\n\nSOMA MEMORY (do not repeat these topics or angles):\n${memory.running_summary}\nTopics covered: ${(memory.topics_covered ?? []).join(', ') || 'none'}\nAngles used: ${(memory.angles_used ?? []).join(', ') || 'none'}`
    : ''
  const recentBlock = recent?.length
    ? `\n\nALREADY WRITTEN FOR THIS PROJECT (do not repeat these openings or angles):\n${recent.map(r => `- ${String(r.content ?? '').replace(/\s+/g, ' ').slice(0, 140)}`).join('\n')}`
    : ''
  const shared = `${voiceContext(profile)}

${insightContext(project, insights)}${campaignContext(project)}${videoContext(project)}${memoryBlock}${recentBlock}

Today's date is ${utcDayKey(now)}. Do not put dates or times in the posts: publish times are assigned separately.
Never state a price, plan limit or feature count unless it appears in the insights or project description above.`

  // One hung request must not eat the function's whole time limit.
  const model = new GoogleGenerativeAI(opts.apiKey).getGenerativeModel({ model: SOMA_MODEL }, { timeout: GEMINI_TIMEOUT_MS })
  const overBudget = () => Date.now() - started > budgetMs
  const usedImages = new Set<string>()
  const seen = new Set<string>()

  const chunks = chunkSlots(open)
  const outcomes = await mapWithConcurrency(chunks, GEMINI_CONCURRENCY, async (chunk) => {
    const platform = chunk[0].platform
    const wanted = chunk.length
    const prompt = `${shared}

PLATFORM: ${platform.toUpperCase()}
FORMAT RULES: ${PLATFORM_INSTRUCTIONS[platform] ?? `${platform}: natural and platform-appropriate.`}

Write exactly ${wanted} posts for ${platform}, each a different angle. They go out between ${chunk[0].day} and ${chunk[chunk.length - 1].day}.
Return ONLY valid JSON: {"posts":[{"content":"the post","content_type":"mindset"}]}

Rules:
- content_type varies across ${CONTENT_TYPES.join(', ')}
- Never use "In today's world", "Let's dive in", "game-changer", "synergy" or "leverage"
- Specific to the themes above, not generic; sound human, not AI-generated
- Respect ${platform}'s length limit`

    // Retry short and failed answers; back off longer on a rate limit, since
    // 429s are per minute and clear on their own.
    let lastError = 'Unknown Gemini error'
    let best: GeneratedPost[] = []
    for (let attempt = 0; attempt < 3; attempt++) {
      // Past the budget, keep what we have instead of retrying into the limit.
      if (attempt > 0 && overBudget()) break
      if (attempt > 0) await new Promise(r => setTimeout(r, (/429|quota|rate/i.test(lastError) ? 6000 : 1500) * attempt))
      try {
        const valid = readGeneratedPosts(parseGeminiJson((await model.generateContent(prompt)).response.text()))
        if (valid.length >= wanted) { best = valid; lastError = ''; break }
        if (valid.length > best.length) best = valid
        lastError = `Returned ${valid.length} of ${wanted} posts`
      } catch (err) {
        lastError = errorMessage(err, 'Unknown Gemini error')
      }
      console.warn(`[SOMA] ${platform} attempt ${attempt + 1}: ${lastError}`)
    }

    // Exact repeats within a run are dropped rather than scheduled twice.
    const posts = best.slice(0, wanted).filter(p => {
      const key = p.content.trim().toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const slots = chunk.slice(0, posts.length)

    let media: (string[] | null)[] = posts.map(() => null)
    if (project.include_media && posts.length) {
      media = (await mapWithConcurrency(posts, UNSPLASH_CONCURRENCY, p => fetchUnsplashImage(extractKeyword(p.content), usedImages)))
        .map(m => m ?? null)
    }

    const rows = posts.map((p, i) => ({
      user_id:      opts.actorUserId,
      workspace_id: project.workspace_id,
      content:      p.content.trim(),
      platforms:    [platform],
      status:       mode === 'safe' ? 'draft' : 'scheduled',
      scheduled_at: slots[i].at.toISOString(),
      destinations: {},
      metadata: {
        source:          'soma',
        soma_project_id: project.id,
        trigger,
        ingestion_id:    opts.ingestionId ?? null,
        content_type:    typeof p.content_type === 'string' ? p.content_type : null,
      },
      ...(media[i] ? { media_urls: media[i] } : {}),
    }))
    if (!rows.length) return { platform, created: [] as { id: string; scheduled_at: string }[], error: lastError || 'No posts returned' }

    const { data: inserted, error: insertErr } = await admin.from('posts').insert(rows).select('id, scheduled_at')
    if (insertErr) {
      console.error(`[SOMA] insert failed (${platform}):`, insertErr.message)
      return { platform, created: [], error: `Could not save posts: ${insertErr.message}` }
    }
    const created = (inserted ?? []) as { id: string; scheduled_at: string }[]
    if (mode !== 'safe' && created.length) {
      try {
        await opts.enqueue(created.map(c => ({ postId: c.id, scheduledAt: c.scheduled_at })))
      } catch (err) {
        // The posts are saved as scheduled; the publish sweep still finds them, late.
        console.error('[SOMA] could not queue posts:', errorMessage(err, 'unknown error'))
      }
    }
    return { platform, created, error: posts.length < wanted ? lastError || `Returned ${posts.length} of ${wanted} posts` : '' }
  }, overBudget)

  let firstError = ''
  outcomes.forEach((o, i) => {
    if (!o) { result.unfilled += chunks[i].length; return }
    result.unfilled += chunks[i].length - o.created.length
    if (o.created.length) {
      result.postIds.push(...o.created.map(c => c.id))
      result.platformCounts[o.platform] = (result.platformCounts[o.platform] ?? 0) + o.created.length
    }
    if (o.error) {
      result.platformErrors[o.platform] = o.error
      firstError ||= o.error
    }
  })
  result.postsCreated = result.postIds.length

  // Open slots and nothing written: report it rather than return a quiet zero
  // (a dead key looked exactly like a week with nothing to do, for three weeks).
  if (!result.postsCreated) {
    throw new SomaRunError('generation_failed', firstError || 'SOMA could not write any posts')
  }

  // Charge once per run that wrote something, from fresh balances. A
  // continuation step belongs to a run that was already charged.
  if (!opts.continuation) result.charged = await chargeRun(admin, workspace.id, opts.actorUserId, trigger, project.id, result.postsCreated)

  // Manual and Monday runs count against the mode's monthly runs. The daily run
  // does not ("12 runs a month, plus a daily run"); it touches neither column,
  // because runs-this-month rolls over from last_generated_at (lib/soma-runs.ts).
  if (trigger !== 'daily' && !opts.continuation) {
    const { error: runErr } = await admin.from('soma_projects')
      .update({ runs_this_month: nextRunCount(project, now), last_generated_at: now.toISOString() })
      .eq('id', project.id)
    if (runErr) console.warn('[SOMA] run counter update failed:', runErr.message)
  }

  const { error: memErr } = await admin.from('soma_project_memory').upsert({
    project_id:            project.id,
    workspace_id:          project.workspace_id,
    user_id:               project.user_id,
    total_posts_generated: (memory?.total_posts_generated ?? 0) + result.postsCreated,
    updated_at:            now.toISOString(),
  }, { onConflict: 'project_id' })
  if (memErr) console.warn('[SOMA] memory post count update failed:', memErr.message)

  if (opts.ingestionId) {
    const { data: ing } = await admin.from('soma_weekly_ingestion').select('generated_posts_count').eq('id', opts.ingestionId).maybeSingle()
    const { error: ingErr } = await admin.from('soma_weekly_ingestion')
      .update({ generated_posts_count: (ing?.generated_posts_count ?? 0) + result.postsCreated })
      .eq('id', opts.ingestionId)
    if (ingErr) console.warn('[SOMA] ingestion count update failed:', ingErr.message)
  }

  console.log(`[SOMA] ${trigger} run, project ${project.id}: ${result.postsCreated} of ${result.openSlots} open slots filled (${mode})`)
  return result
}
