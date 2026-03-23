import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — SocialMate',
  description: 'The terms and conditions governing your use of SocialMate.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">← Back to SocialMate</Link>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Terms of Service</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-12">Last updated: March 14, 2026 · Gilgamesh Enterprise LLC</p>

        <div className="space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">1. Acceptance of terms</h2>
            <p>By creating an account or using SocialMate ("Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms form a binding agreement between you and Gilgamesh Enterprise LLC ("Company", "we", "us").</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">2. Description of service</h2>
            <p>SocialMate is a social media scheduling and content management platform that allows users to compose, schedule, and publish content across multiple social media platforms, access AI-powered content tools, manage team members, and view analytics about their posting activity.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">3. Account registration</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 13 years old to use the Service</li>
              <li>One person may not maintain more than one free account</li>
              <li>You are responsible for all activity that occurs under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">4. Acceptable use</h2>
            <p className="mb-2">You agree not to use SocialMate to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Post spam, unsolicited messages, or engage in mass automated posting that violates platform terms</li>
              <li>Publish content that is illegal, defamatory, harassing, threatening, or infringes third-party rights</li>
              <li>Violate the terms of service of any connected social media platform</li>
              <li>Attempt to reverse engineer, hack, or disrupt the Service</li>
              <li>Use the Service to distribute malware or engage in phishing</li>
              <li>Impersonate any person or entity</li>
              <li>Circumvent any access controls or rate limits</li>
            </ul>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms without notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">5. Subscription and billing</h2>
            <p className="mb-2">SocialMate offers free and paid subscription tiers:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Free plan:</span> No charge, subject to usage limits</li>
              <li><span className="font-semibold">Pro plan:</span> $5/month or $55/year, billed in advance</li>
              <li><span className="font-semibold">Agency plan:</span> $20/month or $209/year, billed in advance</li>
              <li><span className="font-semibold">AI Credit Packs:</span> One-time purchases, non-refundable once credits are used</li>
            </ul>
            <p className="mt-3">All payments are processed by Stripe. Subscriptions automatically renew unless cancelled before the renewal date. You may cancel at any time through your account settings — cancellation takes effect at the end of the current billing period with no pro-rated refunds.</p>
            <p className="mt-2">We reserve the right to change pricing with 30 days notice to existing subscribers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">6. Refund policy</h2>
            <p>We offer refunds on subscription charges within 7 days of the initial purchase if the Service is not functioning as described. After 7 days, subscription charges are non-refundable. AI credit packs are non-refundable once any credits have been used. To request a refund, contact <a href="mailto:socialmate.updates@gmail.com" className="text-black font-semibold underline">socialmate.updates@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">7. Your content</h2>
            <p>You retain full ownership of all content you create and publish through SocialMate. By using the Service, you grant us a limited license to store, process, and transmit your content solely for the purpose of providing the Service.</p>
            <p className="mt-2">You are solely responsible for the content you publish. We do not review content before it is published and are not responsible for content that violates third-party platform policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">8. AI features</h2>
            <p>SocialMate uses Google Gemini AI to power content generation features. AI-generated content is provided as suggestions only. You are responsible for reviewing and approving all AI-generated content before publishing. We do not guarantee the accuracy, originality, or appropriateness of AI-generated content.</p>
            <p className="mt-2">AI credits are consumed when you use AI features. Credits do not roll over between billing periods and expire at the end of each month. Purchased credit packs do not expire.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">9. Connected platforms</h2>
            <p>When you connect a social media platform, you authorize SocialMate to access and act on your behalf within the permissions you grant. You can disconnect any platform at any time. We are not responsible for actions taken on connected platforms that result from your instructions or scheduled posts.</p>
            <p className="mt-2">Platform availability may change due to third-party API changes beyond our control. We will make reasonable efforts to notify users of platform disruptions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">10. Affiliate and referral program</h2>
            <p>Our affiliate program pays 30% recurring commission, scaling to 40% at 100+ active subscribers, with a 60-day payment lock period. Affiliates must be active paying subscribers. We reserve the right to modify or terminate the affiliate program with 30 days notice. Commission fraud will result in immediate termination and forfeiture of pending commissions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">11. Disclaimers and limitation of liability</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT POSTS WILL BE PUBLISHED AT EXACT SCHEDULED TIMES.</p>
            <p className="mt-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW, GILGAMESH ENTERPRISE LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.</p>
            <p className="mt-2">OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">12. Termination</h2>
            <p>We may terminate or suspend your account at any time for violation of these Terms. You may terminate your account at any time by contacting us or through account settings. Upon termination, your right to use the Service immediately ceases and we may delete your data per our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">13. Governing law</h2>
            <p>These Terms are governed by the laws of the State of Indiana, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Indiana.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">14. Changes to terms</h2>
            <p>We may update these Terms at any time. Material changes will be communicated via email or in-app notice with at least 30 days notice. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">15. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:socialmate.updates@gmail.com" className="text-black font-semibold underline">socialmate.updates@gmail.com</a></p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2026 Gilgamesh Enterprise LLC. All rights reserved.</p>
          <Link href="/privacy" className="text-xs font-semibold text-black hover:underline">Privacy Policy →</Link>
        </div>
      </div>
    </div>
  )
}