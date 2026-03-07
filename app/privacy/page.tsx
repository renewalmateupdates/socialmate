import PublicLayout from '@/components/PublicLayout'

export default function Privacy() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mt-0.5">Last updated: March 2025</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
          {[
            { title: '1. What We Collect', body: 'We collect information you provide directly: your email address, display name, and any content you create within the platform. When you connect social accounts, we store OAuth tokens to enable posting on your behalf. We collect basic usage data to improve the service.' },
            { title: '2. How We Use Your Data', body: 'Your data is used solely to provide and improve SocialMate. This includes authenticating your account, scheduling and publishing posts, generating AI-powered content on request, and calculating analytics from your posting activity. We do not sell your data. We do not use your content to train AI models without explicit consent.' },
            { title: '3. Data Storage and Security', body: 'SocialMate is built on Supabase with row-level security (RLS) enabled on all tables. This means your data is cryptographically isolated — only your authenticated session can access your records. OAuth tokens for connected social platforms are encrypted at rest. We use HTTPS for all data transmission.' },
            { title: '4. Third-Party Services', body: 'We use the following third-party services: Supabase (database and authentication), Vercel (hosting), Stripe (payment processing), and Google Gemini (AI content generation). Each service operates under its own privacy policy. We only share data with these services to the extent necessary to provide the features they power.' },
            { title: '5. Social Platform Connections', body: 'When you connect a social media account, we receive OAuth tokens that allow us to post on your behalf. We store these tokens securely and use them only to execute scheduled posts. You can revoke access at any time from the Accounts page or directly from the social platform\'s settings.' },
            { title: '6. Cookies', body: 'We use session cookies for authentication purposes only. We do not use advertising cookies or third-party tracking cookies.' },
            { title: '7. Data Retention', body: 'Your data is retained for as long as your account is active. If you delete your account, your data is permanently removed within 30 days. You can export your post data and connected account information at any time from Settings.' },
            { title: '8. Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. To request a full data export or permanent deletion, contact us at support@socialmate.app. We will respond to all requests within 30 days.' },
            { title: '9. Children\'s Privacy', body: 'SocialMate is not directed at children under the age of 13. We do not knowingly collect personal information from children.' },
            { title: '10. Changes to This Policy', body: 'We may update this privacy policy as the service evolves. We will notify users of material changes via email or in-app notification at least 14 days before they take effect.' },
            { title: '11. Contact', body: 'Privacy questions or requests can be sent to support@socialmate.app.' },
          ].map((section, i) => (
            <section key={i}>
              <h2 className="text-base font-extrabold text-gray-900 mb-2">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}