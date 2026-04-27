import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface ActivityOptions {
  workspace_id: string
  user_id: string
  actor_email?: string | null
  action: string
  entity_type: string
  entity_id?: string | null
  metadata?: Record<string, any>
}

// Non-fatal — wraps insert in try/catch so callers never break on activity log errors.
export async function logActivity(opts: ActivityOptions): Promise<void> {
  try {
    await getSupabaseAdmin().from('workspace_activity').insert({
      workspace_id: opts.workspace_id,
      user_id:      opts.user_id,
      actor_email:  opts.actor_email ?? null,
      action:       opts.action,
      entity_type:  opts.entity_type,
      entity_id:    opts.entity_id ?? null,
      metadata:     opts.metadata ?? {},
      created_at:   new Date().toISOString(),
    })
  } catch (err) {
    console.error('[workspace-activity] log failed (non-fatal):', err)
  }
}
