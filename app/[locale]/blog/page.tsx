// Locale-prefixed blog page (e.g. /es/blog).
// Blog content is stored in the database in English; full content translation
// is deferred until database-level i18n is in place.
// The [locale]/layout.tsx provides NextIntlClientProvider for nav/footer strings.
export { default } from '@/app/blog/page'
