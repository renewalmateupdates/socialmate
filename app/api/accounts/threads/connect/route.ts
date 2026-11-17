export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'
import { THREADS_SCOPES, appUrl, metaConnectOpen } from '@/lib/meta'

// Starts Threads login (Threads API, Nov 2026). Any Threads profile can connect;
// unlike Instagram it does not have to be a professional account.
export async function GET() {
  const base = appUrl()

  // Until Meta approves the app, Threads refuses anyone who isn't a Threads
  // tester on it, so the button is admin-only and the route matches.
  if (!metaConnectOpen() && !(await requireAdmin())) {
    return NextResponse.redirect(`${base}/accounts?error=threads_not_open`)
  }

  const clientId = process.env.THREADS_APP_ID
  if (!clientId) {
    console.error('[Threads OAuth] THREADS_APP_ID is not set')
    return NextResponse.redirect(`${base}/accounts?error=threads_not_configured`)
  }

  const state = crypto.randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('threads_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   1800,
    path:     '/',
  })

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${base}/api/accounts/threads/callback`,
    response_type: 'code',
    scope:         THREADS_SCOPES.join(','),
    state,
  })

  return NextResponse.redirect(`https://threads.net/oauth/authorize?${params.toString()}`)
}
