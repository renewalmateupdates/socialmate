export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const admin = getSupabaseAdmin()

  try {
    // 1. Cancel any active Stripe subscription
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single()

    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
      } catch (stripeErr) {
        // Log but don't block — subscription may already be cancelled
        console.error('[Delete User] Stripe cancel error:', stripeErr)
      }
    }

    // 2. Delete all user data in dependency order
    // Post destinations first (FK → posts)
    await admin.from('post_destinations').delete().eq('user_id', userId)

    // Posts
    await admin.from('posts').delete().eq('user_id', userId)

    // Remove user from other workspaces' team_members
    await admin.from('team_members').delete().eq('user_id', userId)

    // Delete workspaces owned by this user (and their team_members via cascade or explicit)
    const { data: ownedWorkspaces } = await admin
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)

    if (ownedWorkspaces && ownedWorkspaces.length > 0) {
      const wsIds = ownedWorkspaces.map((w: any) => w.id)
      await admin.from('team_members').delete().in('workspace_id', wsIds)
      await admin.from('workspaces').delete().in('id', wsIds)
    }

    // Connected social accounts
    await admin.from('connected_accounts').delete().eq('user_id', userId)

    // Media files — delete from storage bucket then from table
    const { data: mediaFiles } = await admin
      .from('media_files')
      .select('storage_path')
      .eq('user_id', userId)

    if (mediaFiles && mediaFiles.length > 0) {
      const paths = mediaFiles.map((f: any) => f.storage_path).filter(Boolean)
      if (paths.length > 0) {
        await admin.storage.from('media').remove(paths)
      }
    }
    await admin.from('media_files').delete().eq('user_id', userId)
    await admin.from('media').delete().eq('user_id', userId)

    // Bio / Link in Bio
    await admin.from('bio_pages').delete().eq('user_id', userId)
    await admin.from('link_in_bio').delete().eq('user_id', userId)

    // Content tools
    await admin.from('post_templates').delete().eq('user_id', userId)
    await admin.from('hashtag_collections').delete().eq('user_id', userId)
    await admin.from('competitor_accounts').delete().eq('user_id', userId)

    // Affiliate / referral
    await admin.from('affiliate_conversions').delete().eq('user_id', userId)
    await admin.from('affiliate_notifications').delete().eq('user_id', userId)
    await admin.from('affiliate_payouts').delete().eq('user_id', userId)
    await admin.from('affiliate_promo_codes').delete().eq('user_id', userId)
    await admin.from('affiliate_tax_forms').delete().eq('user_id', userId)
    await admin.from('affiliate_profiles').delete().eq('user_id', userId)
    await admin.from('affiliates').delete().eq('user_id', userId)
    await admin.from('referral_conversions').delete().eq('referred_user_id', userId)
    await admin.from('invite_tokens').delete().eq('user_id', userId)

    // Notifications / settings
    await admin.from('notifications').delete().eq('user_id', userId)
    await admin.from('user_settings').delete().eq('user_id', userId)
    await admin.from('feedback').delete().eq('user_id', userId)

    // Profile (last public table before auth delete)
    await admin.from('profiles').delete().eq('id', userId)

    // 3. Delete the auth user — this is the point of no return
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('[Delete User] Auth delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Delete User] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
