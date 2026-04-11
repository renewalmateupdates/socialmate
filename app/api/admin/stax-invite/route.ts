export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// ── POST — admin creates an approved Studio Stax listing + checkout link ──

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, tagline, applicant_name, applicant_email, url } = body

  if (!name?.trim() || !applicant_email?.trim()) {
    return NextResponse.json({ error: 'name and applicant_email are required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const token   = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72 hours

  const { data: listing, error } = await db
    .from('curated_listings')
    .insert({
      name:                   name.trim(),
      tagline:                tagline?.trim() || null,
      url:                    url?.trim() || null,
      applicant_name:         applicant_name?.trim() || null,
      applicant_email:        applicant_email.trim().toLowerCase(),
      status:                 'approved',
      category:               'other',
      checkout_token:         token,
      checkout_token_expires: expires,
      admin_notes:            `Admin invite by ${admin.email} on ${new Date().toLocaleDateString()}`,
    })
    .select('id')
    .single()

  if (error || !listing) {
    console.error('[StaxInvite]', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to create listing' }, { status: 500 })
  }

  const checkout_url = `${APP_URL}/studio-stax/checkout?token=${token}`

  return NextResponse.json({ success: true, listing_id: listing.id, checkout_url, expires })
}
