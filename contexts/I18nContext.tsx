'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
  loadMessages,
  englishMessages,
  translate,
  detectLocale,
  type Locale,
  type Messages,
} from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: read locale synchronously from URL/localStorage on mount.
  // This eliminates the English flash on locale pages (e.g. /es) because the
  // locale is correct from the very first render, not after a useEffect tick.
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en'
    return detectLocale()
  })
  // Start with English — non-English bundles load async after mount.
  const [messages, setMessages] = useState<Messages>(englishMessages)

  useEffect(() => {
    // Load non-English message bundle if needed
    if (locale !== 'en') {
      loadMessages(locale).then(setMessages)
    }

    // Also sync with DB preference for logged-in users (non-blocking)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('user_settings')
        .select('locale')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.locale && data.locale !== locale) {
            const dbLocale = data.locale as Locale
            setLocaleState(dbLocale)
            persistLocale(dbLocale)
            loadMessages(dbLocale).then(setMessages)
          }
        })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale)
    persistLocale(newLocale)
    const msgs = await loadMessages(newLocale)
    setMessages(msgs)
    // Persist to DB (non-fatal if fails)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({ user_id: user.id, locale: newLocale }, { onConflict: 'user_id' })
      }
    } catch {}
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>) => translate(key, messages, params), [messages])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

/** Save locale to both localStorage and a cookie (cookie allows server-side reads in API routes). */
function persistLocale(locale: Locale) {
  try {
    localStorage.setItem('sm_locale', locale)
    // 1-year cookie, readable by Next.js API routes for Stripe checkout locale
    document.cookie = `sm_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
  } catch {}
}
