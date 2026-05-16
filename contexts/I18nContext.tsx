'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { translate, detectLocale, type Locale } from '@/lib/i18n'
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

  useEffect(() => {
    // Detect from localStorage first (fast, no network)
    const detected = detectLocale()
    setLocaleState(detected)

    // Then confirm/override from user_settings in DB
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('user_settings')
        .select('locale')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.locale && data.locale !== detected) {
            setLocaleState(data.locale as Locale)
            localStorage.setItem('sm_locale', data.locale)
          }
        })
    })
  }, [])

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('sm_locale', newLocale)
    // Persist to DB (non-fatal if fails)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, locale: newLocale }, { onConflict: 'user_id' })
    }
  }, [])

  const t = useCallback((key: string) => translate(key, locale), [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
