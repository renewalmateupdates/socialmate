import Link from "next/link"

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e4e4e0] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get Started Free →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-black mb-2">1. Who We Are</h2>
            <p>SocialMate is a social media scheduling platform built and operated by Joshua Bostic. We are part of the Mate brand family, which also includes RenewalMate. You can reach us at renewalmate.updates@gmail.com.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">2. What We Collect</h2>
            <p>We collect the following information when you use SocialMate:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your email address and password (used for account creation and login)</li>
              <li>Posts and content you create and schedule within the app</li>
              <li>Connected social account information (platform names only — we do not store your social media passwords)</li>
              <li>Usage data such as pages visited and features used, to improve the product</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Operate and improve SocialMate</li>
              <li>Send you account-related emails (confirmations, password resets)</li>
              <li>Process payments securely via Stripe (we never store card details)</li>
              <li>Provide customer support when you contact us</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">4. We Do Not Sell Your Data</h2>
            <p>We will never sell, rent, or trade your personal information to third parties for marketing purposes. Period.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">5. Data Storage</h2>
            <p>Your data is stored securely using Supabase, which is hosted on AWS infrastructure. All data is encrypted in transit and at rest.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">6. Cookies</h2>
            <p>We use essential cookies only — these are required to keep you logged in and use the app. We do not use advertising or tracking cookies.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your data at any time. To request deletion of your account and all associated data, email us at renewalmate.updates@gmail.com and we will process your request within 7 days.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">8. Third Party Services</h2>
            <p>SocialMate uses the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Supabase — database and authentication</li>
              <li>Vercel — hosting and deployment</li>
              <li>Stripe — payment processing (coming soon)</li>
              <li>Google Gemini — AI caption generation (coming soon)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes by email or by posting a notice in the app.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">10. Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:renewalmate.updates@gmail.com" className="underline hover:text-black">renewalmate.updates@gmail.com</a></p>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#e4e4e0] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm text-gray-400 hover:text-black transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-black transition-colors">Terms</a>
          </div>
          <div className="text-sm text-gray-400">© 2026 SocialMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}