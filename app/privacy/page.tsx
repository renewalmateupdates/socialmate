import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — SocialMate',
  description: 'How SocialMate collects, uses, and protects your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">← Back to SocialMate</Link>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Privacy Policy</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-12">Last updated: March 14, 2026 · Gilgamesh Enterprise LLC</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">1. Who we are</h2>
            <p>SocialMate is a social media scheduling and content management platform operated by Gilgamesh Enterprise LLC ("we", "us", "our"). Our service is available at socialmate-six.vercel.app and associated domains.</p>
            <p className="mt-2">For privacy-related questions, contact us at: <a href="mailto:socialmate.updates@gmail.com" className="text-black dark:text-gray-100 font-semibold underline">socialmate.updates@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">2. What we collect</h2>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Email address and password when you create an account</li>
              <li>Display name and profile information</li>
              <li>Content you create, schedule, or publish through our platform</li>
              <li>Payment information processed by Stripe (we never store card numbers directly)</li>
              <li>Team member email addresses when you send invitations</li>
            </ul>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Information collected automatically:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>OAuth tokens from connected social media platforms</li>
              <li>Post engagement analytics fetched from connected platforms</li>
              <li>Usage data and feature interactions</li>
              <li>IP address and browser information for security purposes</li>
            </ul>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Information from third parties:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Profile information from social platforms you connect (name, avatar, username)</li>
              <li>Post engagement metrics from connected platform APIs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the SocialMate platform</li>
              <li>To publish and schedule posts to your connected social accounts on your behalf</li>
              <li>To process payments and manage subscriptions via Stripe</li>
              <li>To send transactional emails (account confirmation, team invitations, billing receipts)</li>
              <li>To generate AI-powered content suggestions using Google Gemini (your content is sent to Google's API for processing)</li>
              <li>To display analytics about your posting activity</li>
              <li>To improve our platform and fix bugs</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties. We do not use your content to train AI models.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">4. Third-party services</h2>
            <p className="mb-3">SocialMate integrates with the following third-party services. Each has their own privacy policy:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Supabase</span> — database and authentication (supabase.com/privacy)</li>
              <li><span className="font-semibold">Stripe</span> — payment processing (stripe.com/privacy)</li>
              <li><span className="font-semibold">Google Gemini</span> — AI content generation (ai.google.dev)</li>
              <li><span className="font-semibold">Resend</span> — transactional email delivery (resend.com/privacy)</li>
              <li><span className="font-semibold">Vercel</span> — platform hosting (vercel.com/legal/privacy-policy)</li>
              <li><span className="font-semibold">Inngest</span> — background job processing (inngest.com/privacy)</li>
              <li>Social platforms you connect (Discord, Bluesky, Mastodon, Telegram, YouTube, LinkedIn, Pinterest, Reddit)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">5. Data storage and security</h2>
            <p>Your data is stored on Supabase's infrastructure, hosted on AWS in the United States. We use Row Level Security (RLS) to ensure users can only access their own data.</p>
            <p className="mt-2">OAuth tokens for connected platforms are stored encrypted. Passwords are hashed using bcrypt via Supabase Auth and are never stored in plain text.</p>
            <p className="mt-2">We implement reasonable security measures, but no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">6. Data retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your posts, content, and profile data are deleted within 30 days</li>
              <li>Billing records may be retained for up to 7 years for legal/accounting purposes</li>
              <li>Connected platform tokens are revoked immediately upon account deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">7. Your rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (right to be forgotten)</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>
            <p className="mt-3">To exercise these rights, email us at <a href="mailto:socialmate.updates@gmail.com" className="text-black dark:text-gray-100 font-semibold underline">socialmate.updates@gmail.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">8. Cookies</h2>
            <p>SocialMate uses essential cookies for authentication session management. We do not use advertising or tracking cookies. We do not use third-party analytics services like Google Analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">9. Children's privacy</h2>
            <p>SocialMate is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">10. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes via email or a prominent notice in the app. Continued use of SocialMate after changes constitutes acceptance of the updated policy.</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2026 Gilgamesh Enterprise LLC. All rights reserved.</p>
          <Link href="/terms" className="text-xs font-semibold text-black dark:text-gray-100 hover:underline">Terms of Service →</Link>
        </div>
      </div>
    </div>
  )
}