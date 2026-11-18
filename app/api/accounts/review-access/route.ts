export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { canConnectMeta, canConnectYouTube } from '@/lib/review-access'

// Tells /accounts which platforms still waiting on their own review (Meta,
// Google) the signed-in person may connect. Same checks as the connect routes.
export async function GET() {
  const [meta, youtube] = await Promise.all([canConnectMeta(), canConnectYouTube()])
  return NextResponse.json({ meta, youtube })
}
