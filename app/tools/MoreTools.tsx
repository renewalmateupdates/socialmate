import Link from 'next/link'
import { Section, Display } from '@/components/instrument/primitives'
import { FREE_TOOLS } from '@/lib/tools/catalog'

/** The other free tools, at the foot of each tool page. Server component. */
export default function MoreTools({ current }: { current: string }) {
  const others = FREE_TOOLS.filter(t => t.href !== current)
  return (
    <Section width="wide" divide>
      <Display size="md">More free tools</Display>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map(({ href, icon: Icon, name, blurb }) => (
          <Link
            key={href}
            href={href}
            className="tap block rounded-2xl border border-edge bg-panel p-5 transition-colors hover:border-edge-lit hover:bg-raised"
          >
            <Icon className="h-5 w-5 text-amber" strokeWidth={1.75} aria-hidden="true" />
            <p className="mt-3 text-body font-medium text-ink-high">{name}</p>
            <p className="mt-1 text-small text-ink-body">{blurb}</p>
          </Link>
        ))}
      </div>
    </Section>
  )
}
