'use client'
import { ArrowRight } from 'lucide-react'
import { track } from '@/lib/analytics'
import { shopPickFor, shopUrl } from '@/lib/shop/guide-products'

/**
 * The shop product that fits a guide, shown at the end of the guide. A client
 * component only so the click is recorded (`shop_clicked`).
 */
export default function GuideShopCard({ guide }: { guide: string }) {
  const pick = shopPickFor(guide)
  if (!pick) return null
  const { product, note, bundle } = pick
  const clicked = (key: string) => () => track('shop_clicked', { from: 'guide', guide, product: key })

  return (
    <aside className="my-16 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-400">From the Gilgamesh shop</p>
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={`Cover of ${product.name}`}
          width={120}
          height={156}
          loading="lazy"
          className="h-auto w-[120px] flex-none rounded-md border border-[#2a2a2a] shadow-lg shadow-black/40"
        />
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-snug text-white">
            {product.name} <span className="whitespace-nowrap text-amber-400">{product.price}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-300">{note}</p>
          {bundle && <p className="mt-1 text-sm leading-relaxed text-gray-400">{product.pitch}</p>}
          <a
            href={shopUrl(product, guide)}
            onClick={clicked(product.key)}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-black transition-colors hover:bg-amber-400"
          >
            See it in the shop <ArrowRight className="h-3.5 w-3.5" />
          </a>
          {bundle && (
            <p className="mt-4 text-sm text-gray-400">
              Or get all 14 guides and the worksheets in{' '}
              <a
                href={shopUrl(bundle, guide)}
                onClick={clicked(bundle.key)}
                className="font-semibold text-amber-400 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300"
              >
                the Complete Edition
              </a>
              , {bundle.price}.
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500">Instant PDF download. 25% of every sale goes to SM-Give.</p>
        </div>
      </div>
    </aside>
  )
}
