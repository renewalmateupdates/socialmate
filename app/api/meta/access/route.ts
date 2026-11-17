export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { canConnectMeta } from '@/lib/meta-access'

// Tells /accounts whether to show the Instagram, Facebook and Threads cards
// before Meta App Review. Same check as the connect routes.
export async function GET() {
  return NextResponse.json({ allowed: await canConnectMeta() })
}
