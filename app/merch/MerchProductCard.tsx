'use client'
import { useState } from 'react'

interface Variant {
  id: number
  title: string
  options: Record<string, string>
  price: number
  is_available: boolean
  is_enabled: boolean
}

interface ProductImage {
  src: string
  variant_ids?: number[]
  position?: string
  is_default?: boolean
}

interface Product {
  id: string
  title: string
  images: ProductImage[]
  variants: Variant[]
}

const amber = '#F59E0B'
const surface = '#111111'
const border = '#222222'

export function MerchProductCard({ product }: { product: Product }) {
  const enabledVariants = product.variants.filter(v => v.is_enabled && v.is_available)
  const [selectedVariantId, setSelectedVariantId] = useState<number>(enabledVariants[0]?.id ?? 0)
  const [loading, setLoading] = useState(false)

  const selectedVariant = enabledVariants.find(v => v.id === selectedVariantId) ?? enabledVariants[0]

  const heroImage = (() => {
    if (!selectedVariant) return product.images[0]?.src ?? ''
    const frontImages = product.images.filter(i => i.position === 'front' || i.is_default)
    const match = frontImages.find(i => i.variant_ids?.includes(selectedVariant.id))
      ?? product.images.find(i => i.variant_ids?.includes(selectedVariant.id))
      ?? product.images[0]
    return match?.src ?? ''
  })()

  const priceDisplay = selectedVariant ? `$${(selectedVariant.price / 100).toFixed(2)}` : '$--'

  async function handleBuy() {
    if (!selectedVariant) return
    setLoading(true)
    try {
      const res = await fetch('/api/merch/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:    product.id,
          variant_id:    selectedVariant.id,
          variant_title: selectedVariant.title,
          price_cents:   selectedVariant.price,
          product_title: product.title,
          image_url:     heroImage,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: 20,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Product image */}
      {heroImage && (
        <div style={{ background: '#1a1a1a', aspectRatio: '1', overflow: 'hidden' }}>
          <img
            src={heroImage}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f1f1', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            {product.title}
          </h3>
          <div style={{ fontSize: 22, fontWeight: 900, color: amber }}>{priceDisplay}</div>
        </div>

        {/* SM-Give badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8, padding: '5px 10px', alignSelf: 'flex-start',
        }}>
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>❤️ 75% of profit → SM-Give</span>
        </div>

        {/* Size picker */}
        {enabledVariants.length > 1 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Size
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {enabledVariants.map(v => {
                const sizeLabel = v.options?.size ?? v.title
                const isSelected = v.id === selectedVariantId
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      border: isSelected ? `2px solid ${amber}` : `1px solid ${border}`,
                      background: isSelected ? 'rgba(245,158,11,0.1)' : 'transparent',
                      color: isSelected ? amber : '#9ca3af',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {sizeLabel}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={loading || !selectedVariant}
          style={{
            padding: '14px 24px',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            background: loading ? 'rgba(245,158,11,0.5)' : amber,
            color: '#000',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            marginTop: 'auto',
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Redirecting...' : 'Buy Now →'}
        </button>

        <p style={{ fontSize: 11, color: '#6b7280', margin: 0, textAlign: 'center' }}>
          Secure checkout · Ships worldwide · Print on demand
        </p>
      </div>
    </div>
  )
}
