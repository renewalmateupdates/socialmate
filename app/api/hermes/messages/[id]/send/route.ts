export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { dispatchHermesMessage } from '@/lib/hermes-send'

async function getUser() {
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
  return supabase.auth.getUser()
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: message_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()

  // Load message with prospect
  const { data: message } = await supabase
    .from('hermes_messages')
    .select('*, hermes_prospects(name, email, bluesky_handle, mastodon_handle)')
    .eq('id', message_id)
    .eq('user_id', user.id)
    .single()

  if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  if (message.status === 'sent') return NextResponse.json({ error: 'Already sent' }, { status: 400 })

  const prospect = message.hermes_prospects as {
    name: string
    email?: string
    bluesky_handle?: string
    mastodon_handle?: string
  }

  const result = await dispatchHermesMessage({
    messageId: message_id,
    channel: message.channel,
    userId: user.id,
    prospectEmail: prospect.email,
    prospectBlueskyHandle: prospect.bluesky_handle,
    prospectMastodonHandle: prospect.mastodon_handle,
    subject: message.subject,
    body: message.body,
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })

  // Update prospect status + sequence step
  const step = message.step ?? 0
  const nextStep = step + 1
  const campaign = await supabase
    .from('hermes_campaigns')
    .select('sequence_days')
    .eq('id', message.campaign_id)
    .single()

  const sequenceDays: number[] = campaign.data?.sequence_days ?? [0, 3, 7]
  const nextContactDays = sequenceDays[nextStep]
  const nextContactAt = nextContactDays != null
    ? new Date(Date.now() + nextContactDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  await supabase
    .from('hermes_prospects')
    .update({
      status: 'contacted',
      sequence_step: nextStep,
      last_contacted_at: new Date().toISOString(),
      next_contact_at: nextContactAt,
    })
    .eq('id', message.prospect_id)

  return NextResponse.json({ ok: true })
}
