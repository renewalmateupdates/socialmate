import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

export async function POST(request: NextRequest) {
  const { postId, errorMessage } = await request.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const adminSupabase = getSupabaseAdmin()

  // Get post to find owner
  const { data: post } = await adminSupabase
    .from('posts')
    .select('user_id, content')
    .eq('id', postId)
    .single()

  // Mark as failed
  await adminSupabase
    .from('posts')
    .update({ status: 'failed' })
    .eq('id', postId)
    .eq('status', 'scheduled')

  // Send post failed email if enabled
  if (post?.user_id) {
    try {
      const { data: settings } = await adminSupabase
        .from('user_settings')
        .select('notification_prefs')
        .eq('user_id', post.user_id)
        .single()

      const prefs = (settings?.notification_prefs ?? {}) as Record<string, boolean>

      if (prefs.post_failed !== false) {
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(post.user_id)
        const email = authUser?.user?.email

        if (email) {
          const errMsg = errorMessage || 'Unknown error'
          await getResend().emails.send({
            from: 'SocialMate <notifications@socialmate.studio>',
            to: email,
            subject: 'Your post failed to publish — action needed',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #111;">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 16px;">SocialMate</div>
                <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Post publish failed</h2>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">Your scheduled post failed to publish. Here's what happened:</p>
                <div style="background: #fff5f5; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px; margin: 16px 0;">
                  <strong style="font-size: 12px; color: #dc2626;">Error:</strong>
                  <p style="margin: 4px 0 0; font-size: 14px; color: #dc2626;">${errMsg}</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'}/drafts"
                  style="display: inline-block; background: #EC4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px;">
                  View your drafts →
                </a>
                <p style="color: #aaa; font-size: 12px; margin-top: 24px;">To disable these emails, go to Settings → Notifications.</p>
              </div>
            `,
          })
        }
      }
    } catch (emailErr) {
      console.error('Failed to send post failed email (non-fatal):', emailErr)
    }
  }

  return NextResponse.json({ success: true })
}
