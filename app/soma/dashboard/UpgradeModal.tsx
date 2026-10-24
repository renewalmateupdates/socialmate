'use client'
import { useState } from 'react'
import { Check, Rocket, X, Zap } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { SOMA_MODE_LIMITS } from '@/lib/soma-mode'

// Live Stripe prices (CLAUDE.md, Stripe Live Price IDs).
const SOMA_AUTOPILOT_PRICE_ID = 'price_1TP8rU7OMwDowUuUYLBNAVux'
const SOMA_FULL_SEND_PRICE_ID = 'price_1TPlGE7OMwDowUuUWS0QUnLw'

/**
 * Buys Autopilot or Full Send. Opened when someone picks a mode their
 * workspace has not paid for. The feature lines come from lib/soma-mode.ts,
 * so they cannot drift from what the server enforces (this modal used to
 * promise review batches and "priority Gemini processing", neither real).
 */
export default function UpgradeModal({
  onClose, autopilotEnabled, fullSendEnabled,
}: { onClose: () => void; autopilotEnabled: boolean; fullSendEnabled: boolean }) {
  const { t } = useI18n()
  const { activeWorkspaceId } = useWorkspace()
  const [loading, setLoading] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const A = SOMA_MODE_LIMITS.autopilot
  const F = SOMA_MODE_LIMITS.full_send
  const tiers = [
    {
      id: 'autopilot', priceId: SOMA_AUTOPILOT_PRICE_ID, icon: Zap, price: '$10',
      name: t('app_soma_dashboard.mode_autopilot'), owned: autopilotEnabled,
      features: [
        t('app_soma_dashboard.tier_auto_schedule'),
        t('app_soma_dashboard.tier_monday'),
        t('app_soma_dashboard.tier_per_day', { n: A.postsPerDay }),
        t('app_soma_dashboard.tier_window', { days: A.windowDays }),
        t('app_soma_dashboard.tier_runs', { n: A.runsPerMonth }),
      ],
    },
    {
      id: 'full_send', priceId: SOMA_FULL_SEND_PRICE_ID, icon: Rocket, price: '$20',
      name: t('app_soma_dashboard.mode_full_send'), owned: fullSendEnabled,
      features: [
        t('app_soma_dashboard.tier_daily'),
        t('app_soma_dashboard.tier_per_day', { n: F.postsPerDay }),
        t('app_soma_dashboard.tier_window', { days: F.windowDays }),
        t('app_soma_dashboard.tier_runs', { n: F.runsPerMonth }),
      ],
    },
  ].filter(tier => !tier.owned)

  const buy = async (priceId: string, tierId: string) => {
    setLoading(tierId)
    setErr('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, workspaceId: activeWorkspaceId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) { setErr(data.error || 'Could not start checkout.'); setLoading(null); return }
      window.location.assign(data.url)
    } catch {
      setErr('Network error. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-300">
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
        <h2 className="text-lg font-bold text-white mb-1">
          {autopilotEnabled ? t('app_soma_dashboard.upgrade_full_send') : t('app_soma_dashboard.unlock_automation')}
        </h2>
        <p className="text-sm text-gray-400 mb-5">
          {autopilotEnabled ? t('app_soma_dashboard.already_autopilot') : t('app_soma_dashboard.choose_autonomous')}
        </p>

        <div className={`grid gap-3 mb-4 ${tiers.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {tiers.map(tier => (
            <div key={tier.id} className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <tier.icon className="w-5 h-5 text-amber-400" strokeWidth={1.75} />
                <p className="text-sm font-bold text-white">{tier.name}</p>
                <p className="ml-auto text-sm font-bold text-white">{tier.price}<span className="text-xs font-normal text-gray-500">/mo</span></p>
              </div>
              <ul className="space-y-1.5 mb-4 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 mt-px flex-shrink-0 text-emerald-400" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => buy(tier.priceId, tier.id)}
                disabled={loading !== null}
                className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold px-4 py-2.5 transition-colors disabled:opacity-60"
              >
                {loading === tier.id ? t('app_soma_dashboard.redirecting') : `${t('app_soma_dashboard.get_tier')} ${tier.name}`}
              </button>
            </div>
          ))}
        </div>

        {err && <p className="text-xs text-red-400 text-center mb-3">{err}</p>}
        <p className="text-center text-xs text-gray-500 mb-2">{t('app_soma_dashboard.safe_mode_included')}</p>
        <button onClick={onClose} className="w-full py-1 text-sm text-gray-400 hover:text-gray-200">
          {autopilotEnabled ? t('app_soma_dashboard.stay_autopilot') : t('app_soma_dashboard.stay_safe')}
        </button>
      </div>
    </div>
  )
}
