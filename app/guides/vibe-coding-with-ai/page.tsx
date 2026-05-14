import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'

export const metadata: Metadata = {
  title: "Vibe Coding — Building Software with AI (Free Guide) — Gilgamesh's Guides",
  description:
    'How to ship real software with no CS degree using AI as your co-pilot. The actual workflow, the real mistakes, and why vision matters more than syntax. Free playbook from a solo founder who built a live SaaS with AI.',
  keywords: [
    'vibe coding guide',
    'build software with AI',
    'Claude Code tutorial',
    'AI coding for beginners',
    'no CS degree build software',
    'solo founder tech stack',
    'build SaaS with AI 2026',
    'Claude AI coding',
    'how to build an app without coding',
    'AI developer tools 2026',
    'ship software faster with AI',
    'bootstrapped founder tech',
  ],
  openGraph: {
    title: "Vibe Coding — Building Software with AI — Gilgamesh's Guide Vol. 4",
    description:
      'Ship real software with no CS degree. The workflow, the tools, the mindset. From a solo founder who built a live SaaS at night while working a deli job.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',    label: 'Preface' },
  { id: 'ch1',       label: '1. What Vibe Coding Is' },
  { id: 'ch2',       label: '2. The Stack' },
  { id: 'ch3',       label: '3. The Workflow' },
  { id: 'ch4',       label: '4. Prompting That Ships' },
  { id: 'ch5',       label: '5. When It Breaks' },
  { id: 'ch6',       label: '6. Going Live' },
  { id: 'ch7',       label: '7. The Mindset' },
  { id: 'resources', label: 'All Resources' },
]

export default function VibeCodingGuidePage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <header className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link href="/guides" className="text-xs text-gray-600 hover:text-amber-400 transition-colors">
                ← All Guides
              </Link>
              <span className="text-gray-700">·</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Vol. 4
              </span>
              <span className="text-xs text-gray-600">35 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Vibe Coding — Building Software with AI
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              How to ship real software with no CS degree, no co-founder, and no permission — using AI as your development partner.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>Written by <span className="text-amber-400">Joshua Bostic</span></span>
              <span>·</span>
              <span>Founder, SocialMate</span>
              <span>·</span>
              <span>© Gilgamesh Enterprise LLC</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600">Chapters</p>
                <nav className="space-y-1">
                  {CHAPTERS.map(ch => (
                    <a
                      key={ch.id}
                      href={`#${ch.id}`}
                      className="block rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-[#1a1a1a] hover:text-amber-400 transition-all"
                    >
                      {ch.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs font-bold text-amber-400 mb-1">Power to the people.</p>
                  <p className="text-xs text-gray-500">All guides are free. Always.</p>
                </div>
              </div>
            </aside>

            {/* Content */}
            <article className="flex-1 min-w-0 prose prose-invert prose-amber max-w-none">

              {/* Preface */}
              <section id="preface" className="mb-16">
                <h2 className="text-2xl font-black text-white mb-4">Preface</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  I am not a software engineer. I don't have a CS degree. I couldn't have written a React component from scratch two years ago. Today I run a live SaaS platform — multi-platform social media scheduler, AI tools, payments, background jobs, the whole thing — that I built at a deli counter and shipped from a laptop at midnight.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The thing that changed everything wasn't a bootcamp. It wasn't a YouTube series. It was learning to work with AI the right way — not as a search engine, not as a code generator, but as a development partner that moves as fast as you can think.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  "Vibe coding" is a term some people use mockingly. I use it earnestly. It means: you understand what you want to build, you can communicate it clearly, and you can iterate and debug until it works — even if you can't write the underlying syntax from memory. Vision over syntax. Clarity over credentials.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  This guide is everything I learned. What stack to use, how to prompt, what to do when it breaks, and the mental game of shipping imperfect things into the world on purpose. Let's go.
                </p>
              </section>

              {/* Chapter 1 */}
              <section id="ch1" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 1</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">What Vibe Coding Actually Is</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Real Definition</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Vibe coding is not a shortcut. It is not "have AI write everything while you sit back." That approach produces unusable garbage fast, and you won't understand it when it breaks — and it will break.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Vibe coding is a discipline: you hold the architecture in your head, you understand what each piece does at the functional level (even if not the syntactic level), and you use AI to accelerate the execution of your vision. You are the product manager, the architect, and the QA lead. AI is your senior engineer who never sleeps.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                    <p className="text-red-400 font-bold text-sm mb-3">✗ What fails</p>
                    <ul className="text-gray-400 text-sm space-y-2">
                      <li>"Write me an app that does X" — too vague</li>
                      <li>Copy-pasting AI output without reading it</li>
                      <li>Not understanding what a function does</li>
                      <li>Skipping testing because "AI wrote it"</li>
                      <li>No version control, no rollback plan</li>
                    </ul>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                    <p className="text-green-400 font-bold text-sm mb-3">✓ What works</p>
                    <ul className="text-gray-400 text-sm space-y-2">
                      <li>Specific, scoped tasks with clear requirements</li>
                      <li>Reading every line before you accept it</li>
                      <li>Understanding the "why" of each change</li>
                      <li>Testing every feature in a real browser</li>
                      <li>Committing frequently, branching for every change</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">What You Actually Need to Know</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You don't need to memorize syntax. You do need to understand concepts:
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { concept: 'How the web works', desc: 'Client vs. server. What happens when you hit a URL. What an API is. What JSON is. You can learn all of this in a few hours — it\'s not optional.' },
                    { concept: 'Data flow', desc: 'Where does data come from, where does it go, who can see it. If you can draw this for your app on a whiteboard, you can build it.' },
                    { concept: 'Functions and state', desc: 'A function takes input and returns output. State is data that changes over time. That\'s 80% of what you need to know about programming at the conceptual level.' },
                    { concept: 'What a database does', desc: 'It stores things persistently. A table is a spreadsheet. A row is a record. SQL is just asking questions about the spreadsheet in a specific language.' },
                    { concept: 'Errors are feedback', desc: 'A red error message is not a failure. It\'s the computer telling you exactly what\'s wrong. Learn to read them. They\'re specific and they\'re honest.' },
                  ].map(item => (
                    <div key={item.concept} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                      <p className="text-white font-semibold text-sm mb-1">{item.concept}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Permission Fallacy</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The old gatekeeping argument was: "You can't build real software without a CS degree." That argument existed to protect a scarcity that no longer exists. AI tools didn't lower the bar — they redistributed the bottleneck. The bottleneck is no longer syntax knowledge. It's now clarity of vision, quality of communication, and willingness to iterate.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If you can describe exactly what you want to build, explain why it needs to work a certain way, and communicate what's broken when something goes wrong — you can build software. That's the whole unlock.
                </p>
              </section>

              {/* Chapter 2 */}
              <section id="ch2" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 2</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">The Stack — What I Actually Use</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  I'm going to tell you exactly what I use to run a live production SaaS. I'm not going to recommend anything I haven't personally shipped with. Every free tier noted.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    {
                      layer: 'Framework',
                      choice: 'Next.js (App Router)',
                      why: 'Full-stack in one codebase. API routes + frontend + server components. Deploys to Vercel in one click. The AI tools know it better than any other framework — you\'ll get better completions.',
                      free: 'Yes — open source',
                    },
                    {
                      layer: 'Language',
                      choice: 'TypeScript',
                      why: 'Types catch bugs before they happen. When AI generates code with types, you can read the shape of data without running the app. More readable, more debuggable.',
                      free: 'Yes — open source',
                    },
                    {
                      layer: 'Database + Auth',
                      choice: 'Supabase',
                      why: 'Postgres database, row-level security, auth, file storage, and real-time subscriptions — all managed, all with a generous free tier. You don\'t manage servers. The AI knows Supabase extremely well.',
                      free: 'Free tier: 500MB DB, 1GB storage, 50MB file uploads',
                    },
                    {
                      layer: 'Styling',
                      choice: 'Tailwind CSS',
                      why: 'Write styles in the HTML. No separate CSS files to manage. AI generates Tailwind perfectly. Dark mode, responsive design, animations — all built-in utilities.',
                      free: 'Yes — open source',
                    },
                    {
                      layer: 'Deployment',
                      choice: 'Vercel',
                      why: 'Push to GitHub, it deploys. Preview URLs for every PR. Environment variables in a UI. Domain management. Zero DevOps. Free tier is genuinely usable for early products.',
                      free: 'Free tier: unlimited personal projects, 100GB bandwidth/mo',
                    },
                    {
                      layer: 'Payments',
                      choice: 'Stripe',
                      why: 'The industry standard. Subscriptions, one-time payments, webhooks, customer portal. The docs are excellent. AI can write Stripe integration from a description.',
                      free: 'No monthly fee — 2.9% + 30¢ per transaction',
                    },
                    {
                      layer: 'Background Jobs',
                      choice: 'Inngest',
                      why: 'Scheduled functions, event-driven workflows, retries, observability. Critical for anything that needs to run on a schedule (like scheduled posts). Free tier is solid.',
                      free: 'Free tier: 50k function runs/month',
                    },
                    {
                      layer: 'AI',
                      choice: 'Google Gemini API',
                      why: 'Extremely cheap per token. Generous free tier. 1M+ context window. Good for generation tasks. For coding assistance itself, use Claude.',
                      free: 'Free tier: 15 RPM on Flash model',
                    },
                    {
                      layer: 'Email',
                      choice: 'Resend',
                      why: 'Developer-first transactional email. Clean API. React email templates. Dead simple to wire up for welcome emails, notifications, etc.',
                      free: 'Free tier: 100 emails/day, 3,000/month',
                    },
                    {
                      layer: 'AI Coding Tool',
                      choice: 'Claude Code',
                      why: 'This is the one. Not a browser copilot — an agentic CLI that reads your whole codebase, edits files, runs commands, opens PRs. It\'s how I built everything in this stack at 2am.',
                      free: 'Subscription — worth every dollar if you\'re building seriously',
                    },
                  ].map(item => (
                    <div key={item.layer} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <span className="text-xs text-gray-600 uppercase tracking-widest">{item.layer}</span>
                          <p className="text-white font-bold">{item.choice}</p>
                        </div>
                        <span className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full px-2 py-0.5 shrink-0">{item.free}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.why}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                  <p className="text-amber-300 font-semibold text-sm mb-2">Total monthly cost when starting out</p>
                  <p className="text-gray-400 text-sm">Infrastructure: $0. The free tiers on this stack can handle your first 1,000 users comfortably. The only non-optional cost is Stripe's transaction fee on revenue. I spent $0/month on infrastructure for the first 6 months of SocialMate's life.</p>
                </div>
              </section>

              {/* Chapter 3 */}
              <section id="ch3" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 3</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">The Workflow — How a Build Session Actually Goes</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Before You Open Your Editor</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The most expensive mistake in vibe coding is starting to build before you know what you're building. AI moves fast. If your direction is wrong, you'll be fast in the wrong direction — and unwinding AI-generated code is harder than writing it.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Before every feature, I answer three questions on paper (or in a note):
                </p>
                <ol className="text-gray-300 space-y-3 list-decimal list-inside mb-6">
                  <li><strong className="text-white">What is the user experience?</strong> Describe every click, input, and state change from the user's perspective. No code, just behavior.</li>
                  <li><strong className="text-white">What data is involved?</strong> What do I need to store? Where does it come from? Who can see it?</li>
                  <li><strong className="text-white">What's the simplest version?</strong> What's the minimum that could ship tonight? Strip everything that's not essential to the core function.</li>
                </ol>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Build Loop</h3>
                <div className="space-y-3 mb-8">
                  {[
                    { step: '1. Write the DB schema first', desc: 'Before a single line of frontend code, define your table. What columns do you need? What types? What relationships? Run it in Supabase. If the data model is wrong, everything built on top of it is wrong.' },
                    { step: '2. Build the API route', desc: 'What does the server need to receive? What does it return? Wire the database query. Test it with a raw fetch() call in the browser console before touching the UI.' },
                    { step: '3. Build the UI last', desc: 'Now that data flows correctly, connect the frontend. The UI is the least important part to get right first — it\'s also the easiest to change.' },
                    { step: '4. Test in a real browser', desc: 'Not in the AI\'s imagination. Not in a unit test. In Chrome, with real clicks, on the actual page. AI can generate tests — but it cannot feel whether the UX is confusing.' },
                    { step: '5. Commit and move on', desc: 'Small commits. Descriptive messages. Every working state is a checkpoint you can return to. Never accumulate three weeks of changes before committing.' },
                  ].map(item => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <div>
                        <p className="text-white font-semibold text-sm mb-1">{item.step}</p>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Context is Everything</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The single biggest performance difference between vibe coders is how well they manage AI context. A tool like Claude Code reads your whole codebase — it knows your patterns, your variable names, your existing components. This context makes every subsequent prompt smarter.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Things that kill context quality:
                </p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>Switching topics mid-session without resetting</li>
                  <li>Asking questions that are too vague ("fix this")</li>
                  <li>Not telling the AI about your existing patterns ("use the same auth pattern as in /api/posts")</li>
                  <li>Letting a session go too long without a checkpoint commit</li>
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Practical habit</p>
                  <p className="text-gray-400 text-sm">Keep a CLAUDE.md file in your repo root. Put your tech stack, gotchas, coding rules, and key architectural decisions in it. Claude Code reads this automatically every session — it's like a project brief that you only write once.</p>
                </div>
              </section>

              {/* Chapter 4 */}
              <section id="ch4" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 4</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Prompting That Ships</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Prompting is a skill. Vague prompts produce vague code. Specific prompts produce specific code. Here's how I think about it.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Anatomy of a Good Prompt</h3>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-6 font-mono text-sm">
                  <p className="text-gray-500 text-xs mb-3 not-prose">Example: Adding a feature</p>
                  <p className="text-gray-300 mb-2"><span className="text-amber-400">Context:</span> "I have a posts table with columns id, content, user_id, scheduled_at, status."</p>
                  <p className="text-gray-300 mb-2"><span className="text-amber-400">What I want:</span> "Add a retry button to failed posts in the queue page. When clicked, it should reset status to 'scheduled' and set scheduled_at to 5 minutes from now."</p>
                  <p className="text-gray-300 mb-2"><span className="text-amber-400">Constraints:</span> "Use the existing PATCH /api/posts/[id] route. Match the existing button style in the queue. Don't break the published posts section."</p>
                  <p className="text-gray-300"><span className="text-amber-400">Edge cases:</span> "Show a spinner while the request is in flight. Show a success toast after. Don't show the retry button if status is 'published'."</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Prompt Patterns That Work</h3>
                <div className="space-y-4 mb-8">
                  {[
                    {
                      pattern: '"Use the same pattern as..."',
                      desc: 'Point to existing working code. "Use the same auth check as in /api/posts/publish" tells the AI to follow your established patterns instead of inventing new ones.',
                    },
                    {
                      pattern: '"Don\'t touch X"',
                      desc: 'Explicitly protect working parts. "Don\'t modify the Stripe webhook handler" or "don\'t change the sidebar layout" prevents well-intentioned but destructive edits.',
                    },
                    {
                      pattern: '"The simplest possible version"',
                      desc: 'AI tends to over-engineer. Explicitly asking for the simplest approach prevents abstraction you don\'t need yet.',
                    },
                    {
                      pattern: '"Step by step"',
                      desc: 'For complex features, ask the AI to explain its plan before writing code. Catching a wrong architectural decision in the plan stage is free. Catching it after 200 lines of code is expensive.',
                    },
                    {
                      pattern: '"This is what the error says exactly"',
                      desc: 'Paste the full error message, not your interpretation of it. The AI can diagnose from the raw output better than from your paraphrase.',
                    },
                  ].map(item => (
                    <div key={item.pattern} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                      <p className="text-amber-400 font-mono text-sm mb-2">{item.pattern}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">What to Never Do</h3>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li><strong className="text-white">Never ask for everything at once.</strong> "Build me a full social media scheduler" is not a prompt. Break it into: auth, then post creation, then scheduling, then publishing. One thing at a time.</li>
                  <li><strong className="text-white">Never skip reading the output.</strong> Every line of AI-generated code is a line you're responsible for. Read it. Understand what it does. If you can't explain it, you don't own it yet.</li>
                  <li><strong className="text-white">Never ignore warnings.</strong> TypeScript errors, console warnings, deprecation notices — these are the AI's way of telling you something is fragile. Fix them before moving on.</li>
                  <li><strong className="text-white">Never assume correctness.</strong> The AI will confidently generate code that does the wrong thing. Your job is to test every feature as if you expect it to be broken.</li>
                </ul>
              </section>

              {/* Chapter 5 */}
              <section id="ch5" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 5</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">When It Breaks — Debugging Without Panic</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Everything breaks. Your job isn't to prevent breakage — it's to fix it fast. Here's the framework.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Debugging Hierarchy</h3>
                <div className="space-y-3 mb-8">
                  {[
                    { q: 'Is it a syntax error?', a: 'The error message tells you the file and line number. Go there. Read the line above and below. 80% of syntax errors are a missing bracket, comma, or semicolon.' },
                    { q: 'Is it a runtime error?', a: 'Open the browser console (F12). Read the error. Copy the full stack trace into Claude Code. Paste the relevant code. Ask "what\'s wrong?" with the specific error.' },
                    { q: 'Is the data wrong?', a: 'console.log() everything. Log the API response before you render it. Log the database query result before you return it. Don\'t guess — observe.' },
                    { q: 'Is it a build error?', a: 'Run the build locally. npm run build tells you every TypeScript error with file and line number. Fix one at a time, starting from the top — later errors often cascade from earlier ones.' },
                    { q: 'Is it a deployment error?', a: 'Check your environment variables first. Missing env vars are responsible for ~40% of "works locally, broken in prod" issues. Second: check the deployment logs in Vercel for the actual server error.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                      <p className="text-white font-semibold text-sm mb-2">{item.q}</p>
                      <p className="text-gray-400 text-sm">{item.a}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Nuclear Option: Git Reset</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  This is why you commit frequently. If you've been working for 30 minutes and something is deeply broken and you can't figure out what the AI changed to break it — roll back. <code className="text-amber-400 bg-[#1a1a1a] px-1 rounded">git diff HEAD</code> shows every change since your last commit. <code className="text-amber-400 bg-[#1a1a1a] px-1 rounded">git stash</code> saves your current state temporarily. <code className="text-amber-400 bg-[#1a1a1a] px-1 rounded">git checkout -- .</code> discards all changes and returns to the last commit.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">The rule that saves sessions</p>
                  <p className="text-gray-400 text-sm">Every time a feature works — commit immediately. "feat: X working" is a valid commit message at midnight. You can clean it up later. The working state is what matters. Every commit is a checkpoint. Every checkpoint is irreversible protection.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Knowing When to Stop Fighting</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you've been debugging the same issue for more than 45 minutes and you're going in circles — stop. Write down exactly what the error is and what you've already tried. Sleep on it, or come back after a break. Your brain will have processed it. The error will look different.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Some bugs also need a completely different approach — not a fix to the current approach, but abandoning it. If AI-generated solution A keeps breaking, ask for a completely different implementation strategy for the same outcome.
                </p>
              </section>

              {/* Chapter 6 */}
              <section id="ch6" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 6</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Going Live — The First Deploy</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Minimum Viable Deploy</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You don't need to be "ready" to go live. You need to be safe enough that you're not going to hurt anyone or leak data. The bar is lower than you think.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { item: 'Auth works', desc: 'Users can sign up, sign in, and sign out. Their data is isolated. Row-level security is enabled in Supabase.' },
                    { item: 'No exposed secrets', desc: 'API keys are in environment variables, not in code. Your repo is private or secrets are in .gitignore.' },
                    { item: 'Payments work (if charging)', desc: 'Run a real $1 test charge through Stripe. Don\'t soft-launch with payments you haven\'t personally tested end-to-end.' },
                    { item: 'The core loop works', desc: 'The one thing your app is supposed to do — it actually does it, reliably, in production. Not just locally.' },
                    { item: 'You can recover from a crash', desc: 'If everything breaks, can you roll back? Do you have your last working commit? Do you know how to redeploy the previous version?' },
                  ].map(item => (
                    <div key={item.item} className="flex gap-3">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{item.item}</p>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Ship Imperfect on Purpose</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The most dangerous thing you can do is wait until it's perfect. It will never be perfect. Every day you delay is a day you're not getting real feedback from real users.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  SocialMate launched with a broken Twitter integration, a UI that was half-finished on mobile, and zero marketing. Those things got fixed because real users hit them and reported them. The things I thought were problems before launch — most of them weren't. The real problems I couldn't have predicted from inside my own head.
                </p>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-6">
                  <p className="text-white font-semibold mb-2">The feedback loop advantage</p>
                  <p className="text-gray-400 text-sm">A polished product with zero users gives you zero feedback. A rough product with 10 real users gives you 10 feedback loops. Each loop tightens your next build iteration. Ship the rough thing. Fix fast. That compounding feedback is worth more than any amount of pre-launch polishing.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Domain, Analytics, Error Tracking</h3>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li><strong className="text-white">Domain:</strong> Get a real domain from Porkbun or Namecheap ($10–$15/year). Vercel handles SSL automatically. Point your domain to Vercel's nameservers in 10 minutes.</li>
                  <li><strong className="text-white">Analytics:</strong> Vercel Analytics is built-in and free. Install it. Know how many people are actually using each page before you decide what to build next.</li>
                  <li><strong className="text-white">Error tracking:</strong> Sentry has a free tier. Wire it in on day one. You want to know when something breaks in production before a user emails you about it.</li>
                </ul>
              </section>

              {/* Chapter 7 */}
              <section id="ch7" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 7</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">The Mindset</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Comparison Trap</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  At some point you will compare your code to a "real engineer's" code and feel like a fraud. The code will look different. It will be structured differently. A trained engineer would have done it differently.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Here's the thing about that: does it work? Does it ship? Does it serve real users? Does it handle edge cases? Is it secure? If the answers are yes — the "elegance" of the implementation is academic. Software's only job is to work correctly for the people using it.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  There is a kind of snobbery in software engineering that equates method with outcome. Ignore it. Judge your work by outcomes, not by how a CS curriculum would grade it.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Building in Stolen Hours</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Most of SocialMate was built between 10pm and 2am. I have a full-time job. I have a life. I don't have the luxury of 8-hour build sessions. What I have is consistency: show up to the keyboard when you said you would. Even if it's 45 minutes. Even if you're tired. Especially if you're tired, because tired builds are what separate people who ship from people who talk about shipping.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  One small thing shipped is worth more than ten big things planned. The person with a live, imperfect product beats the person with a perfect wireframe every time.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">What AI Actually Changes</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  AI didn't make me a software engineer. It made the software engineering part of my vision executable without me becoming a software engineer first.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The creative work — figuring out what to build, how to position it, what problem it actually solves, what the user experience should feel like — that's still entirely human. AI handles execution. You still have to have the vision worth executing.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If you have a real idea, a genuine problem you want to solve, and the patience to iterate — you can build it now. The tools exist. The free tiers exist. The knowledge exists. The only thing that was ever actually in the way was the belief that you needed permission.
                </p>

                <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="text-white font-black text-lg mb-2">You don't need a CS degree. You need a clear vision and the will to iterate.</p>
                  <p className="text-gray-400 text-sm">That's the whole unlock. The rest is just building.</p>
                </div>
              </section>

              {/* Resources */}
              <section id="resources" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Resources</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">All Resources — Bookmarked</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { label: 'Next.js documentation', url: 'https://nextjs.org/docs' },
                    { label: 'Supabase documentation', url: 'https://supabase.com/docs' },
                    { label: 'Tailwind CSS documentation', url: 'https://tailwindcss.com/docs' },
                    { label: 'Vercel — deploy Next.js', url: 'https://vercel.com/docs' },
                    { label: 'Stripe — accept payments', url: 'https://stripe.com/docs' },
                    { label: 'Inngest — background jobs', url: 'https://www.inngest.com/docs' },
                    { label: 'Resend — transactional email', url: 'https://resend.com/docs' },
                    { label: 'Claude Code — AI coding CLI', url: 'https://claude.ai/code' },
                    { label: 'Google Gemini API', url: 'https://ai.google.dev/docs' },
                    { label: 'Sentry — error tracking (free tier)', url: 'https://sentry.io' },
                    { label: 'Porkbun — cheap domains', url: 'https://porkbun.com' },
                    { label: 'SocialMate — schedule your launch content free', url: 'https://socialmate.studio' },
                  ].map(r => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-amber-500/30 hover:bg-[#1f1f1f] transition-all group"
                    >
                      <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">→</span>
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{r.label}</span>
                    </a>
                  ))}
                </div>
              </section>

              <GuideEmailCapture />

              {/* Closing */}
              <section className="mb-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
                <p className="text-white font-black text-xl mb-3">Power to the people.</p>
                <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
                  The tools exist. The knowledge exists. The only thing that was ever actually in the way was the belief that you needed permission. You don't.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/guides" className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-500 transition-all">
                    ← All Guides
                  </Link>
                  <Link href="/pricing" className="px-6 py-3 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-all">
                    Try SocialMate Free
                  </Link>
                </div>
              </section>

            </article>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
