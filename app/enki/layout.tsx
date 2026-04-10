import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enki — Autonomous Trading Bot | Paper Trade Free',
  description:
    'Enki scans congressional trades, Reddit sentiment, RSI, MACD, options flow and more. Trades stocks and crypto 24/7. Start paper trading free.',
}

export default function EnkiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
