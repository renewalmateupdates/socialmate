/**
 * Links to the Gilgamesh shop on Shopify, which sells merch only since
 * Nov 20, 2026. The guide PDFs it used to sell are free downloads on this
 * site now (lib/guide-pdfs.ts).
 *
 * Links carry UTM tags so Shopify's own reports attribute each visit to where
 * on socialmate.studio it came from.
 *
 * Pure, no imports.
 */

const SHOP = 'https://shop.gilgameshenterprise.com'

/** The shop's home page, tagged with where on socialmate.studio the click came from. */
export function shopHomeUrl(medium: 'nav' | 'footer' | 'landing'): string {
  const q = new URLSearchParams({ utm_source: 'socialmate', utm_medium: medium })
  return `${SHOP}/?${q}`
}
