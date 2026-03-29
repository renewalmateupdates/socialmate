export const dynamic = 'force-dynamic'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code  = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
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
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Check if they have an affiliate_profile
      const { data: profile } = await adminSupabase
        .from('affiliate_profiles')
        .select('id, status, onboarding_completed')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (profile) {
        if (!profile.onboarding_completed) {
          const dest = token
            ? `/partners/onboarding?token=${token}`
            : '/partners/onboarding'
          return NextResponse.redirect(new URL(dest, requestUrl.origin))
        }
        if (profile.status === 'active') {
          return NextResponse.redirect(new URL('/partners/dashboard', requestUrl.origin))
        }
        return NextResponse.redirect(new URL('/partners/access-denied', requestUrl.origin))
      }

      // No profile — check if there's a valid invite token for this email
      if (token) {
        const { data: invite } = await adminSupabase
          .from('affiliate_invites')
          .select('id, email, status, expires_at')
          .eq('token', token)
          .eq('status', 'pending')
          .maybeSingle()

        if (invite && new Date(invite.expires_at) > new Date()) {
          // Create affiliate_profile
          const { data: newProfile } = await adminSupabase
            .from('affiliate_profiles')
            .insert({
              user_id:   session.user.id,
              email:     invite.email,
              status:    'pending',
              invite_token: token,
              invited_by: invite.email,
            })
            .select('id')
            .single()

          if (newProfile) {
            // Mark invite accepted
            await adminSupabase
              .from('affiliate_invites')
              .update({ status: 'accepted', responded_at: new Date().toISOString(), affiliate_profile_id: newProfile.id })
              .eq('id', invite.id)
          }

          return NextResponse.redirect(new URL(`/partners/onboarding?token=${token}`, requestUrl.origin))
        }
      }

      // No valid invite
      return NextResponse.redirect(new URL('/partners/access-denied', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/partners', requestUrl.origin))
}
