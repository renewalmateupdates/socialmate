import { NextIntlClientProvider } from 'next-intl'
import zhMessages from '@/messages/zh.json'

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="zh" messages={zhMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
