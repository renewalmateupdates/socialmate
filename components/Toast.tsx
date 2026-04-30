'use client'

/**
 * Shared Toast component — safe-area aware, mobile-friendly.
 * Replaces all inline fixed-bottom toast divs across the app.
 *
 * Usage (simple string state):
 *   <Toast message={toast} />
 *
 * Usage (typed object state):
 *   <Toast message={toast?.message ?? ''} type={toast?.type} />
 *
 * Usage (ok/boolean state):
 *   <Toast message={toast?.msg ?? ''} type={toast?.ok ? 'success' : 'error'} />
 */
export default function Toast({
  message,
  type = 'info',
}: {
  message: string
  type?: 'success' | 'error' | 'info'
}) {
  if (!message) return null

  const bg =
    type === 'error'   ? 'bg-red-500'   :
    type === 'success' ? 'bg-gray-900'  :
                         'bg-gray-900'

  const prefix =
    type === 'success' ? '✅ ' :
    type === 'error'   ? '❌ ' :
                         ''

  return (
    <div
      className={`fixed right-6 z-50 ${bg} text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl`}
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {prefix}{message}
    </div>
  )
}
