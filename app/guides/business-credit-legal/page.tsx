import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: "Business Credit, Legal Foundations & Tax Breaks (Free Guide) — Gilgamesh's Guides",
  description:
    'The complete no-BS guide to DUNS numbers, building business credit, licenses, tax deductions, LLC vs S-Corp, and insurance. Real numbers, real resources, zero paywalls.',
  keywords: [
    'DUNS number how to get',
    'business credit building',
    'PAYDEX score',
    'net 30 accounts',
    'business tax deductions',
    'section 179 deduction',
    'LLC vs S-Corp',
    'Wyoming LLC benefits',
    'self employed tax breaks',
    'QBI deduction',
    'business license requirements',
    'small business insurance',
  ],
  openGraph: {
    title: "Business Credit, Legal Foundations & Tax Breaks — Gilgamesh's Guide Vol. 3",
    description:
      'DUNS numbers, PAYDEX scores, Net-30 accounts, tax breaks, LLC vs S-Corp. Everything they charge $500 courses for — free.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',    label: 'Preface' },
  { id: 'ch1',       label: '1. The DUNS Number' },
  { id: 'ch2',       label: '2. Building Business Credit' },
  { id: 'ch3',       label: '3. Licenses & Registrations' },
  { id: 'ch4',       label: '4. Tax Deductions' },
  { id: 'ch5',       label: '5. LLC vs. S-Corp' },
  { id: 'ch6',       label: '6. Banking' },
  { id: 'ch7',       label: '7. Insurance' },
  { id: 'resources', label: 'All Resources' },
]

export default function BusinessCreditLegalGuidePage() {
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
                Vol. 3
              </span>
              <span className="text-xs text-gray-600">40 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Business Credit, Legal Foundations & Tax Breaks
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The complete playbook — DUNS numbers, PAYDEX scores, licenses, deductions, and everything they charge $500 courses for.
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
                  Nobody sits you down and explains this stuff. Not school, not your parents, not your employer. You find out about DUNS numbers when a vendor asks for one. You find out about S-Corp elections when a CPA tells you you've been overpaying for years. You find out about PAYDEX scores when a bank won't give you a line of credit because you don't have one.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  This guide is everything I had to learn the hard way — or paid someone to explain — presented for free, in plain language, with real numbers. I'm not a lawyer or a CPA. Nothing here is legal or financial advice. But I did the research, verified the sources, and wrote it all down so you don't have to.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  The system is confusing on purpose. We're going to un-confuse it. Let's go.
                </p>
              </section>

              {/* Chapter 1 */}
              <section id="ch1" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 1</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">The DUNS Number — Your Business's Social Security Number</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">What It Is</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  A D-U-N-S Number is a unique 9-digit identifier assigned by Dun & Bradstreet (D&B) to every registered business entity. Think of it as a Social Security Number for your business — publicly traceable. D&B uses it to build and track your business credit file, which vendors, lenders, and even the federal government reference when deciding whether to extend your business credit.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  D&B is the dominant business credit bureau. Without a DUNS number, your business doesn't exist in their database — invisible to any vendor, lender, or partner who checks.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">How to Get One — Free</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Go to <a href="https://www.dnb.com/en-us/smb/duns/get-a-duns.html" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">dnb.com/en-us/smb/duns/get-a-duns.html</a> and submit an application. There is no charge. You'll need:
                </p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>Legal business name, address, phone</li>
                  <li>Name of business owner/CEO</li>
                  <li>Legal business structure (LLC, sole prop, etc.)</li>
                  <li>Date of formation</li>
                  <li>Primary industry and number of employees</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Timeline: up to 30 business days. D&B may contact you to verify. There's a paid expedited option (~8 business days) — don't pay for it unless you have a hard deadline.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Check first — you might already have one.</p>
                  <p className="text-gray-400 text-sm">Use D&B's lookup tool at <a href="https://www.dnb.com/duns-number/lookup.html" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">dnb.com/duns-number/lookup.html</a>. If someone has reported a payment with you, D&B may have already created a file.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">What It Unlocks</h3>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>Eligibility for a PAYDEX credit score</li>
                  <li>Net-30 trade accounts with vendors who check D&B</li>
                  <li>Required for federal government contracting</li>
                  <li>Required for Apple Developer organizational enrollment</li>
                  <li>Visibility to banks and lenders who check D&B before extending credit</li>
                </ul>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                  <p className="text-gray-400 text-sm"><span className="text-white font-semibold">The honest reality:</span> Getting a DUNS number does not automatically give you a PAYDEX score. A score only generates after D&B receives at least 3 payment experiences from at least 2 separate vendors. The number is step one — building the file is the work.</p>
                </div>
              </section>

              {/* Chapter 2 */}
              <section id="ch2" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 2</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Building Business Credit</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Business Credit vs. Personal Credit</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm text-gray-300 border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a2a2a]">
                        <th className="text-left py-3 pr-6 text-gray-500 font-semibold"></th>
                        <th className="text-left py-3 pr-6 text-amber-400 font-semibold">Personal Credit</th>
                        <th className="text-left py-3 text-amber-400 font-semibold">Business Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                      {[
                        ['Score range', '300–850', '1–100 (PAYDEX)'],
                        ['Tied to', 'Social Security Number', 'EIN + DUNS Number'],
                        ['Who can see it', 'Lenders, landlords', 'Anyone — it\'s public'],
                        ['Reporting required', 'Yes, by law', 'No — completely voluntary'],
                        ['Built by', 'Personal cards, loans', 'Trade accounts, vendor lines'],
                        ['Affects personal life', 'Yes', 'No (when separated properly)'],
                      ].map(([label, personal, business]) => (
                        <tr key={label}>
                          <td className="py-3 pr-6 font-medium text-gray-400">{label}</td>
                          <td className="py-3 pr-6">{personal}</td>
                          <td className="py-3">{business}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  That last row about reporting is critical: <strong className="text-white">business credit reporting is completely voluntary.</strong> No law forces vendors or issuers to report your payments to D&B. You must specifically open accounts with vendors who do report.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The PAYDEX Score</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  PAYDEX is D&B's primary business payment score. Range: 1–100. Higher is better.
                </p>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm text-gray-300 border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a2a2a]">
                        <th className="text-left py-3 pr-6 text-amber-400 font-semibold">Score</th>
                        <th className="text-left py-3 pr-6 text-amber-400 font-semibold">What It Signals</th>
                        <th className="text-left py-3 text-amber-400 font-semibold">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                      {[
                        ['80–100', 'Pays on time to early', 'Low'],
                        ['50–79', 'Pays late occasionally', 'Moderate'],
                        ['1–49', 'Pays significantly late', 'High'],
                      ].map(([score, signal, risk]) => (
                        <tr key={score}>
                          <td className="py-3 pr-6 font-bold text-white">{score}</td>
                          <td className="py-3 pr-6">{signal}</td>
                          <td className="py-3">{risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  PAYDEX is dollar-weighted and recency-weighted. A large invoice paid on time counts more than a small one. Credit card payments generally do not count — only trade credit invoices with payment terms (Net-30, Net-60, etc.) feed PAYDEX.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Pro tip: Pay early, not just on time.</p>
                  <p className="text-gray-400 text-sm">Paying within 10–15 days of a Net-30 invoice pushes your PAYDEX above 80 toward 90+, signaling to lenders that you're consistently early — not just compliant.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Net-30 Vendor Accounts to Start With</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These vendors extend trade credit and report your payment history to D&B and/or other business bureaus. They're the foundation.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { name: 'Crown Office Supplies', desc: 'Office supplies. Reports to D&B, Experian Business, and Equifax Business. Easiest approval for new businesses.' },
                    { name: 'Quill (Staples subsidiary)', desc: 'Office supplies. Reports to D&B. One of the most commonly recommended first accounts.' },
                    { name: 'Uline', desc: 'Shipping, packaging, warehouse supplies. Reports to D&B, Experian, and Equifax. Requires a minimum order.' },
                    { name: 'CEO Creative / Creative Analytics', desc: 'Business services and supplies. Reports to D&B. Designed specifically for business credit building.' },
                    { name: 'Newegg Business', desc: 'Electronics and computer equipment. Reports to D&B. Good after 3–6 months of established history.' },
                  ].map(v => (
                    <div key={v.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                      <p className="text-white font-semibold text-sm mb-1">{v.name}</p>
                      <p className="text-gray-400 text-sm">{v.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong className="text-white">Strategy:</strong> Open Crown, Quill, and one more. Make small legitimate purchases. Pay early (10–15 days, not day 30). Wait 60 days for accounts to appear. After 3 accounts report, you'll get a PAYDEX score. Then apply to mid-tier vendors.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Business Credit Cards That Report to D&B</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Most people don't know: many major business cards do NOT report positive payment history to D&B. American Express only reports when an account goes delinquent — your on-time payments are invisible to them.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Cards that actively report positive history: <strong className="text-white">Brex</strong> (best for startups, reports to all 3 business bureaus monthly, no personal credit check), <strong className="text-white">Capital One business cards</strong>, <strong className="text-white">Chase business cards</strong>, and <strong className="text-white">FNBO Business Edition Secured Mastercard</strong> (secured, easier approval).
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Realistic Timeline</h3>
                <div className="space-y-3 mb-6">
                  {[
                    ['Months 1–2', 'Open accounts, make purchases, pay early. Nothing shows up yet.'],
                    ['Months 3–4', 'First accounts appear on your D&B file. PAYDEX score may generate.'],
                    ['Month 6', 'Solid initial profile if 3–5 accounts reporting positively.'],
                    ['Year 1–2', 'Enough history to qualify for business credit cards without personal guarantees.'],
                    ['Year 2–3', 'Full profile. Can apply for business lines of credit and SBA loans with favorable terms.'],
                  ].map(([period, desc]) => (
                    <div key={period} className="flex gap-4">
                      <span className="text-amber-400 font-bold text-sm w-24 shrink-0 mt-0.5">{period}</span>
                      <p className="text-gray-300 text-sm">{desc}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">7 Mistakes That Tank Business Credit</h3>
                <ol className="text-gray-300 space-y-3 list-decimal list-inside mb-4">
                  <li>Mixing personal and business finances — none of those payments build your business file</li>
                  <li>Not registering with D&B first — data may not attach to your file correctly</li>
                  <li>Missing payments — one late payment drops PAYDEX by 20–30 points</li>
                  <li>Opening accounts that don't report — verify before you open anything</li>
                  <li>High credit utilization — keep below 30% of your credit limit</li>
                  <li>Applying for too many accounts at once — space them out over months</li>
                  <li>Not monitoring your own file — D&B errors happen. Check at <a href="https://www.nav.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">nav.com</a> (free)</li>
                </ol>
              </section>

              {/* Chapter 3 */}
              <section id="ch3" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 3</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Business Licenses & Registrations</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Three-Layer System</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Business licensing in the U.S. operates at three levels simultaneously. You may need all three.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                    <p className="text-white font-bold mb-2">Federal Level</p>
                    <p className="text-gray-400 text-sm">Most businesses do NOT need a federal license. Exceptions: firearms (ATF), alcohol (TTB), broadcasting (FCC), aviation (FAA), transportation (FMCSA), agriculture crossing state lines (USDA). If you're running software, consulting, or an online business — you almost certainly need no federal license.</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                    <p className="text-white font-bold mb-2">State Level</p>
                    <p className="text-gray-400 text-sm">29 states require a general business license for virtually all businesses. Almost every state requires occupation-specific licenses for regulated professions. A <strong className="text-gray-300">seller's permit / sales tax permit</strong> is required in 45 states + DC if you sell physical goods or taxable services — including online sales once you hit economic nexus ($100k in sales or 200 transactions).</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                    <p className="text-white font-bold mb-2">Local Level (City/County)</p>
                    <p className="text-gray-400 text-sm">This is where most small businesses start. Many cities and counties require a general business license or "business tax certificate" — typically $50–$500/year depending on your jurisdiction.</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">How to Find Out What Your State Requires</h3>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>SBA license lookup: <a href="https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">sba.gov — apply for licenses and permits</a></li>
                  <li>50-state guide: <a href="https://www.nolo.com/legal-encyclopedia/small-business-license-requirements-a-50-state-guide" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Nolo 50-state small business license guide</a></li>
                  <li>Your state's Secretary of State website — search "business licensing"</li>
                  <li>Your city or county clerk's office — call and ask directly</li>
                </ul>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">What Happens If You Operate Without Proper Licenses</h3>
                <p className="text-gray-300 leading-relaxed mb-4">This is not theoretical — regulators enforce this:</p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li><strong className="text-white">Fines:</strong> $500–$5,000 for a first offense, or a percentage of gross revenue earned while unlicensed</li>
                  <li><strong className="text-white">Forced closure:</strong> Cease-and-desist orders — immediate for food service and healthcare</li>
                  <li><strong className="text-white">Contracts voided:</strong> Courts in some states will void contracts you signed while unlicensed — clients may owe you nothing and can recover what they already paid</li>
                  <li><strong className="text-white">Criminal penalties:</strong> In many states, operating without a required license is a misdemeanor (fines + up to one year in jail). Repeat offenders can face felony charges</li>
                  <li><strong className="text-white">Example:</strong> Virginia — first offense: $5,000 civil penalty. Second: $10,000.</li>
                </ul>
              </section>

              {/* Chapter 4 */}
              <section id="ch4" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 4</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Tax Deductions for Small Businesses</h2>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-8">
                  <p className="text-gray-400 text-sm"><span className="text-white font-semibold">Note:</span> Tax law changes. Everything below reflects 2025 tax year rules, including the One Big Beautiful Bill Act (OBBBA) signed July 4, 2025, which changed several provisions. Always verify with a CPA before filing.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Section 179: Full Equipment Deduction in Year One</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Lets you deduct the full purchase price of qualifying equipment and software in the year you buy it — instead of depreciating it over multiple years.
                </p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li><strong className="text-white">2025 limit (post-OBBBA):</strong> Up to $2,500,000 (doubled from prior $1.25M limit)</li>
                  <li><strong className="text-white">Phase-out:</strong> Begins when total purchases exceed $4,000,000. Fully phases out at $6,500,000.</li>
                  <li><strong className="text-white">What qualifies:</strong> Computers, software, equipment, machinery, business vehicles (with limits), improvements to nonresidential property</li>
                  <li><strong className="text-white">Key rule:</strong> Must be used more than 50% for business. 60% business use = deduct 60% of cost</li>
                  <li><strong className="text-white">Cannot create a loss</strong> — deduction limited to your business income</li>
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Real example</p>
                  <p className="text-gray-400 text-sm">You spend $8,000 on a laptop, two monitors, and business software — 100% business use. You deduct the full $8,000 this year. That's an immediate $8,000 reduction in taxable income instead of depreciating it over 5 years.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Home Office Deduction</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong className="text-white">The fundamental rule:</strong> The space must be used <em>regularly and exclusively</em> as your principal place of business. A desk in a guest bedroom where you also have a TV doesn't qualify. A dedicated room used only for work does.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">Simplified Method</p>
                    <p className="text-gray-400 text-sm">$5 per square foot, max 300 sq ft = max <strong className="text-white">$1,500/year</strong>. No depreciation tracking. Cannot create a loss.</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">Actual Expense Method</p>
                    <p className="text-gray-400 text-sm">Office sq ft ÷ total home sq ft = your percentage. Apply to rent, utilities, insurance, internet. Potentially much larger. More paperwork but often worth it.</p>
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Real example (actual method)</p>
                  <p className="text-gray-400 text-sm">You rent a 1,000 sq ft apartment for $1,800/month. Home office is 150 sq ft (15%). You deduct 15% of rent ($270/month = $3,240/year) + 15% of utilities, internet, and renter's insurance. Far exceeds the $1,500 simplified cap.</p>
                </div>
                <p className="text-gray-300 text-sm"><strong className="text-white">Cannot use this deduction if:</strong> You're a W-2 employee. This is only for self-employed individuals and business owners.</p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Vehicle Deduction</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">Standard Mileage Rate (2025)</p>
                    <p className="text-amber-400 font-black text-2xl mb-2">70¢/mile</p>
                    <p className="text-gray-400 text-sm">Track every business mile. Use MileIQ or Everlance. Simpler. 2026 rate: 72.5¢/mile (IRS announced).</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">Actual Expense Method</p>
                    <p className="text-gray-400 text-sm">Track all costs (gas, insurance, repairs, registration). Apply business-use percentage. Claim depreciation. Better for expensive vehicles or high mileage.</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4"><strong className="text-white">Keep a mileage log:</strong> Date, destination, business purpose, miles driven. The IRS will deny the deduction without records.</p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Self-Employed Health Insurance Deduction</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Self-employed individuals can deduct 100% of health insurance premiums for themselves, spouse, dependents, and children under 27.
                </p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>Reduces income tax but NOT self-employment tax</li>
                  <li>Deducted on Schedule 1 (Form 1040), not Schedule C</li>
                  <li>Includes medical, dental, and qualified long-term care premiums</li>
                  <li><strong className="text-white">Cannot claim if</strong> you were eligible for employer-sponsored coverage through a job or spouse's employer</li>
                </ul>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Retirement Account Contributions</h3>
                <p className="text-gray-300 leading-relaxed mb-4">One of the most powerful deductions. Reduces taxable income dollar-for-dollar.</p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">SEP-IRA</p>
                    <p className="text-amber-400 font-black text-xl mb-2">Up to $70,000 (2025)</p>
                    <p className="text-gray-400 text-sm">25% of net SE income. Easy to open (Vanguard, Fidelity, Schwab — free). No Roth option. Contribute anytime before your tax filing deadline (including extensions = Oct 15).</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">Solo 401(k)</p>
                    <p className="text-amber-400 font-black text-xl mb-2">Up to $70,000 (2025)</p>
                    <p className="text-gray-400 text-sm">Employee deferrals + employer profit sharing. Allows Roth contributions. Allows loans. <strong className="text-gray-200">Must be established by December 31</strong> of the tax year (unlike SEP-IRA).</p>
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Real example</p>
                  <p className="text-gray-400 text-sm">You earn $80,000 net profit. With a SEP-IRA, you contribute ~$16,000 (20% of $80k). Taxable income drops from $80k to $64k. At 22% bracket: $3,520 in tax savings — and you kept the money for retirement.</p>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Business Meals (50% Rule)</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Deduct 50% of business meal costs (food, beverages, delivery, tips, tax) when you or an employee is present with a current/potential client and there's a genuine business purpose.
                </p>
                <p className="text-gray-300 text-sm mb-2"><strong className="text-white">Document every meal:</strong> Date, location, names + relationship of attendees, business purpose, receipt.</p>
                <p className="text-gray-300 text-sm"><strong className="text-white">Entertainment is NOT deductible</strong> since 2018 — no tickets to sporting events, concerts, or golf outings, even if a client is present.</p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Education & Professional Development</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Deductible if it maintains or improves skills in your <em>current</em> business. NOT deductible if it qualifies you for a new career.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 font-bold text-sm mb-2">✓ Qualifies</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>Online courses in your field</li>
                      <li>Trade publications and subscriptions</li>
                      <li>Professional conferences</li>
                      <li>Coaching for your business skills</li>
                      <li>License renewal fees</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 font-bold text-sm mb-2">✗ Does NOT qualify</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>Education to enter a new profession</li>
                      <li>Initial professional school (law, med)</li>
                      <li>Courses to pivot to a different field</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Startup Cost Deduction</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Deduct up to <strong className="text-white">$5,000</strong> of startup costs in the first year your business is active.
                </p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>Phase-out: If total startup costs exceed $50,000, the $5k deduction reduces dollar-for-dollar. Above $55,000 = no first-year deduction</li>
                  <li>Remaining costs amortized over 180 months (15 years)</li>
                  <li>Organizational costs (entity formation, attorney fees) get their own separate $5,000 deduction</li>
                  <li>Only applies in the year the business actually begins — investigating a business that never launched = not deductible</li>
                </ul>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">QBI Deduction — The 20% Pass-Through Deduction</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Pass-through business owners (sole proprietors, LLC members, S-Corp owners, partners) can deduct up to <strong className="text-white">20% of their qualified business income (QBI)</strong> from taxable income. Made permanent by the OBBBA (signed July 4, 2025).
                </p>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li><strong className="text-white">Under $247,300 (single) / $494,600 (married):</strong> You get the full 20% with no complications</li>
                  <li><strong className="text-white">Above those thresholds:</strong> Gets complex, especially for service businesses (consulting, law, accounting, financial services). May phase out completely.</li>
                  <li><strong className="text-white">Starting 2026:</strong> Minimum $400 deduction if you have at least $1,000 in QBI (new OBBBA provision)</li>
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Simple example</p>
                  <p className="text-gray-400 text-sm">Your LLC generates $100,000 in net profit. QBI deduction = $20,000. You pay income tax on only $80,000.</p>
                </div>
              </section>

              {/* Chapter 5 */}
              <section id="ch5" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 5</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">LLC vs. S-Corp Election</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The Default: Single-Member LLC Taxation</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  By default, a single-member LLC is taxed as a sole proprietorship. All profit goes on Schedule C and is subject to <strong className="text-white">15.3% self-employment tax</strong> on the first ~$176,100, then 2.9% above that — before income tax even begins.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">At $100,000 net profit, you owe roughly <strong className="text-white">$14,130 in SE tax</strong> on top of income tax. This is the killer for high-earning solo founders.</p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">How S-Corp Election Works</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Filing IRS Form 2553 elects your LLC to be taxed as an S-Corporation. This does NOT change your legal structure — you're still an LLC under state law. Only the tax treatment changes.
                </p>
                <ol className="text-gray-300 space-y-2 list-decimal list-inside mb-4">
                  <li>You pay yourself a "reasonable salary" as an owner-employee (W-2)</li>
                  <li>The company pays payroll taxes (Social Security + Medicare) on that salary only</li>
                  <li>Remaining profit flows to you as owner distributions — <strong className="text-white">NOT subject to self-employment tax</strong></li>
                </ol>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">The "Reasonable Salary" Rule — Don't Cross This Line</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You cannot pay yourself $1 in salary and take all profit as distributions. This is the most audited S-Corp issue. The IRS requires a salary comparable to what you'd pay someone else to do your job.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Look up your role on BLS.gov, Salary.com, or Indeed. Common starting approach: pay yourself 40–60% of net profit as salary — but this must align with actual market rates. The IRS will reclassify unreasonably low salaries as wages and hit you with back payroll taxes, penalties, and interest.
                </p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Real Tax Savings by Income Level</h3>
                <div className="space-y-4 mb-6">
                  {[
                    { income: '$80,000 net profit', salary: '$40,000', dist: '$40,000', saved: '~$6,120', costs: '$2,000–$3,000/yr', net: '~$3,000–$4,000' },
                    { income: '$150,000 net profit', salary: '$75,000', dist: '$75,000', saved: '~$10,900', costs: '$2,500–$4,000/yr', net: '~$6,900–$8,400' },
                  ].map(row => (
                    <div key={row.income} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                      <p className="text-white font-bold mb-3">{row.income}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><p className="text-gray-500 text-xs mb-1">Salary</p><p className="text-gray-200">{row.salary}</p></div>
                        <div><p className="text-gray-500 text-xs mb-1">Distributions</p><p className="text-gray-200">{row.dist}</p></div>
                        <div><p className="text-gray-500 text-xs mb-1">SE Tax Saved</p><p className="text-green-400 font-bold">{row.saved}</p></div>
                        <div><p className="text-gray-500 text-xs mb-1">Net Annual Savings</p><p className="text-amber-400 font-bold">{row.net}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 text-sm font-semibold mb-1">The break-even point</p>
                  <p className="text-gray-400 text-sm">Most tax professionals agree S-Corp election isn't worth the administrative overhead until your net business income reliably exceeds $60,000–$80,000/year. Below that, the costs eat the savings.</p>
                </div>
                <p className="text-gray-300 text-sm mb-2"><strong className="text-white">Annual S-Corp costs to budget:</strong> Payroll service (Gusto, QuickBooks Payroll): $1,200–$3,000/yr · Additional CPA for Form 1120-S: $500–$2,000/yr · State franchise fees: $50–$800/yr</p>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Election Deadlines</h3>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li>File IRS Form 2553</li>
                  <li>Current-year election: by March 15, or within 2 months + 15 days of business start</li>
                  <li>Next-year election: anytime during the current calendar year</li>
                  <li>Late elections are sometimes granted with reasonable cause</li>
                </ul>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Why Wyoming LLC Specifically</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { label: 'No state income tax', desc: 'No corporate income tax, no personal income tax, no franchise tax (vs. California\'s $800/year minimum just for having an LLC there).' },
                    { label: 'Privacy / Anonymity', desc: 'Wyoming does not require member/manager names in public filings. Articles of Organization are public, but ownership is not — just the registered agent.' },
                    { label: 'Charging order protection', desc: 'Some of the strongest in the country. A creditor pursuing you personally cannot seize or force dissolution of the LLC — only potentially claim your distributions.' },
                    { label: 'Low cost', desc: 'Formation: $100. Annual report: $60 minimum. Name reservation (optional): $50.' },
                  ].map(item => (
                    <div key={item.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                      <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <p className="text-red-400 text-sm font-semibold mb-1">The honest caveat</p>
                  <p className="text-gray-400 text-sm">If you form a Wyoming LLC but operate in California, you'll likely need to register as a "foreign LLC" in California and pay their $800/year franchise tax. Wyoming's benefits fully apply only if you actually operate in Wyoming or a no-income-tax state. Consult a CPA for your specific situation.</p>
                </div>
              </section>

              {/* Chapter 6 */}
              <section id="ch6" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 6</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Banking & Financial Setup</h2>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Why Separate Business Banking Is Non-Negotiable</h3>
                <p className="text-gray-300 leading-relaxed mb-4">Mixing personal and business finances destroys two things simultaneously: your business credit profile and your legal protection.</p>
                <ul className="text-gray-300 space-y-2 mb-6 list-disc list-inside">
                  <li><strong className="text-white">Piercing the corporate veil:</strong> Your LLC's liability protection can be voided by a court if you commingle funds. The entire point of an LLC is personal asset protection — commingling eliminates it.</li>
                  <li><strong className="text-white">No business credit without a business account:</strong> Lenders and bureaus need to see a dedicated business account as a sign you're operating a real business.</li>
                  <li><strong className="text-white">Tax nightmare:</strong> Mixing accounts makes categorizing deductions a guessing game — costs you money and creates audit risk.</li>
                </ul>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Best Free Business Bank Accounts (2025–2026)</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { name: 'Bluevine Business Checking', desc: 'No monthly fee, no minimum balance, unlimited domestic transactions, no overdraft fees. FDIC-insured. Solid for online businesses and small LLCs.' },
                    { name: 'Novo Business Banking', desc: 'No monthly fee, no minimums, no transaction limits. Clean mobile app. Integrates with Stripe, QuickBooks, Shopify. Popular with digital businesses.' },
                    { name: 'North One', desc: 'Free Standard plan with unlimited transactions. Good budgeting envelopes feature. No fees on incoming wires.' },
                    { name: 'Axos Basic Business Checking', desc: 'No monthly fees, no minimums, no transaction limits. Full-service online banking.' },
                    { name: 'U.S. Bank Silver Business Checking', desc: 'One of the few traditional banks with a genuinely free tier. Up to 125 free transactions/month. Physical branches for cash deposits.' },
                  ].map(b => (
                    <div key={b.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                      <p className="text-white font-semibold text-sm mb-1">{b.name}</p>
                      <p className="text-gray-400 text-sm">{b.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-sm">Read the fine print. "No monthly fee" often still means fees for wires, cash deposits, or excessive transactions. Businesses that regularly deposit cash typically need a traditional bank.</p>
              </section>

              {/* Chapter 7 */}
              <section id="ch7" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Chapter 7</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Insurance</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  An LLC protects your personal assets from business lawsuits — but only up to a point. If a court finds you were personally negligent, or if the judgment exceeds what the LLC can cover, personal assets may still be at risk. Insurance is the backstop. For any professional service business, one bad client complaint can trigger a lawsuit. Insurance makes those survivable.
                </p>

                <div className="space-y-5 mb-8">
                  {[
                    {
                      name: 'General Liability Insurance',
                      covers: 'Bodily injury to third parties, property damage you cause, advertising injury (libel/slander)',
                      notCovers: 'Professional errors, employee injuries, your own property, cyber incidents',
                      cost: '$45–$101/month ($540–$1,200/year) for most small service businesses',
                      who: 'Almost every business with clients visiting premises, or that could cause property damage',
                    },
                    {
                      name: 'Professional Liability / E&O Insurance',
                      covers: 'Claims that your work, advice, or services caused a client financial harm — even if you weren\'t actually negligent',
                      notCovers: 'Intentional wrongdoing, bodily injury',
                      cost: '$50–$125/month ($600–$1,500/year) for small service businesses',
                      who: 'Any business providing professional services, advice, or technical work — consultants, designers, developers, marketers, coaches',
                    },
                    {
                      name: 'Cyber Liability Insurance',
                      covers: 'Data breach costs, forensic investigation, legal fees, regulatory fines, ransomware, business interruption from cyber incidents',
                      notCovers: 'Physical property damage, employee injuries',
                      cost: 'Basic $1M coverage: $750–$1,500/year. Comprehensive: $1,500–$5,000/year',
                      who: 'Any business storing customer data (emails, payment info, personal info) or using cloud software',
                    },
                  ].map(ins => (
                    <div key={ins.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                      <p className="text-white font-bold mb-3">{ins.name}</p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Covers</p>
                          <p className="text-gray-300">{ins.covers}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Does NOT cover</p>
                          <p className="text-gray-400">{ins.notCovers}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Typical cost</p>
                          <p className="text-amber-400 font-semibold">{ins.cost}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Who needs it</p>
                          <p className="text-gray-300">{ins.who}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-amber-400 mt-8 mb-3">Where to Compare and Buy</h3>
                <ul className="text-gray-300 space-y-2 mb-4 list-disc list-inside">
                  <li><a href="https://www.insureon.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Insureon.com</a> — marketplace, good for comparing multiple quotes</li>
                  <li><a href="https://www.nextinsurance.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Next Insurance</a> — digital-first, fast quotes</li>
                  <li><a href="https://www.hiscox.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Hiscox</a> — popular for professional services</li>
                  <li><a href="https://www.thehartford.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">The Hartford</a> — established carrier for small business</li>
                </ul>
              </section>

              {/* Resources */}
              <section id="resources" className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-3 py-1">Resources</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4">All Resources — Bookmarked</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { label: 'Get a free DUNS number', url: 'https://www.dnb.com/en-us/smb/duns/get-a-duns.html' },
                    { label: 'D&B DUNS lookup', url: 'https://www.dnb.com/duns-number/lookup.html' },
                    { label: 'Free business credit monitoring (Nav)', url: 'https://www.nav.com' },
                    { label: 'SBA license & permit guide', url: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits' },
                    { label: 'Nolo 50-state business license guide', url: 'https://www.nolo.com/legal-encyclopedia/small-business-license-requirements-a-50-state-guide' },
                    { label: 'IRS QBI deduction info', url: 'https://www.irs.gov/newsroom/qualified-business-income-deduction' },
                    { label: 'IRS home office deduction (Pub 587)', url: 'https://www.irs.gov/publications/p587' },
                    { label: 'IRS standard mileage rates', url: 'https://www.irs.gov/tax-professionals/standard-mileage-rates' },
                    { label: 'IRS self-employed retirement plans', url: 'https://www.irs.gov/retirement-plans/retirement-plans-for-self-employed-people' },
                    { label: 'Wyoming Secretary of State (file LLC)', url: 'https://wyobiz.wyo.gov' },
                    { label: 'Best Net-30 accounts (Nav)', url: 'https://www.nav.com/resource/net-30-accounts/' },
                    { label: 'Insurance comparison (Insureon)', url: 'https://www.insureon.com' },
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

              {/* Closing */}
              <section className="mb-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
                <p className="text-white font-black text-xl mb-3">Power to the people.</p>
                <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
                  All of this knowledge was gated behind expensive accountants, lawyers, and $500 courses. Now it's free. Share it with someone who needs it.
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
