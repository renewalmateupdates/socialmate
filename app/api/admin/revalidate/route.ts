import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'

// Refresh cached pages on demand, after an edit made straight to the database.
//
// Blog posts are prerendered at deploy and cached for a day
// (app/blog/[slug]/page.tsx, revalidate = 86400), so a fix to blog_posts in
// Supabase stays invisible until the cache expires or something else deploys.
// That held back the Oct 15 accuracy sweep, and on Oct 23 it held back the
// removal of the TikTok audit notes from 13 posts.
//
// POST { "paths": ["/blog/some-slug", ...] }. Each path is marked stale, and
// the next visit rebuilds it from the database.

const MAX_PATHS = 200

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const paths: unknown = body?.paths
  if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_PATHS) {
    return NextResponse.json({ error: `paths must be a list of 1 to ${MAX_PATHS} site paths` }, { status: 400 })
  }

  // Site-relative paths only, like "/blog/slug". A full URL or "//host" is refused.
  const invalid = paths.filter(p => typeof p !== 'string' || !/^\/(?!\/)\S*$/.test(p) || p.length > 300)
  if (invalid.length) {
    return NextResponse.json({ error: 'invalid paths', invalid: invalid.slice(0, 10) }, { status: 400 })
  }

  for (const p of paths as string[]) revalidatePath(p)
  return NextResponse.json({ revalidated: paths.length })
}
