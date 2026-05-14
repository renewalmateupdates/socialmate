import Link from 'next/link'

export default async function IrisUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; email?: string }>
}) {
  const { success, error, email } = await searchParams
  const decodedEmail = email ? decodeURIComponent(email) : null

  return (
    <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">

        {/* IRIS logo mark */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center text-white font-black text-3xl mx-auto mb-6">
          I
        </div>
        <p className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">The IRIS Dispatch</p>

        {error ? (
          <>
            <h1 className="text-2xl font-black text-white mb-3">Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-8">
              We couldn't process your unsubscribe request. You can manage your preferences in Settings after logging in.
            </p>
          </>
        ) : success ? (
          <>
            <h1 className="text-2xl font-black text-white mb-3">You're unsubscribed</h1>
            {decodedEmail && (
              <p className="text-gray-500 text-sm mb-2">{decodedEmail}</p>
            )}
            <p className="text-gray-400 text-sm mb-8">
              You won't receive any more IRIS Dispatch emails. You can re-enable it anytime in SocialMate Settings → Notifications.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white mb-3">Unsubscribe</h1>
            <p className="text-gray-400 text-sm mb-8">
              Use the link in your email to unsubscribe, or manage preferences in Settings after logging in.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 bg-white text-black text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
            Back to SocialMate
          </Link>
          {success && (
            <Link
              href="/settings?tab=Notifications"
              className="w-full py-3 border border-gray-700 text-gray-300 text-sm font-semibold rounded-2xl hover:border-gray-500 transition-all">
              Re-subscribe in Settings →
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
