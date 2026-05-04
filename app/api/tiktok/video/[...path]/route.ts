export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

// Streams TikTok upload videos through socialmate.studio (which is domain-verified
// in TikTok's developer portal) so PULL_FROM_URL succeeds. Edge runtime = no
// Vercel response size limit, streams directly from Supabase.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const storagePath = path.join('/')

  if (!storagePath.startsWith('tiktok/')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const publicUrl   = `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`

  const res = await fetch(publicUrl)
  if (!res.ok) return new NextResponse('Not found', { status: 404 })

  return new NextResponse(res.body, {
    headers: {
      'Content-Type':   res.headers.get('content-type')   || 'video/webm',
      'Content-Length': res.headers.get('content-length') || '',
      'Accept-Ranges':  'bytes',
      'Cache-Control':  'public, max-age=3600',
    },
  })
}
