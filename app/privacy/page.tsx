'use client'
import Sidebar from '@/components/Sidebar'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-gray-400 mt-0.5">Last updated: March 2025</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6 text-sm text-gray-600 leading-relaxed">

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">1. What We Collect</h2>
              <p>We collect information you provide directly: your email address, display name, and any content you create within the platform. When you connect social accounts, we store OAuth tokens to enable posting on your behalf. We collect basic usage data to improve the service, including pages visited and features used.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">2. How We Use Your Data</h2>
              <p>Your data is used solely to provide and improve SocialMate. This includes authenticating your account, scheduling and publishing posts to connected platforms, generating AI-powered content on request, and calculating analytics from your posting activity. We do not sell your data. We do not use your content to train AI models without explicit consent.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">3. Data Storage and Security</h2>
              <p>SocialMate is built on Supabase with row-level security (RLS) enabled on all tables. This means your data is cryptographically isolated — only your authenticated session can access your records. OAuth tokens for connected social platforms are encrypted at rest. We use HTTPS for all data transmission.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">4. Third-Party Services</h2>
              <p>We use the following third-party services to operate SocialMate: Supabase (database and authentication), Vercel (hosting), Stripe (payment processing), and Google Gemini (AI content generation). Each service operates under its own privacy policy. We only share data with these services to the extent necessary to provide the features they power.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">5. Social Platform Connections</h2>
              <p>When you connect a social media account, we receive OAuth tokens that allow us to post on your behalf. We store these tokens securely and use them only to execute scheduled posts. You can revoke access at any time from the Accounts page or directly from the social platform's settings. Revoking access does not delete your SocialMate account or data.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">6. Cookies</h2>
              <p>We use session cookies for authentication purposes only. We do not use advertising cookies or third-party tracking cookies. Analytics data is collected in aggregate and not tied to individual identifiable users unless you are logged in.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">7. Data Retention</h2>
              <p>Your data is retained for as long as your account is active. If you delete your account, your data is permanently removed within 30 days. Backups may retain data for up to 90 days after deletion. You can export your post data and connected account information at any time from Settings.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">8. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data at any time. You can update your profile information in Settings. To request a full data export or permanent deletion, contact us at support@socialmate.app. We will respond to all requests within 30 days.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">9. Children's Privacy</h2>
              <p>SocialMate is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has created an account, please contact us and we will promptly delete the account and associated data.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">10. Changes to This Policy</h2>
              <p>We may update this privacy policy as the service evolves. We will notify users of material changes via email or in-app notification at least 14 days before they take effect. Continued use of the service after changes constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">11. Contact</h2>
              <p>Privacy questions or requests can be sent to support@socialmate.app. We take privacy seriously and will respond promptly to all inquiries.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}