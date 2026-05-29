// Only English is statically bundled (~62KB). All other locales are loaded on demand.
// This prevents dead JSON from landing in every page's JS bundle.
import en from '@/messages/en.json'

export type Locale = 'en' | 'es' | 'de' | 'fr' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'
export type Messages = typeof en

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷' },
]

export const SUPPORTED_CODES = new Set<string>(SUPPORTED_LOCALES.map(l => l.code))

// The statically-bundled English messages. Used as the initial state and fallback.
export const englishMessages: Messages = en

// Dynamically load a locale's messages. Returns English on failure.
export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === 'en') return en
  try {
    switch (locale) {
      case 'es': return (await import('@/messages/es.json')).default as unknown as Messages
      case 'de': return (await import('@/messages/de.json')).default as unknown as Messages
      case 'fr': return (await import('@/messages/fr.json')).default as unknown as Messages
      case 'pt': return (await import('@/messages/pt.json')).default as unknown as Messages
      case 'ru': return (await import('@/messages/ru.json')).default as unknown as Messages
      case 'zh': return (await import('@/messages/zh.json')).default as unknown as Messages
      case 'ja': return (await import('@/messages/ja.json')).default as unknown as Messages
      case 'ko': return (await import('@/messages/ko.json')).default as unknown as Messages
      default:   return en
    }
  } catch {
    return en
  }
}

// Resolve a dot-separated key against a messages object, falling back to English.
export function translate(key: string, messages: Messages): string {
  const parts = key.split('.')
  let val: unknown = messages
  for (const p of parts) {
    val = (val as Record<string, unknown>)?.[p]
  }
  if (typeof val !== 'string') {
    // Fall back to English default messages
    let fallback: unknown = en
    for (const p of parts) {
      fallback = (fallback as Record<string, unknown>)?.[p]
    }
    return typeof fallback === 'string' ? fallback : key
  }
  return val
}

/** Read locale from URL path segment (e.g. /es/... → 'es'). Server + client safe. */
export function localeFromPath(pathname: string): Locale | null {
  const seg = pathname.split('/')[1]
  return seg && SUPPORTED_CODES.has(seg) ? (seg as Locale) : null
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  // 1. URL path takes highest priority (e.g. user is on /es)
  const fromPath = localeFromPath(window.location.pathname)
  if (fromPath) return fromPath
  // 2. Stored preference
  try {
    const stored = localStorage.getItem('sm_locale')
    if (stored && SUPPORTED_CODES.has(stored)) return stored as Locale
  } catch {}
  // 3. Browser language
  try {
    const browser = navigator.language?.slice(0, 2)
    if (browser && SUPPORTED_CODES.has(browser)) return browser as Locale
  } catch {}
  return 'en'
}
