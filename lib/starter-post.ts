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
