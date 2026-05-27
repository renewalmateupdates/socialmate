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
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  // Start with English — no async needed for the most common locale.
  const [messages, setMessages] = useState<Messages>(englishMessages)

  useEffect(() => {
    const detected = detectLocale()
    setLocaleState(detected)
    // Only fetch non-English bundles (they're not in the initial JS payload)
    if (detected !== 'en') {
      loadMessages(detected).then(setMessages)
    }

    // Confirm/override from user_settings in DB (non-blocking)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('user_settings')
        .select('locale')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.locale && data.locale !== detected) {
            const dbLocale = data.locale as Locale
            setLocaleState(dbLocale)
            localStorage.setItem('sm_locale', dbLocale)
            loadMessages(dbLocale).then(setMessages)
          }
        })
    })
  }, [])

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('sm_locale', newLocale)
    const msgs = await loadMessages(newLocale)
    setMessages(msgs)
    // Persist to DB (non-fatal if fails)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, locale: newLocale }, { onConflict: 'user_id' })
    }
  }, [])

  const t = useCallback((key: string) => translate(key, messages), [messages])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
