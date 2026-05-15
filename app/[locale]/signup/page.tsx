// Re-export the root signup page for locale-prefixed routes (e.g. /es/signup).
// The signup form itself is universal — Supabase auth needs no i18n.
// The [locale]/layout.tsx provides NextIntlClientProvider for any translated strings.
export { default } from '@/app/signup/page'
