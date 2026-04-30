'use client'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const AGENTS = [
  {
    id: 'email-outreach',
    icon: '✉️',
    name: 'Email Outreach',
    tagline: 'Pitch brands, land collabs, close clients',
    description: 'Write personalized outreach emails for brand deals, sponsorships, partnerships, and client pitches in seconds.',
    cost: '5 credits / email',
    costType: 'credits',
    tier: 'free',
    href: '/agents/email-outreach',
    live: true,
  },
  {
    id: 'growth-scout',
    icon: '🔭',
    name: 'Growth Scout',
    tagline: 'Know what your competitors are doing',
    description: 'Monitors competitor posting patterns, engagement trends, and content angles so you can stay one step ahead.',
    cost: 'Free',
    costType: 'free',
    tier: 'pro',
    href: '/agents/growth-scout',
    live: true,
  },
  {
    id: 'newsletter',
    icon: '📰',
    name: 'Newsletter Agent',
    tagline: 'Your week in posts, turned into a newsletter',
    description: 'Every Sunday, your published posts become a newsletter — drafted for review or auto-sent to your subscriber list.',
    cost: 'Free — Pro+',
    costType: 'free',
    tier: 'pro',
    href: '/agents/newsletter',
    live: true,
  },
  {
    id: 'client-report',
    icon: '📊',
    name: 'Client Report Agent',
    tagline: 'Weekly reports without the manual work',
    description: 'Every Monday, a performance summary lands in your inbox — posts published, scheduled ahead, active platforms. Email to clients directly.',
    cost: 'Free — Agency',
    costType: 'free',
    tier: 'agency',
    href: '/agents/client-report',
    live: true,
  },
  {
    id: 'repurpose',
    icon: '♻️',
    name: 'Repurpose Agent',
    tagline: 'One post. Every platform.',
    description: 'Takes your best content and auto-generates platform-native variants — threads, captions, emails, LinkedIn posts.',
    cost: '5 credits / repurpose',
    costType: 'credits',
    tier: 'pro',
    href: '/agents/repurpose',
    live: false,
  },
  {
    id: 'trend-scout',
    icon: '📈',
    name: 'Trend Scout',
    tagline: 'Post before the wave hits',
    description: 'Watches trending topics across your platforms and suggests content angles while they\'re still hot.',
    cost: '2 credits / insight',
    costType: 'credits',
    tier: 'pro',
    href: '/agents/trend-scout',
    live: false,
  },
  {
    id: 'inbox-agent',
    icon: '💬',
    name: 'Inbox Agent',
    tagline: 'Never leave a mention on read',
    description: 'Drafts smart, on-brand replies to mentions and DMs across Bluesky, Mastodon, and Telegram.',
    cost: '3 credits / reply',
    costType: 'credits',
    tier: 'pro',
    href: '/agents/inbox-agent',
    live: false,
  },
  {
    id: 'caption-agent',
    icon: '✍️',
    name: 'Caption Agent',
    tagline: 'Auto-draft posts from any topic',
    description: 'Give it a topic or RSS feed — it watches, drafts posts for review, and queues them when you approve.',
    cost: '5 credits / draft',
    costType: 'credits',
    tier: 'agency',
    href: '/agents/caption-agent',
    live: false,
  },
]

const TIER_COLOR: Record<string, string> = {
  free:   'bg-emerald-100 text-emerald-700',
  pro:    'bg-amber-100 text-amber-700',
  agency: 'bg-purple-100 text-purple-700',
}

const TIER_LABEL: Record<string, string> = {
  free:   'All Plans',
  pro:    'Pro+',
  agency: 'Agency',
}

export default function AgentsPage() {
  const router = useRouter()
  const { plan } = useWorkspace()

  const liveAgents    = AGENTS.filter(a => a.live)
  const comingAgents  = AGENTS.filter(a => !a.live)

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🤖</span>
          <h1 className="text-3xl font-black text-primary">Agents</h1>
        </div>
        <p className="text-secondary text-base max-w-xl">
          Autonomous tools that work while you sleep. Each agent handles a specific job — from outreach to intel — so you can focus on creating.
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-secondary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Free — no credits required</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Credits-based</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Coming soon</span>
        </div>
      </div>

      {/* Live agents */}
      <div className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Live Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {liveAgents.map(agent => (
            <button
              key={agent.id}
              onClick={() => router.push(agent.href)}
              className="text-left bg-surface border border-theme rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{agent.icon}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLOR[agent.tier]}`}>
                    {TIER_LABEL[agent.tier]}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    agent.costType === 'free'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {agent.cost}
                  </span>
                </div>
              </div>
              <h3 className="font-black text-primary text-lg group-hover:text-amber-500 transition-colors">{agent.name}</h3>
              <p className="text-xs font-semibold text-amber-500 mb-1">{agent.tagline}</p>
              <p className="text-sm text-secondary">{agent.description}</p>
              <div className="mt-4 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform inline-block">
                Launch Agent →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {comingAgents.map(agent => (
            <div
              key={agent.id}
              className="text-left bg-surface border border-theme rounded-2xl p-5 opacity-60"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl grayscale">{agent.icon}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLOR[agent.tier]}`}>
                    {TIER_LABEL[agent.tier]}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {agent.cost}
                  </span>
                </div>
              </div>
              <h3 className="font-black text-primary text-lg">{agent.name}</h3>
              <p className="text-xs font-semibold text-gray-400 mb-1">{agent.tagline}</p>
              <p className="text-sm text-secondary">{agent.description}</p>
              <div className="mt-4 text-xs font-bold text-gray-400">
                Coming Soon
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
