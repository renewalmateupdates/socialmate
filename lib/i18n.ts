import en from '@/messages/en.json'
import es from '@/messages/es.json'
import de from '@/messages/de.json'
import fr from '@/messages/fr.json'
import pt from '@/messages/pt.json'
import ru from '@/messages/ru.json'
import zh from '@/messages/zh.json'

export type Locale = 'en' | 'es' | 'de' | 'fr' | 'pt' | 'ru' | 'zh'

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
]

const ALL_MESSAGES: Record<Locale, typeof en> = { en, es, de, fr, pt, ru, zh }

export function translate(key: string, locale: Locale): string {
  const messages = (ALL_MESSAGES[locale] ?? ALL_MESSAGES.en) as Record<string, unknown>
  const parts = key.split('.')
  let val: unknown = messages
  for (const p of parts) {
    val = (val as Record<string, unknown>)?.[p]
  }
  // Fall back to English if key is missing in the target locale
  if (typeof val !== 'string') {
    let fallback: unknown = ALL_MESSAGES.en as Record<string, unknown>
    for (const p of parts) {
      fallback = (fallback as Record<string, unknown>)?.[p]
    }
    return typeof fallback === 'string' ? fallback : key
  }
  return val
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('sm_locale') as Locale | null
  if (stored && ALL_MESSAGES[stored]) return stored
  const browser = navigator.language?.slice(0, 2) as Locale
  if (ALL_MESSAGES[browser]) return browser
  return 'en'
}
