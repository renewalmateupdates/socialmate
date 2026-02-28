import Link from "next/link"

export default function Terms() {
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
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-black mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account or using SocialMate, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">2. What SocialMate Is</h2>
            <p>SocialMate is a social media scheduling and management platform. We provide tools to help you plan, schedule, and analyze your social media content across multiple platforms.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">3. Your Account</h2>
            <p>You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. You may not share your account with others or use someone else&apos;s account without permission.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">4. Acceptable Use</h2>
            <p>You agree not to use SocialMate to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Post spam, misleading content, or content that violates any platform&apos;s terms of service</li>
              <li>Harass, threaten, or harm others</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to reverse engineer, hack, or disrupt the service</li>
              <li>Create multiple free accounts to bypass plan limits</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">5. Free Plan</h2>
            <p>The free plan is genuinely free with no hidden charges. Free plan users can schedule posts up to 2 weeks in advance, connect up to 3 accounts, and use 15 AI credits per month. We reserve the right to adjust free plan limits with 30 days notice.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">6. Paid Plans</h2>
            <p>Pro ($5/month) and Agency ($20/month) plans are billed monthly. You can cancel at any time and will retain access until the end of your billing period. We do not offer refunds for partial months. Payments are processed securely by Stripe.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">7. Referral Program</h2>
            <p>Our referral program awards 25 AI credits for each free user you refer, and 3 months of Pro free for each paying Pro referral, and 6 months of Pro free for each Agency referral. Rewards are only granted when a real payment clears. Abuse of the referral program may result in account termination.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">8. Your Content</h2>
            <p>You own all content you create in SocialMate. We do not claim ownership of your posts, captions, or media. By using the service, you grant us permission to store and process your content solely for the purpose of delivering the service to you.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">9. Service Availability</h2>
            <p>We aim for 99% uptime but cannot guarantee uninterrupted service. We are not liable for any losses caused by downtime, bugs, or service interruptions. We will always communicate planned maintenance in advance where possible.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">10. Termination</h2>
            <p>You can delete your account at any time by contacting us at renewalmate.updates@gmail.com. We reserve the right to suspend or terminate accounts that violate these terms, with or without notice depending on severity.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">11. Changes to These Terms</h2>
            <p>We may update these terms from time to time. We will notify you of significant changes by email at least 14 days before they take effect. Continued use of SocialMate after changes constitutes acceptance.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-2">12. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:renewalmate.updates@gmail.com" className="underline hover:text-black">renewalmate.updates@gmail.com</a></p>
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