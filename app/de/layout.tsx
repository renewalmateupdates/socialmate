import { NextIntlClientProvider } from 'next-intl'
import deMessages from '@/messages/de.json'

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="de" messages={deMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
