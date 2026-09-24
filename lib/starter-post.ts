// Ready-to-post first drafts, so nobody meets an empty box after connecting.
//
// Onboarding used to ask for a topic and hand back one of five generic
// motivational templates with a one-click Skip. 24 tracked users reached that
// step, 12 reached the end, and none of them saved a post. These are concrete,
// first person, editable, and short enough for every live platform's limit.

// The goal is whatever id step 1 saved ('schedule' | 'grow' | 'clients'); anything
// else, or nothing, gets the general drafts.
export type StarterGoal = string | null | undefined

const DRAFTS: Record<'schedule' | 'grow' | 'clients' | 'default', string[]> = {
  schedule: [
    "Setting up a posting schedule this week so I stop doing it by hand. This is the first scheduled post. What should I share more of?",
    "New routine: I write my posts in one sitting and schedule them for the week. This is the first one. What times work best for you?",
  ],
  grow: [
    "Starting a 30 day posting streak today. One post a day, and I'll share what actually gets a response. Tell me what you want to see.",
    "I'm going to post consistently for the next month and track what works. Day one. What's one thing you'd like me to write about?",
  ],
  clients: [
    "Getting my client posting in order this week: one workflow, everything scheduled ahead. What's the most annoying part of managing social for clients?",
    "Trying a calmer way to run client social media, with every post planned ahead in one place. What would make your week easier?",
  ],
  default: [
    "Trying a new way to post: scheduling everything in one place instead of hopping between tabs. First post is going out now. What are you working on this week?",
    "First post from my new setup. Everything I share will be scheduled ahead from here on. What should I talk about next?",
  ],
}

function draftsFor(goal: StarterGoal): string[] {
  return goal && goal in DRAFTS ? DRAFTS[goal as keyof typeof DRAFTS] : DRAFTS.default
}

export function starterDraftCount(goal: StarterGoal): number {
  return draftsFor(goal).length
}

/** Draft number `index` (wraps around) for the given onboarding goal. */
export function starterDraft(goal: StarterGoal, index = 0): string {
  const list = draftsFor(goal)
  return list[((index % list.length) + list.length) % list.length]
}

/** Compose link that opens with a starter draft already in the box. */
export function composeWithStarterHref(goal: StarterGoal = null): string {
  return `/compose?content=${encodeURIComponent(starterDraft(goal))}`
}

// ── Path + one sentence ─────────────────────────────────────────────────────
//
// The fixed drafts above guess what someone wants to say. This is the other
// shape, suggested on r/saasbuild: don't guess the topic, ask which kind of post
// it is and for one rough sentence (or a link), then wrap that sentence in a
// short frame the person can edit. No AI call, so it costs nothing and works
// when the AI provider is down. The sentence is used as typed: the frame is the
// only thing we write.

export type StarterPath = 'update' | 'promote' | 'teach'

export const STARTER_PATHS: { id: StarterPath; label: string; placeholder: string }[] = [
  { id: 'update',  label: 'Share an update',    placeholder: 'e.g. I finished my first stream overlay' },
  { id: 'promote', label: 'Promote something',  placeholder: 'e.g. my new channel, or paste a link' },
  { id: 'teach',   label: 'Teach something',    placeholder: 'e.g. lowering mic gain fixes most crackle' },
]

// Two frames per path so "Another idea" has something to switch to.
const SENTENCE_FRAMES: Record<StarterPath, ((s: string) => string)[]> = {
  update: [
    s => `Quick update: ${s}. What are you working on this week?`,
    s => `Update from my side: ${s}. What's new on yours?`,
  ],
  promote: [
    s => `${capitalize(s)}. I'd love for you to check it out and tell me what you think.`,
    s => `Here's what I'm putting out there: ${s}. If it sounds useful, tell me what you'd want from it.`,
  ],
  teach: [
    s => `One thing worth knowing: ${s}. Save this for later, and tell me what you want me to break down next.`,
    s => `A tip I wish I'd had sooner: ${s}. Anything you'd add?`,
  ],
}

// Used when the whole input is one link.
const LINK_FRAMES: Record<StarterPath, ((u: string) => string)[]> = {
  update: [
    u => `Here's what I've been up to: ${u}\n\nWhat do you think?`,
    u => `Sharing this: ${u}\n\nTell me what you make of it.`,
  ],
  promote: [
    u => `${u}\n\nThis is what I've been working on. Take a look and tell me what you think.`,
    u => `Take a look at this and tell me what you think: ${u}`,
  ],
  teach: [
    u => `Worth your time: ${u}\n\nWhat would you add?`,
    u => `Something I learned from this: ${u}\n\nHave you tried it?`,
  ],
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Capitalization is left to the frames: most put the sentence after a colon,
// where forcing a capital reads oddly.
function tidySentence(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').trim()
  s = s.replace(/[.!?…]+$/, '').trim()
  // People type "i finished..." on phones; the frame reads oddly otherwise.
  return s.replace(/^i(?=$|\s|')/, 'I')
}

/**
 * Build an editable draft from a path and one rough sentence or link.
 * Returns '' when there is nothing to build from, so the caller can fall back
 * to a fixed starter instead of showing an empty box.
 */
export function buildDraft(path: StarterPath, input: string, variant = 0): string {
  // Never truncated: cutting a pasted link in half breaks it, and the composer's
  // own counter already shows when a finished draft is over a platform's limit.
  const clean = input.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  const isLink = /^https?:\/\/\S+$/i.test(clean)
  const frames = isLink ? LINK_FRAMES[path] : SENTENCE_FRAMES[path]
  const frame = frames[((variant % frames.length) + frames.length) % frames.length]
  return frame(isLink ? clean : tidySentence(clean))
}

export function isStarterLink(input: string): boolean {
  return /^https?:\/\/\S+$/i.test(input.replace(/\s+/g, ' ').trim())
}

export function starterVariantCount(): number {
  return SENTENCE_FRAMES.update.length
}
