// The one thing the SOMA dashboard asks for next.
//
// The old dashboard opened on eight sections at once (credits, credit packs,
// identity, a legacy weekly ingestion, the queue, projects, quick actions,
// performance), and a new user's real first step was a small link in one of
// them. This picks a single step, in the order that gets someone to posts
// soonest: a project, a doc for it, their drafts, their voice, then a run.
//
// Pure, so it can be tested without the page.

export interface NextStepProject {
  id: string
  name: string
  paused?: boolean | null
  last_doc: { version: number; created_at: string } | null
  auto_collect_url?: string | null
  upcoming_posts: number
  /** The mode the workspace pays for (effectiveSomaMode), not the saved one. */
  effectiveMode: 'safe' | 'autopilot' | 'full_send'
}

export type NextStep =
  | { kind: 'create_project' }
  | { kind: 'add_doc'; project: NextStepProject }
  | { kind: 'review'; count: number }
  | { kind: 'voice' }
  | { kind: 'generate'; project: NextStepProject }
  | { kind: 'done'; automated: boolean }

export function pickNextStep(input: {
  projects: NextStepProject[]
  draftCount: number
  hasVoice: boolean
}): NextStep {
  const active = input.projects.filter(p => !p.paused)
  if (!input.projects.length) return { kind: 'create_project' }

  // A saved link counts: the Monday run reads it.
  const needsDoc = active.find(p => !p.last_doc && !p.auto_collect_url?.trim())
  if (needsDoc) return { kind: 'add_doc', project: needsDoc }

  if (input.draftCount > 0) return { kind: 'review', count: input.draftCount }
  if (!input.hasVoice) return { kind: 'voice' }

  // Automated projects fill themselves; a Safe one with an empty week needs a run.
  const idleSafe = active.find(p => p.effectiveMode === 'safe' && p.upcoming_posts === 0)
  if (idleSafe) return { kind: 'generate', project: idleSafe }

  return { kind: 'done', automated: active.some(p => p.effectiveMode !== 'safe') }
}
