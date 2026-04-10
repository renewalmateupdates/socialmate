import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enki — Autonomous Treasury Guardian | Paper Trade Free',
  description:
    'Enki is the cold elite autonomous guardian of your treasury. Fortress-grade downside protection, 7 signal sources, stocks + crypto 24/7. Start paper trading free as Citizen.',
}

export default function EnkiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
