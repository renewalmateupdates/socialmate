export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { deleteAccount } from '@/lib/account-deletion'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

// Settings > Delete account. The order of the steps is the whole point, and it
// lives in lib/account-deletion.ts: until Nov 10, 2026 a failed auth delete
// here left people with their data gone and their login still working.
export async function POST() {
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await deleteAccount(getSupabaseAdmin(), {
      userId: user.id,
      email: user.email,
      cancelSubscription: (subscriptionId) => getStripe().subscriptions.cancel(subscriptionId),
    })

    if (!result.ok) {
      // Nothing was deleted, so the account still works; Settings tells them.
      console.error(`[Delete User] ${result.stage} step failed, account kept:`, result.error)
      return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
    }
    if (result.cleanupErrors.length > 0) {
      console.error('[Delete User] account deleted, some rows were not:', result.cleanupErrors)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Delete User] Unexpected error:', err)
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  }
}
