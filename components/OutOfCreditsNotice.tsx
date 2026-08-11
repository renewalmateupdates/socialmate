import Link from 'next/link'

// Running out of AI credits is a buying moment, not an error.
//
// Every AI tool surface should offer the same way out, and until now they did
// not: /sm-pulse, /sm-radar, /content-gap and /compose each grew their own
// "Get more credits" block, while /ai-features/bio-writer, content-calendar,
// profile-optimizer and tiktok-script just said "Not enough credits. You need 5
// credits." and left the user with nowhere to go. Same product, same moment,
// four dead ends — because the block was copy-pasted per page instead of shared.
//
// Shown persistently whenever the balance is short, rather than only after a
// failed click, so the wall is visible before someone fills out the form.
export default function OutOfCreditsNotice({
  needed,
  remaining,
  action = 'use this tool',
}: {
  needed: number
  remaining: number
  // Reads as "You need N credits to <action>." Keep it a verb phrase.
  action?: string
}) {
  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex-1">
        You need {needed} credits to {action}. You have {remaining} remaining.
      </p>
      <Link
        href="/settings?tab=Plan"
        className="self-start sm:self-auto flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all"
      >
        Get more credits →
      </Link>
    </div>
  )
}
