export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// PATCH /api/studio-stax/listing
// A lister edits the description and URL of their own listing from the portal.
// This used to be a browser-side update under an RLS policy, and RLS cannot
// limit columns: that policy let a lister set their own status, featured flag
// or donation rank. Only these two fields are writable here.
export async function PATCH(req: NextRequest) {
  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { description?: unknown; url?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const url         = typeof body.url === 'string' ? body.url.trim() : ''

  if (!description) return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
  if (description.length > 2000) return NextResponse.json({ error: 'Description must be 2,000 characters or fewer.' }, { status: 400 })
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('protocol')
  } catch {
    return NextResponse.json({ error: 'Enter a full URL starting with https://' }, { status: 400 })
  }

  // ilike for case, then an exact compare: in ilike "_" matches any character,
  // so a_b@x.com would otherwise reach the listing of aXb@x.com.
  const email = user.email.toLowerCase()
  const admin = getSupabaseAdmin()
  const { data: candidates, error: findErr } = await admin
    .from('curated_listings')
    .select('id, applicant_email')
    .ilike('applicant_email', email)
    .order('created_at', { ascending: false })
  const listing = (candidates ?? []).find(l => (l.applicant_email ?? '').toLowerCase() === email)

  if (findErr) {
    console.warn('[StaxListing] lookup failed:', findErr.message)
    return NextResponse.json({ error: 'Could not load your listing.' }, { status: 500 })
  }
  if (!listing) return NextResponse.json({ error: 'No listing found for your email.' }, { status: 404 })

  const { error } = await admin
    .from('curated_listings')
    .update({ description, url, updated_at: new Date().toISOString() })
    .eq('id', listing.id)

  if (error) {
    console.warn('[StaxListing] update failed:', error.message)
    return NextResponse.json({ error: 'Failed to save changes.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, description, url })
}
