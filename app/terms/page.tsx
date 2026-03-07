'use client'
import Sidebar from '@/components/Sidebar'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-gray-400 mt-0.5">Last updated: March 2025</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6 text-sm text-gray-600 leading-relaxed">

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using SocialMate, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">2. Description of Service</h2>
              <p>SocialMate is a social media scheduling and management platform. We provide tools to schedule posts, manage content, and analyze performance across multiple social media platforms. Features vary by plan tier.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">3. User Accounts</h2>
              <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account. You may not share accounts or use the service for any unauthorized purpose. We reserve the right to suspend accounts that violate these terms.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">4. AI Credits</h2>
              <p>AI credits are allocated monthly based on your plan tier. Credits refresh on your billing date. Unused credits bank up to a plan-specific maximum. Banked credits reset every 6 months. Credits earned through referrals do not expire with your monthly reset but are subject to the maximum bank limit.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">5. Content Policy</h2>
              <p>You retain ownership of all content you create and schedule through SocialMate. By using the service, you grant SocialMate a limited license to process and transmit your content solely to provide the service. You are solely responsible for ensuring your content complies with the terms of each social media platform you post to.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">6. Prohibited Uses</h2>
              <p>You may not use SocialMate to post spam, illegal content, or content that violates any third-party platform's terms. Automated abuse of the platform, including excessive API calls or attempts to circumvent rate limits, is prohibited. Reselling access to SocialMate without authorization is not permitted.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">7. Payments and Refunds</h2>
              <p>Paid plans are billed monthly or annually. All payments are processed securely via Stripe. Refunds are available within 7 days of initial purchase for new subscribers. We do not offer prorated refunds for plan downgrades mid-cycle. Free plan users are never charged.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">8. Service Availability</h2>
              <p>We aim for maximum uptime but do not guarantee uninterrupted service. Scheduled maintenance, API changes from third-party platforms, or unexpected outages may temporarily affect availability. SocialMate is not liable for missed posts or lost engagement due to service interruptions.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">9. Termination</h2>
              <p>You may cancel your account at any time from your settings page. We reserve the right to suspend or terminate accounts that violate these terms, with or without notice. Upon termination, your data will be retained for 30 days before permanent deletion.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">10. Limitation of Liability</h2>
              <p>SocialMate is provided as-is. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the 3 months prior to the claim.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">11. Changes to Terms</h2>
              <p>We may update these terms periodically. Continued use of the service after changes constitutes acceptance of the new terms. We will notify active users of material changes via email or in-app notification.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">12. Contact</h2>
              <p>Questions about these terms can be directed to our support team via the contact form in Settings or by emailing support@socialmate.app.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}