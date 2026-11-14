// Carries an image made in a free image tool (/tools/quote-card,
// /tools/image-resizer) into Compose, the way lib/tool-draft.ts carries text.
// The image is kept in this browser (IndexedDB, since a PNG is too big for
// localStorage) and nothing is uploaded until the person is signed in and has
// asked for it: "Use in a post" while signed in, or "Attach" on the note
// Compose shows when an image is waiting.
//
// The checks are pure and tested (scripts/test-image-tools.mjs); the storage
// wrappers never throw, because private windows and blocked storage are common.

export type ImageToolId = 'quote-card' | 'image-resizer'

export interface ToolImageMeta {
  tool: ImageToolId
  name: string
  type: 'image/png' | 'image/jpeg'
  size: number
  savedAt: number
}

export const IMAGE_TOOLS: ImageToolId[] = ['quote-card', 'image-resizer']

export const IMAGE_TOOL_LABELS: Record<ImageToolId, string> = {
  'quote-card': 'quote card maker',
  'image-resizer': 'image resizer',
}

/** A week, the same as a text draft. */
export const TOOL_IMAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000
/** Well under Compose's 50 MB cap; a 1600x900 photo as JPG is about 0.5 MB. */
export const TOOL_IMAGE_MAX_BYTES = 15 * 1024 * 1024

/** Where "Use in a post" goes; /start works out signed in or not. */
export const START_FROM_TOOL_IMAGE = '/start?from=tool-image'

const TYPES = ['image/png', 'image/jpeg'] as const

function cleanName(name: string, type: ToolImageMeta['type']): string {
  const ext = type === 'image/png' ? 'png' : 'jpg'
  const base = name.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
  return `${base || 'image'}.${ext}`
}

/** What gets stored beside the image. Null for anything Compose would refuse. */
export function makeToolImageMeta(
  file: { type: string; size: number },
  tool: ImageToolId,
  name: string,
  now = Date.now(),
): ToolImageMeta | null {
  if (!IMAGE_TOOLS.includes(tool)) return null
  if (!(TYPES as readonly string[]).includes(file.type)) return null
  if (!(file.size > 0) || file.size > TOOL_IMAGE_MAX_BYTES) return null
  const type = file.type as ToolImageMeta['type']
  return { tool, name: cleanName(name, type), type, size: file.size, savedAt: now }
}

/** Reads stored metadata back, refusing anything malformed or past its week. */
export function parseToolImageMeta(raw: unknown, now = Date.now()): ToolImageMeta | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as Partial<ToolImageMeta>
  if (typeof m.tool !== 'string' || !IMAGE_TOOLS.includes(m.tool as ImageToolId)) return null
  if (typeof m.type !== 'string' || !(TYPES as readonly string[]).includes(m.type)) return null
  if (typeof m.size !== 'number' || !(m.size > 0) || m.size > TOOL_IMAGE_MAX_BYTES) return null
  if (typeof m.savedAt !== 'number' || now - m.savedAt > TOOL_IMAGE_TTL_MS || m.savedAt > now + 60_000) return null
  const type = m.type as ToolImageMeta['type']
  return { tool: m.tool as ImageToolId, name: cleanName(typeof m.name === 'string' ? m.name : '', type), type, size: m.size, savedAt: m.savedAt }
}

// ── Browser storage ──────────────────────────────────────────────────────────

const DB = 'sm_tool_image'
const STORE = 'pending'
const KEY = 'latest'

function openDb(): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    try {
      if (typeof indexedDB === 'undefined') { resolve(null); return }
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE) }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return openDb().then(db => new Promise<T | null>(resolve => {
    if (!db) { resolve(null); return }
    try {
      const tx = db.transaction(STORE, mode)
      const req = fn(tx.objectStore(STORE))
      tx.oncomplete = () => { db.close(); resolve(req.result ?? null) }
      tx.onerror = () => { db.close(); resolve(null) }
      tx.onabort = () => { db.close(); resolve(null) }
    } catch {
      db.close()
      resolve(null)
    }
  }))
}

/** Keeps one image (the newest replaces any older one). False when storage is blocked or the image is refused. */
export async function saveToolImage(blob: Blob, tool: ImageToolId, name: string): Promise<boolean> {
  const meta = makeToolImageMeta(blob, tool, name)
  if (!meta) return false
  const done = await run('readwrite', store => store.put({ meta, blob }, KEY))
  return done !== null
}

/** The waiting image as a File Compose can upload, or null. Expired or broken entries are cleared. */
export async function readToolImage(): Promise<{ file: File; meta: ToolImageMeta } | null> {
  const row = await run<{ meta?: unknown; blob?: unknown } | undefined>('readonly', store => store.get(KEY))
  if (!row) return null
  const meta = parseToolImageMeta(row.meta)
  if (!meta || !(row.blob instanceof Blob) || row.blob.size === 0) {
    await clearToolImage()
    return null
  }
  try {
    return { file: new File([row.blob], meta.name, { type: meta.type }), meta }
  } catch {
    return null
  }
}

export async function clearToolImage(): Promise<void> {
  await run('readwrite', store => store.delete(KEY))
}
