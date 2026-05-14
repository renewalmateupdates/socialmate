export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import IrisClient from './IrisClient'

export default async function IrisPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'socialmatehq@gmail.com') redirect('/dashboard')

  const admin = getSupabaseAdmin()

  // Opted-in recipient count
  const { count: optinCount } = await admin
    .from('user_settings')
    .select('*', { count: 'exact', head: true })
    .eq('iris_opt_in', true)

  // Recent dispatches
  const { data: dispatches } = await admin
    .from('iris_dispatches')
    .select('id, edition, subject, recipient_count, sent_at')
    .order('sent_at', { ascending: false })
    .limit(10)

  const nextEdition = (dispatches?.length ? dispatches[0].edition + 1 : 1)

  return (
    <IrisClient
      recipientCount={optinCount ?? 0}
      dispatches={dispatches ?? []}
      nextEdition={nextEdition}
    />
  )
}
