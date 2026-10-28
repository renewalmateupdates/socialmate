'use client'
import { ArrowRight } from 'lucide-react'
import { track } from '@/lib/analytics'
import { shopHomeUrl } from '@/lib/shop/guide-products'

/**
 * One line above the nav pointing at the Gilgamesh shop. The landing page is
 * where the traffic is, and the hook is the giving, not the products.
 *
 * Copy comes in already translated because Landing is a server component.
 * A client component only so the click is recorded (`shop_clicked`).
 *
 * Keep the claim exact: 25% of guide *sales* and 25% of merch *profit*. Merch
 * has a print cost, so "25% of every sale" would overstate it.
 */
export default function ShopStrip({ badge, lead, give, cta }: {
  badge: string
  lead: string
  give: string
  cta: string
}) {
  return (
    <a
      href={shopHomeUrl('landing')}
      onClick={() => track('shop_clicked', { from: 'landing' })}
      className="tap group block border-b border-edge bg-panel hover:bg-raised"
    >
      <span className="mx-auto flex min-h-[44px] max-w-7xl items-center justify-center gap-3 px-gutter py-2 text-center text-small text-ink-body">
        <span className="hidden flex-none rounded-full border border-amber/30 bg-amber/10 px-2 py-1 font-mono text-eyebrow uppercase text-amber sm:inline-block">
          {badge}
        </span>
        <span>
          <span className="hidden sm:inline">{lead} </span>
          {give}{' '}
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-amber group-hover:underline group-hover:underline-offset-4">
            {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </span>
    </a>
  )
}
