export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  // Admin auth check
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Get all users from Supabase auth (service role)
  const adminDb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // We'll send to ALL users for the launch email (they signed up, they should know it launched)
  const { data: { users }, error } = await adminDb.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0
  let failed = 0

  for (const u of users ?? []) {
    if (!u.email) continue
    const firstName = u.user_metadata?.full_name?.split(' ')[0] || u.user_metadata?.name?.split(' ')[0] || null
    const greeting = firstName ? `Hey ${firstName}` : 'Hey there'

    try {
      await resend.emails.send({
        from: 'Joshua @ SocialMate <hello@socialmate.studio>',
        to: u.email,
        subject: '🚀 SocialMate is officially live — and we\'re on Product Hunt today',
        html: generateLaunchEmail(greeting),
      })
      sent++
    } catch (err) {
      console.warn(`Failed to send to ${u.email}:`, err)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: users?.length ?? 0 })
}

function generateLaunchEmail(greeting: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:black;font-weight:900;font-size:16px;">S</span>
        </div>
        <span style="color:white;font-weight:700;font-size:16px;">SocialMate</span>
      </div>
    </div>

    <!-- Hero -->
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:32px;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:16px;">🚀</div>
      <h1 style="margin:0 0 12px;color:white;font-size:24px;font-weight:800;line-height:1.3;">${greeting}, SocialMate is officially live.</h1>
      <p style="margin:0;color:#888;font-size:15px;line-height:1.6;">I've been building this nights and weekends while working full-time. Today it's real.</p>
    </div>

    <!-- Features -->
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#aaa;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What you get — free</p>
      ${[
        'Schedule posts to Bluesky, Discord, Telegram &amp; Mastodon',
        '12 AI content tools — captions, hooks, hashtags, thread builder',
        'Bulk CSV scheduler — upload a spreadsheet, schedule 100 posts',
        'Link-in-Bio page builder with custom themes',
        'Analytics, best posting times, content streak tracker',
        'Team collaboration + approval workflows',
        'White-label mode for agencies',
      ].map(f => `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;"><span style="color:#22c55e;font-size:14px;margin-top:1px;">✓</span><span style="color:#ddd;font-size:14px;line-height:1.5;">${f}</span></div>`).join('')}
    </div>

    <!-- Promo -->
    <div style="background:#1a1200;border:1px solid #3d2e00;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🎁 Launch Day Promo</p>
      <p style="margin:0 0 12px;color:white;font-size:22px;font-weight:800;">50% off Pro for 3 months</p>
      <div style="background:#000;border:2px dashed #f59e0b;border-radius:10px;padding:12px 24px;display:inline-block;">
        <span style="color:#f59e0b;font-size:20px;font-weight:900;letter-spacing:3px;">SMLAUNCH50</span>
      </div>
      <p style="margin:12px 0 0;color:#888;font-size:12px;">Enter at checkout · Limited time</p>
    </div>

    <!-- SM-Give -->
    <div style="background:#0d1f0d;border:1px solid #1a3d1a;border-radius:16px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#4ade80;font-size:13px;font-weight:700;">❤️ SM-Give</p>
      <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;"><strong style="color:white;">2% of every paid subscription</strong> goes to charity through SM-Give — our initiative to give back as we grow. The bigger SocialMate gets, the more we give. <a href="https://socialmate.studio/give" style="color:#4ade80;">Learn more →</a></p>
    </div>

    <!-- Product Hunt CTA -->
    <div style="background:#1a0d0a;border:1px solid #3d1a0d;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;color:#ff6154;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">We're live on Product Hunt today</p>
      <p style="margin:0 0 16px;color:#ddd;font-size:14px;line-height:1.6;">If you believe in what we're building, an upvote would mean the world to me.</p>
      <a href="https://www.producthunt.com/posts/socialmate-2" style="display:inline-block;background:#ff6154;color:white;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:10px;">
        🔼 Upvote on Product Hunt
      </a>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://socialmate.studio" style="display:inline-block;background:white;color:black;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:10px;">
        Go to SocialMate →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #222;padding-top:24px;text-align:center;">
      <p style="margin:0 0 8px;color:#555;font-size:12px;">— Joshua, Founder · SocialMate / Gilgamesh Enterprise LLC</p>
      <p style="margin:0 0 8px;color:#555;font-size:12px;">Want to earn while you share? <a href="https://socialmate.studio/affiliate" style="color:#888;">Check out our affiliate program →</a></p>
      <p style="margin:0;color:#444;font-size:11px;">SocialMate · socialmate.studio · You received this because you signed up.</p>
    </div>

  </div>
</body>
</html>
  `
}
