export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getValidAccessToken } from '@/lib/tiktok-auth'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    video_size,
    post_caption    = '',
    hashtags        = [],
    privacy_level   = 'PUBLIC_TO_EVERYONE',
    disable_duet    = false,
    disable_comment = false,
    disable_stitch  = false,
    sound_id,
    video_cover_timestamp_ms = 0,
    // 'direct' publishes straight to the profile. 'inbox' drops the video into
    // the creator's TikTok drafts so they finish it in the TikTok app — which
    // is the only place TikTok's sound library can legally be applied.
    destination = 'direct',
  } = body

  if (!video_size) return NextResponse.json({ error: 'video_size required' }, { status: 400 })

  const auth = await getValidAccessToken(user.id)
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: 400 })

  const hashtagStr = (hashtags as string[]).map((t: string) => `#${t.replace(/^#/, '')}`).join(' ')
  const fullCaption = [post_caption, hashtagStr].filter(Boolean).join('\n\n').slice(0, 2200)

  // TikTok's accepted privacy values. Anything unrecognised falls back to
  // SELF_ONLY: an unknown value is rejected by TikTok with an opaque error, and
  // if this is going to be wrong it must be wrong in the private direction.
  //
  // This used to be a hard `= 'SELF_ONLY'` override, correct while the app was
  // unaudited, with a comment saying to remove it once review passed. Review
  // passed on 17 May 2026 and the override stayed. Every video posted through
  // SocialMate since then went out private no matter which option the creator
  // chose, while confirm-upload recorded their actual choice in our database —
  // so the record said Public and TikTok had been told otherwise.
  const TIKTOK_PRIVACY = [
    'PUBLIC_TO_EVERYONE',
    'MUTUAL_FOLLOW_FRIENDS',
    'FOLLOWER_OF_CREATOR',
    'SELF_ONLY',
  ]
  const effectivePrivacy = TIKTOK_PRIVACY.includes(privacy_level)
    ? privacy_level
    : 'SELF_ONLY'

  const postInfo: Record<string, unknown> = {
    title:                    fullCaption,
    privacy_level:            effectivePrivacy,
    disable_duet,
    disable_comment,
    disable_stitch,
    // Was hardcoded to 0, so every video's thumbnail was its literal first
    // frame — very often black, since that is where most clips fade in from.
    // The studio now sends the frame the creator picked, measured from the
    // start of the trimmed clip that actually gets uploaded.
    video_cover_timestamp_ms: Math.max(0, Math.round(Number(video_cover_timestamp_ms) || 0)),
  }
  if (sound_id && sound_id !== 'original') postInfo.music_id = sound_id

  // FILE_UPLOAD: client will PUT the blob directly to TikTok's upload URL
  // No domain verification needed — avoids PULL_FROM_URL domain issues entirely
  // Two different TikTok endpoints. Direct Post publishes; inbox upload hands
  // the file to the creator's drafts. Both need video.upload, which we hold.
  const toInbox = destination === 'inbox'
  const initUrl = toInbox
    ? 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/'
    : 'https://open.tiktokapis.com/v2/post/publish/video/init/'

  const initRes = await fetch(initUrl, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${auth.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      // The inbox endpoint takes no post_info at all. Caption, privacy and
      // sound are chosen by the creator inside the TikTok app, so sending them
      // here would be ignored at best and rejected at worst.
      ...(toInbox ? {} : { post_info: postInfo }),
      source_info: {
        source:             'FILE_UPLOAD',
        video_size:         video_size,
        chunk_size:         video_size,   // single chunk
        total_chunk_count:  1,
      },
    }),
  })

  const initData = await initRes.json().catch(() => ({}))

  if (!initRes.ok) {
    const errCode = initData?.error?.code    || 'unknown'
    const errMsg  = initData?.error?.message || `TikTok init error ${initRes.status}`
    console.error('[tiktok/init-upload]', errCode, errMsg, JSON.stringify(initData))
    return NextResponse.json({ error: `[${errCode}] ${errMsg}`, code: errCode }, { status: 502 })
  }

  const { publish_id, upload_url } = initData?.data ?? {}
  if (!upload_url) return NextResponse.json({ error: 'No upload URL from TikTok' }, { status: 502 })

  return NextResponse.json({ upload_url, publish_id, open_id: auth.openId, full_caption: fullCaption, destination: toInbox ? 'inbox' : 'direct' })
}
