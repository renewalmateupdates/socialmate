// Re-export the root pricing page for locale-prefixed routes (e.g. /es/pricing).
// Pricing UI currently uses hardcoded English strings; full i18n of pricing content
// can be added incrementally. Stripe checkout is locale-agnostic.
export { default } from '@/app/pricing/page'
