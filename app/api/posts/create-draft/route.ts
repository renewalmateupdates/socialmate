// POST /api/posts/create-draft
// Used by the SocialMate Chrome extension to save web content directly to drafts.
// Accepts: { content, sourceUrl?, platforms? }
// Auth:    Supabase session cookie (credentials: 'include' from extension)
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// CORS headers — allow the Chrome extension origin (chrome-extension://*) and
// any direct browser call from socialmate.studio.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Sign in to SocialMate first' },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = await request.json()
    const {
      content,
      sourceUrl,
      platforms,
    } = body as {
      content:    string
      sourceUrl?: string
      platforms?: string[]
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const resolvedPlatforms = Array.isArray(platforms) && platforms.length > 0
      ? platforms
      : ['bluesky']

    // ── Resolve personal workspace ──────────────────────────────────────────
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: personalWs } = await adminSupabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    let workspaceId: string | null = personalWs?.id ?? null

    if (!workspaceId) {
      // Create personal workspace on first use
      const { data: newWs, error: wsError } = await adminSupabase
        .from('workspaces')
        .insert({
          owner_id:    user.id,
          name:        'Personal',
          is_personal: true,
        })
        .select('id')
        .single()

      if (wsError) {
        console.error('[create-draft] workspace create error:', wsError)
        return NextResponse.json(
          { error: 'Could not initialize workspace. Please contact support.' },
          { status: 500, headers: CORS_HEADERS }
        )
      }

      workspaceId = newWs?.id ?? null
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No workspace found. Please contact support.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // ── Insert draft ────────────────────────────────────────────────────────
    // Build insert payload; try source_url column non-fatally if it doesn't exist.
    const basePayload: Record<string, unknown> = {
      user_id:      user.id,
      workspace_id: workspaceId,
      content:      content.trim(),
      platforms:    resolvedPlatforms,
      status:       'draft',
    }

    // Attempt insert with source_url first, fall back without it if column missing
    let post: { id: string } | null = null
    let insertError: { message?: string; code?: string } | null = null

    if (sourceUrl) {
      const { data, error } = await supabase
        .from('posts')
        .insert({ ...basePayload, source_url: sourceUrl })
        .select('id')
        .single()

      if (error?.code === '42703') {
        // Column does not exist — retry without it
        const { data: data2, error: error2 } = await supabase
          .from('posts')
          .insert(basePayload)
          .select('id')
          .single()
        post = data2
        insertError = error2
      } else {
        post = data
        insertError = error
      }
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert(basePayload)
        .select('id')
        .single()
      post = data
      insertError = error
    }

    if (insertError || !post) {
      console.error('[create-draft] insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save draft', detail: insertError?.message },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json(
      { success: true, postId: post.id },
      { status: 200, headers: CORS_HEADERS }
    )

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[create-draft] unexpected error:', message)
    return NextResponse.json(
      { error: 'Failed to save draft', detail: message },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
