import { NextIntlClientProvider } from 'next-intl'
import esMessages from '@/messages/es.json'

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
