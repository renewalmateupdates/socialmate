export const dynamic = 'force-dynamic'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { inngest } from '@/lib/inngest'
 
function getResend() { return new Resend(process.env.RESEND_API_KEY) }
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
 
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
 
      // Auto-create personal workspace if it doesn't exist yet
      try {
        const { data: existingWs } = await adminSupabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', session.user.id)
          .eq('is_personal', true)
          .single()
 
        if (!existingWs) {
          await adminSupabase
            .from('workspaces')
            .insert({
              owner_id:    session.user.id,
              name:        'Personal',
              is_personal: true,
            })
        }
      } catch (err) {
        console.error('Personal workspace creation error:', err)
      }
 
      // Referral tracking
      const refCode = cookieStore.get('sm_ref')?.value
      if (refCode) {
        try {
          const { data: referrerSettings } = await adminSupabase
            .from('user_settings')
            .select('user_id')
            .eq('referral_code', refCode)
            .single()
 
          if (referrerSettings && referrerSettings.user_id !== session.user.id) {
            await adminSupabase
              .from('referral_conversions')
              .upsert({
                affiliate_user_id: referrerSettings.user_id,
                referred_user_id:  session.user.id,
                referral_code:     refCode,
                status:            'pending',
                converted_at:      new Date().toISOString(),
                lock_expires_at:   new Date(
                  Date.now() + 60 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }, {
                onConflict:       'referred_user_id',
                ignoreDuplicates: true,
              })
          }
        } catch (err) {
          console.error('Referral tracking error:', err)
        }
        cookieStore.delete('sm_ref')
      }
 
      // Welcome email — only on first signup (account created within 60s + no flag set)
      try {
        const email = session.user.email
        const createdAt = new Date(session.user.created_at).getTime()
        const isNewAccount = Date.now() - createdAt < 60_000

        const { data: emailFlagRow } = await adminSupabase
          .from('user_settings')
          .select('welcome_email_sent')
          .eq('user_id', session.user.id)
          .single()

        const alreadySent = emailFlagRow?.welcome_email_sent === true

        if (email && isNewAccount && !alreadySent) {
          await adminSupabase
            .from('user_settings')
            .update({ welcome_email_sent: true })
            .eq('user_id', session.user.id)

          // Fire onboarding email sequence via Inngest (Day 0 welcome, Day 3 AI tools, Day 7 upgrade nudge)
          const firstName = (session.user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
            || (session.user.user_metadata?.name as string | undefined)?.split(' ')[0]
            || undefined
          inngest.send({
            name: 'user/signup',
            data: { email, firstName },
          }).catch((err: unknown) => console.error('[auth/callback] Failed to send user/signup event:', err))

          await getResend().emails.send({
            from: 'SocialMate <hello@socialmate.studio>',
            to: email,
            subject: '👋 Welcome to SocialMate!',
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
                <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">SocialMate</div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Welcome aboard! 🎉</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                  Your account is all set. You're on the <strong>Free plan</strong> — schedule posts to
                  Bluesky, Discord, Telegram, Mastodon and more, with new platforms being added regularly.
                </p>
                <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
                  <div style="font-size: 13px; font-weight: 700; color: #111; margin-bottom: 12px;">Here's what you can do right now:</div>
                  <div style="font-size: 13px; color: #555; line-height: 2;">
                    📅 &nbsp;<a href="${appUrl}/calendar" style="color: #000;">Schedule your first post</a><br/>
                    🤖 &nbsp;<a href="${appUrl}/ai-features" style="color: #000;">Try the AI caption tools (50 credits free/month)</a><br/>
                    📊 &nbsp;<a href="${appUrl}/analytics" style="color: #000;">Set up your analytics</a><br/>
                    🔗 &nbsp;<a href="${appUrl}/link-in-bio" style="color: #000;">Build your link in bio page</a>
                  </div>
                </div>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">
                  Need more AI credits or connected accounts?
                  <a href="${appUrl}/pricing" style="color: #000; font-weight: 600;">Upgrade to Pro for $5/month →</a>
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #aaa; font-size: 12px;">SocialMate · Built for creators, small businesses, and agencies</p>
              </div>
            `,
          })
        }
      } catch (err) {
        console.error('Welcome email error:', err)
      }
 
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      // Read the ?redirect= param passed through from the login page (Google OAuth path)
      const redirectParam = requestUrl.searchParams.get('redirect')
      const defaultRedirect = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      // Only use redirectParam for authenticated pages — skip onboarding redirect check
      const finalRedirect = !profile?.onboarding_completed
        ? '/onboarding'
        : (redirectParam || defaultRedirect)
      return NextResponse.redirect(new URL(finalRedirect, requestUrl.origin))
    }
  }
 
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
 