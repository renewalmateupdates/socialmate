// Client side of /api/workspaces/posts: the posts in a workspace, whoever wrote
// them, and the writes an owner or admin may make to their team's posts.
// Queue, Calendar and Drafts use this instead of querying `posts` from the
// browser, which RLS limits to the viewer's own rows.

export type PostsView = 'queue' | 'partial' | 'calendar' | 'drafts' | 'one'

/** Extra fields the API adds: whether the viewer wrote the post, and may change it. */
export type TeamPostFields = { mine?: boolean; can_manage?: boolean }

function wsParam(workspaceId?: string | null) {
  return workspaceId && workspaceId !== 'personal' ? `&workspaceId=${encodeURIComponent(workspaceId)}` : ''
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`)
  return data as T
}

export async function loadWorkspacePosts<T = Record<string, unknown>>(
  view: PostsView,
  workspaceId?: string | null,
  id?: string,
): Promise<(T & TeamPostFields)[]> {
  const res = await fetch(`/api/workspaces/posts?view=${view}${wsParam(workspaceId)}${id ? `&id=${encodeURIComponent(id)}` : ''}`, {
    cache: 'no-store',
  })
  const { posts } = await json<{ posts: (T & TeamPostFields)[] }>(res)
  return posts
}

export async function countWorkspaceDrafts(workspaceId?: string | null): Promise<number> {
  const res = await fetch(`/api/workspaces/posts?view=draft-count${wsParam(workspaceId)}`, { cache: 'no-store' })
  const { count } = await json<{ count: number }>(res)
  return count
}

export async function unschedulePosts(ids: string[]) {
  return json<{ updated: string[]; skipped: number }>(
    await fetch('/api/workspaces/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'unschedule' }),
    }),
  )
}

export async function editPost(id: string, content: string, platforms: string[]) {
  return json<{ updated: string[]; skipped: number }>(
    await fetch('/api/workspaces/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id], action: 'edit', content, platforms }),
    }),
  )
}

export async function deletePosts(ids: string[]) {
  return json<{ deleted: string[]; skipped: number }>(
    await fetch('/api/workspaces/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }),
  )
}
