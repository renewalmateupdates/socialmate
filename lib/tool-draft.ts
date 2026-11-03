// Carries a post written in a free tool (/tools/*) into the product, so a
// visitor who wrote something worth posting does not start again after
// signing up. The tool saves it in this browser; onboarding's first-post step
// and Compose pick it up. Nothing is sent to a server until the person saves
// or schedules the post themselves.
//
// The parsing is pure and tested (scripts/test-tool-draft.mjs); the storage
// wrappers never throw, because private windows and blocked storage are common.

export type ToolId = 'character-counter' | 'linkedin-formatter' | 'thread-splitter' | 'discord-timestamp' | 'utm-builder'

export interface ToolDraft {
  text: string
  tool: ToolId
  savedAt: number
}

const KEY = 'sm_tool_draft'
/** A week: long enough to sign up and confirm an email, short enough not to surprise anyone later. */
export const TOOL_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const TOOL_DRAFT_MAX_CHARS = 10_000

const TOOLS: ToolId[] = ['character-counter', 'linkedin-formatter', 'thread-splitter', 'discord-timestamp', 'utm-builder']

export const TOOL_LABELS: Record<ToolId, string> = {
  'character-counter': 'character counter',
  'linkedin-formatter': 'LinkedIn formatter',
  'thread-splitter': 'thread splitter',
  'discord-timestamp': 'Discord timestamp generator',
  'utm-builder': 'UTM link builder',
}

/** What gets stored: trimmed, capped, stamped. Null when there is nothing worth keeping. */
export function makeToolDraft(text: string, tool: ToolId, now = Date.now()): ToolDraft | null {
  const trimmed = text.trim().slice(0, TOOL_DRAFT_MAX_CHARS)
  if (!trimmed || !TOOLS.includes(tool)) return null
  return { text: trimmed, tool, savedAt: now }
}

/** Reads a stored value back, refusing anything malformed or past its week. */
export function parseToolDraft(raw: string | null, now = Date.now()): ToolDraft | null {
  if (!raw) return null
  try {
    const d = JSON.parse(raw) as Partial<ToolDraft>
    if (typeof d.text !== 'string' || !d.text.trim()) return null
    if (typeof d.tool !== 'string' || !TOOLS.includes(d.tool as ToolId)) return null
    if (typeof d.savedAt !== 'number' || now - d.savedAt > TOOL_DRAFT_TTL_MS || d.savedAt > now + 60_000) return null
    return { text: d.text.slice(0, TOOL_DRAFT_MAX_CHARS), tool: d.tool as ToolId, savedAt: d.savedAt }
  } catch {
    return null
  }
}

export function saveToolDraft(text: string, tool: ToolId): boolean {
  const draft = makeToolDraft(text, tool)
  if (!draft) return false
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function readToolDraft(): ToolDraft | null {
  try {
    const draft = parseToolDraft(window.localStorage.getItem(KEY))
    if (!draft) window.localStorage.removeItem(KEY)
    return draft
  } catch {
    return null
  }
}

export function clearToolDraft(): void {
  try { window.localStorage.removeItem(KEY) } catch { /* storage blocked: nothing to clear */ }
}

/** Where the "Schedule this post" button sends people; /start works out signed in or not. */
export const START_FROM_TOOL = '/start?from=tool'
