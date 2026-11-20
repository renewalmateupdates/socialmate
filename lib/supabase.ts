import { createBrowserClient } from '@supabase/ssr'
import { shareUserCheck } from '@/lib/shared-user'

// Provide fallback values during build so module initialization doesn't throw.
// At runtime these env vars are always set via Vercel.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)

// One sign-in check per page load instead of one per caller (lib/shared-user.ts).
// Browser only: on the server this module has no session, and a kept answer
// must never be shared between two people's requests.
if (typeof window !== 'undefined') {
  const auth = supabase.auth
  const shared = shareUserCheck(auth.getUser.bind(auth))
  auth.getUser = shared.getUser

  auth.onAuthStateChange((event, session) => {
    // A refreshed token is still the same person: keep the answer.
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return
    if (event === 'SIGNED_IN') {
      // supabase-js also says SIGNED_IN when it reads the session back on load
      // and whenever the tab regains focus. Only a different person matters,
      // and dropping the check in flight would just send a second one.
      const keptId = shared.keptUserId()
      if (!keptId || keptId === session?.user?.id) return
    }
    // Signed out, a different person signed in, or the user's own details changed.
    shared.forget()
  })
}
