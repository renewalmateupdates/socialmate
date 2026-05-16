import { NextIntlClientProvider } from 'next-intl'
import ptMessages from '@/messages/pt.json'

export default function PtLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="pt" messages={ptMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
