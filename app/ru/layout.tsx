import { NextIntlClientProvider } from 'next-intl'
import ruMessages from '@/messages/ru.json'

export default function RuLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="ru" messages={ruMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
