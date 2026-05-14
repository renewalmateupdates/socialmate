import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export type HermesChannel = 'email' | 'bluesky' | 'mastodon'

export type SendResult = { ok: true } | { ok: false; error: string }

// ── Email ─────────────────────────────────────────────────────────────────────
export async function sendHermesEmail(params: {
  to: string
  subject: string
  body: string
  fromName?: string
}): Promise<SendResult> {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  try {
    await resend.emails.send({
      from: `${params.fromName ?? 'Joshua @ SocialMate'} <hello@socialmate.studio>`,
      to: [params.to],
      subject: params.subject,
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#111;line-height:1.6">${params.body.replace(/\n/g, '<br/>')}</div>`,
      text: params.body,
    })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Bluesky DM ────────────────────────────────────────────────────────────────
// Uses chat.bsky.convo XRPC with atproto-proxy header.
// Requires the sender's connected Bluesky account tokens.
async function bskyRefreshSession(refreshToken: string): Promise<{ accessJwt: string; did: string } | null> {
  try {
    const res = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    if (!res.ok) return null
    const s = await res.json()
    return { accessJwt: s.accessJwt, did: s.did }
  } catch { return null }
}

async function bskyResolveHandle(handle: string): Promise<string | null> {
  // Strip leading @
  const h = handle.replace(/^@/, '')
  try {
    const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(h)}`)
    if (!res.ok) return null
    const { did } = await res.json()
    return did ?? null
  } catch { return null }
}

export async function sendHermesBluesky(params: {
  userId: string
  recipientHandle: string
  body: string
}): Promise<SendResult> {
  const supabase = getSupabaseAdmin()

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('access_token, refresh_token, platform_user_id')
    .eq('user_id', params.userId)
    .eq('platform', 'bluesky')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!account) return { ok: false, error: 'No Bluesky account connected' }

  // Refresh tokens
  let accessJwt = account.access_token
  const refreshed = await bskyRefreshSession(account.refresh_token)
  if (refreshed) {
    accessJwt = refreshed.accessJwt
    await supabase
      .from('connected_accounts')
      .update({ access_token: refreshed.accessJwt })
      .eq('user_id', params.userId)
      .eq('platform', 'bluesky')
  }

  // Resolve recipient DID
  const recipientDid = await bskyResolveHandle(params.recipientHandle)
  if (!recipientDid) return { ok: false, error: `Could not resolve Bluesky handle: ${params.recipientHandle}` }

  const chatHeaders = {
    Authorization: `Bearer ${accessJwt}`,
    'Content-Type': 'application/json',
    'atproto-proxy': 'did:web:api.bsky.chat#bsky_chat',
  }

  // Get or create DM convo
  const convoRes = await fetch('https://bsky.social/xrpc/chat.bsky.convo.getConvoForMembers', {
    method: 'GET',
    headers: { ...chatHeaders, 'Content-Type': '' },
  })
  // getConvoForMembers uses query params
  const convoResQ = await fetch(
    `https://bsky.social/xrpc/chat.bsky.convo.getConvoForMembers?members[]=${encodeURIComponent(recipientDid)}`,
    { headers: chatHeaders }
  )

  if (!convoResQ.ok) {
    const err = await convoResQ.json().catch(() => ({}))
    return { ok: false, error: err.message || `Bluesky convo error: HTTP ${convoResQ.status}` }
  }

  const { convo } = await convoResQ.json()
  if (!convo?.id) return { ok: false, error: 'Could not get Bluesky DM convo ID' }

  // Send message
  const sendRes = await fetch('https://bsky.social/xrpc/chat.bsky.convo.sendMessage', {
    method: 'POST',
    headers: chatHeaders,
    body: JSON.stringify({ convoId: convo.id, message: { text: params.body } }),
  })

  if (!sendRes.ok) {
    const err = await sendRes.json().catch(() => ({}))
    return { ok: false, error: err.message || `Bluesky send error: HTTP ${sendRes.status}` }
  }

  return { ok: true }
}

// ── Mastodon DM ───────────────────────────────────────────────────────────────
// Posts with visibility='direct' and @mention in body — arrives as DM.
export async function sendHermesMastodon(params: {
  userId: string
  recipientHandle: string   // @user@instance.social format
  body: string
}): Promise<SendResult> {
  const supabase = getSupabaseAdmin()

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('access_token, platform_user_id, instance_url')
    .eq('user_id', params.userId)
    .eq('platform', 'mastodon')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!account) return { ok: false, error: 'No Mastodon account connected' }

  let instanceHost = account.instance_url || ''
  if (!instanceHost && account.platform_user_id?.includes('@')) {
    const parts = account.platform_user_id.split('@')
    instanceHost = `https://${parts[parts.length - 1]}`
  }
  if (!instanceHost) instanceHost = 'https://mastodon.social'
  const base = instanceHost.replace(/\/$/, '')

  // Ensure mention is in the body
  const handle = params.recipientHandle.startsWith('@') ? params.recipientHandle : `@${params.recipientHandle}`
  const fullBody = `${handle} ${params.body}`

  const res = await fetch(`${base}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: fullBody, visibility: 'direct' }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: err.error || `Mastodon send error: HTTP ${res.status}` }
  }

  return { ok: true }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export async function dispatchHermesMessage(params: {
  messageId: string
  channel: HermesChannel
  userId: string
  prospectEmail?: string | null
  prospectBlueskyHandle?: string | null
  prospectMastodonHandle?: string | null
  subject?: string | null
  body: string
}): Promise<SendResult> {
  let result: SendResult

  if (params.channel === 'email') {
    if (!params.prospectEmail) return { ok: false, error: 'Prospect has no email address' }
    result = await sendHermesEmail({
      to: params.prospectEmail,
      subject: params.subject ?? '(no subject)',
      body: params.body,
    })
  } else if (params.channel === 'bluesky') {
    if (!params.prospectBlueskyHandle) return { ok: false, error: 'Prospect has no Bluesky handle' }
    result = await sendHermesBluesky({
      userId: params.userId,
      recipientHandle: params.prospectBlueskyHandle,
      body: params.body,
    })
  } else if (params.channel === 'mastodon') {
    if (!params.prospectMastodonHandle) return { ok: false, error: 'Prospect has no Mastodon handle' }
    result = await sendHermesMastodon({
      userId: params.userId,
      recipientHandle: params.prospectMastodonHandle,
      body: params.body,
    })
  } else {
    return { ok: false, error: `Unsupported channel: ${params.channel}` }
  }

  const supabase = getSupabaseAdmin()
  if (result.ok) {
    await supabase
      .from('hermes_messages')
      .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
      .eq('id', params.messageId)
  } else {
    await supabase
      .from('hermes_messages')
      .update({ status: 'failed', error_message: result.error })
      .eq('id', params.messageId)
  }

  return result
}
