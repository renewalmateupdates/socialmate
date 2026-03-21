import { createBrowserClient } from '@supabase/ssr'

// Provide fallback values during build so module initialization doesn't throw.
// At runtime these env vars are always set via Vercel.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)
