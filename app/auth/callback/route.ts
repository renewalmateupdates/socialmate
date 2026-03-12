import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      // Check for referral cookie and process it
      const refCode = cookieStore.get('sm_ref')?.value

      if (refCode) {
        try {
          const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          // Find the affiliate by their referral code in user_settings
          const { data: referrerSettings } = await adminSupabase
            .from('user_settings')
            .select('user_id')
            .eq('referral_code', refCode)
            .single()

          // Only create conversion if referrer exists and it's not self-referral
          if (referrerSettings && referrerSettings.user_id !== session.user.id) {
            await adminSupabase
              .from('referral_conversions')
              .upsert({
                affiliate_user_id: referrerSettings.user_id,
                referred_user_id: session.user.id,
                referral_code: refCode,
                status: 'pending',
                converted_at: new Date().toISOString(),
                lock_expires_at: new Date(
                  Date.now() + 60 * 24 * 60 * 60 * 1000
                ).toISOString(), // 60 days
              }, {
                onConflict: 'referred_user_id', // one referral per user
                ignoreDuplicates: true,
              })
          }
        } catch (err) {
          // Non-blocking — referral tracking failure should never break auth
          console.error('Referral tracking error:', err)
        }

        // Clear the referral cookie
        cookieStore.delete('sm_ref')
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      const redirectTo = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}