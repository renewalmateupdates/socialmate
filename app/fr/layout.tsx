import { NextIntlClientProvider } from 'next-intl'
import frMessages from '@/messages/fr.json'

export default function FrLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
