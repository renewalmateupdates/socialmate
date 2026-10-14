import type { Metadata } from 'next'

// Each guide sets its own title. This covers the /guides hub, which is a
// client component and had been falling back to the site-wide default.
export const metadata: Metadata = {
  title: "Gilgamesh's Guides — Free Playbooks for Building From Nothing",
  description: 'Free long-form guides on starting a business, marketing on zero budget, business credit, building software with AI, creator monetization and more.',
  // No canonical here: a guide that does not set its own would inherit it and
  // point search engines at the hub instead of itself.
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
