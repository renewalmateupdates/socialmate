import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Mailchimp (2026) — Full Comparison',
  description: "Mailchimp is an email marketing tool that starts at $13/month. SocialMate is a dedicated social media scheduler for 7 platforms — free to start, $5/month Pro. No email list required.",
  openGraph: {
    title:       'SocialMate vs Mailchimp (2026)',
    description: "Mailchimp starts at $13/month and focuses on email. SocialMate schedules 7 social platforms with AI tools, bulk scheduling, and analytics — free forever.",
    url:         'https://socialmate.studio/vs/mailchimp',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/mailchimp' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
