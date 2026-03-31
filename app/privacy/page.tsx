import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — SocialMate',
  description: 'How SocialMate collects, uses, and protects your personal data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">← Back to SocialMate</Link>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Privacy Policy</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">Last updated: April 1, 2026 · Gilgamesh Enterprise LLC</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-12">Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it.</p>

        <div className="space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          {/* ── 1. Who We Are ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">1. Who We Are</h2>
            <p>SocialMate is a social media scheduling and content management platform operated by <span className="font-semibold">Gilgamesh Enterprise LLC</span>, a Wyoming limited liability company ("we", "us", "our"). Our Service is available at <span className="font-semibold">socialmate.studio</span> and associated domains and applications.</p>
            <p className="mt-2">For all privacy-related questions, requests, or concerns, contact our privacy team at: <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a></p>
            <p className="mt-2">We will respond to all privacy inquiries within <span className="font-semibold">30 days</span>.</p>
          </section>

          {/* ── 2. What We Collect ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">2. Information We Collect</h2>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2.1 Information You Provide Directly</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Email address and password when you create an account</li>
              <li>Display name and optional profile information</li>
              <li>Social media content, captions, hashtags, and media files you upload or schedule</li>
              <li>Payment information processed by Stripe (we never receive or store full card numbers — Stripe handles all payment data)</li>
              <li>Team member email addresses when you send workspace invitations</li>
              <li>Client workspace names and descriptions</li>
              <li>Communications you send to our support team</li>
              <li>Prompts and instructions you enter into AI features</li>
              <li>Newsletter opt-in preference (stored in Supabase user metadata)</li>
              <li>SM-Give donation history, if you choose to make in-app donations</li>
              <li>Affiliate program participation data, including referral activity and payout information</li>
            </ul>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2.2 Information Collected Automatically</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>OAuth access tokens and refresh tokens from social platforms you authorize</li>
              <li>Post engagement analytics (likes, comments, shares, impressions) fetched from connected platform APIs</li>
              <li>Feature usage data and interaction events (e.g., which tools you use, scheduling frequency)</li>
              <li>IP address and general geographic region (country/state) for security and fraud prevention</li>
              <li>Browser type and version, operating system, device type for compatibility and debugging</li>
              <li>Session identifiers and authentication tokens</li>
              <li>Error logs and diagnostic data when the Service encounters issues</li>
              <li>Vercel Analytics data: page views, navigation patterns (anonymized, no personal identifiers)</li>
            </ul>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2.3 Information from Third Parties</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Public profile information from social platforms you connect (name, username, avatar, follower count)</li>
              <li>Post performance metrics from connected platform APIs</li>
              <li>Billing and subscription status information from Stripe</li>
            </ul>
          </section>

          {/* ── 3. Legal Basis ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">3. Legal Basis for Processing (GDPR)</h2>
            <p>For users in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data on the following legal grounds:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="font-semibold">Contract Performance (Art. 6(1)(b) GDPR):</span> Processing necessary to provide the Service you signed up for — account management, scheduling posts, billing.</li>
              <li><span className="font-semibold">Legitimate Interests (Art. 6(1)(f) GDPR):</span> Security monitoring, fraud prevention, product improvement, analytics. We balance our interests against your rights and will not override them.</li>
              <li><span className="font-semibold">Legal Obligation (Art. 6(1)(c) GDPR):</span> Retaining billing records for tax and accounting compliance.</li>
              <li><span className="font-semibold">Consent (Art. 6(1)(a) GDPR):</span> Marketing communications (you can withdraw consent at any time).</li>
            </ul>
          </section>

          {/* ── 4. How We Use Your Data ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">4. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create, manage, and authenticate your account</li>
              <li>To publish and schedule posts to your connected social accounts on your behalf</li>
              <li>To process subscription payments and manage billing through Stripe</li>
              <li>To send transactional emails: account confirmations, team invitations, billing receipts, password resets</li>
              <li>To generate AI-powered content suggestions (your prompts and context are sent to Google Gemini API)</li>
              <li>To display post analytics and scheduling calendars</li>
              <li>To enforce our Terms of Service and prevent abuse</li>
              <li>To detect and prevent fraud, security incidents, and unauthorized access</li>
              <li>To diagnose technical problems and improve the reliability of the Service</li>
              <li>To analyze aggregate usage patterns and improve the Service (using anonymized data)</li>
              <li>To comply with legal obligations, including responding to valid legal requests</li>
              <li>To send product update announcements and newsletters (only with your consent; unsubscribe at any time)</li>
            </ul>
            <p className="mt-3 font-semibold text-gray-900 dark:text-gray-100">We do not sell your personal data to third parties. We do not use your content or prompts to train our own AI models.</p>
          </section>

          {/* ── 5. Third-Party Services ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">5. Third-Party Services and Data Sharing</h2>
            <p className="mb-3">We share your data with the following service providers solely to the extent necessary to operate the Service. Each provider has their own privacy policy:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Supabase</span> — database hosting and authentication. Data stored on AWS infrastructure in the United States. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">supabase.com/privacy</a></li>
              <li><span className="font-semibold">Stripe</span> — payment processing and subscription management. PCI DSS Level 1 certified. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">stripe.com/privacy</a></li>
              <li><span className="font-semibold">Google Gemini API</span> — AI content generation. Your prompts are transmitted to Google for processing. <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer" className="underline">ai.google.dev/terms</a></li>
              <li><span className="font-semibold">Resend</span> — transactional email delivery (account, billing, team invites). <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">resend.com/privacy</a></li>
              <li><span className="font-semibold">Vercel</span> — application hosting, CDN, and privacy-friendly analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">vercel.com/legal/privacy-policy</a></li>
              <li><span className="font-semibold">Inngest</span> — background job and scheduled task processing. <a href="https://inngest.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">inngest.com/privacy</a></li>
              <li><span className="font-semibold">Connected Social Platforms</span> — data is shared with platforms you explicitly authorize (Instagram, Facebook, YouTube, LinkedIn, Pinterest, Reddit, Bluesky, Discord, Mastodon, Telegram, and others). Each platform's own privacy policy governs their data use.</li>
            </ul>
            <p className="mt-3">We do not share your personal data with advertising networks, data brokers, or analytics companies beyond the privacy-friendly analytics described above. We may disclose your data if required by law, court order, or valid government request, or to protect the rights, property, or safety of Gilgamesh Enterprise LLC, our users, or the public.</p>
            <p className="mt-2">In the event of a business acquisition, merger, or sale of substantially all of our assets, your data may be transferred to the acquiring entity, subject to the same privacy protections. We will notify you via email or prominent in-app notice before such a transfer.</p>
          </section>

          {/* ── 6. Affiliate Program Data ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">6. Affiliate Program Data</h2>
            <p>If you participate in the SocialMate affiliate program, we collect and store additional data in order to administer the program and meet our legal obligations:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-semibold">Affiliate earnings and commission data</span> — referral counts, conversion events, commission amounts, and payout history</li>
              <li><span className="font-semibold">Tax documentation</span> — W-9 or equivalent forms required for IRS reporting. This data is stored securely and used solely for tax compliance purposes. It is never shared with other users or third parties except as required by law.</li>
              <li><span className="font-semibold">Stripe Connect account information</span> — Stripe processes all affiliate payouts. We share only the data necessary to facilitate payment. Please review <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">stripe.com/privacy</a> for details on how Stripe handles this data.</li>
            </ul>
            <p className="mt-3">Affiliate data is retained for 7 years to comply with tax reporting requirements, even after you leave the program or close your account.</p>
          </section>

          {/* ── 7. SM-Give Data ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">7. SM-Give Data</h2>
            <p>When you make a voluntary in-app donation through the SM-Give program, we store the donation amount and a reference to the platform session or feature that initiated the donation. This data is used for SM-Give reporting and charitable allocation purposes. It is not shared with third parties beyond what is necessary to process the transaction via Stripe.</p>
          </section>

          {/* ── 8. Advertising and Data Sales ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">8. Advertising and Data Sales Policy</h2>
            <p>SocialMate never sells user data to advertisers. We never display third-party advertisements within the platform. We do not share personal data with listing applicants or approved listing partners in Studio Stax (/studio-stax) beyond what you explicitly choose to share. Approved listings are curated directory entries on a dedicated page and do not receive access to user data, usage patterns, or any other information collected by the Service.</p>
          </section>

          {/* ── 9. Data Storage & Security ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">9. Data Storage and Security</h2>
            <p>Your data is stored on Supabase's infrastructure, hosted on AWS in the United States. We implement the following security measures:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Row Level Security (RLS) on all database tables — users can only access their own data</li>
              <li>OAuth tokens for connected platforms are stored encrypted at rest</li>
              <li>Passwords are hashed using bcrypt via Supabase Auth and are never stored in plain text</li>
              <li>All data in transit is encrypted via TLS 1.2 or higher</li>
              <li>Stripe handles all payment card data — we never receive or store card numbers</li>
              <li>Access to production systems is restricted to authorized personnel only</li>
            </ul>
            <p className="mt-3">Despite these measures, no method of internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security. In the event of a data breach that affects your rights and freedoms, we will notify you and relevant authorities as required by applicable law within 72 hours of becoming aware of the breach.</p>
          </section>

          {/* ── 10. International Transfers ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">10. International Data Transfers</h2>
            <p>Our Service is operated from the United States. If you are accessing the Service from outside the United States, your personal data will be transferred to, processed, and stored in the United States.</p>
            <p className="mt-2">For EEA, UK, and Swiss users: When we transfer your personal data to the United States, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission, and/or other applicable data transfer mechanisms, to ensure adequate protection of your data. By using the Service, you acknowledge that your data will be processed in the United States, where data protection laws may differ from those in your country.</p>
          </section>

          {/* ── 11. Data Retention ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">11. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide the Service. Specific retention periods:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Account data, posts, and content: retained while your account is active; deleted within 30 days of account deletion</li>
              <li>Connected platform OAuth tokens: deleted immediately upon platform disconnection or account deletion</li>
              <li>Billing and transaction records: retained for up to 7 years for tax and accounting compliance, even after account deletion</li>
              <li>Support communications: retained for 2 years</li>
              <li>Security logs and IP records: retained for 90 days</li>
              <li>Anonymized analytics data: may be retained indefinitely as it cannot identify you</li>
            </ul>
            <p className="mt-3">After the applicable retention period, data is securely deleted or anonymized.</p>
          </section>

          {/* ── 12. Your Rights ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">12. Your Privacy Rights</h2>
            <p className="mb-2">Depending on your location, you have the following rights regarding your personal data:</p>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">All Users:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><span className="font-semibold">Access:</span> Request a copy of the personal data we hold about you</li>
              <li><span className="font-semibold">Correction:</span> Request correction of inaccurate or incomplete data</li>
              <li><span className="font-semibold">Deletion:</span> Request deletion of your account and associated personal data (right to be forgotten)</li>
              <li><span className="font-semibold">Portability:</span> Request your data in a structured, machine-readable format</li>
              <li><span className="font-semibold">Opt-Out:</span> Unsubscribe from marketing emails at any time via the unsubscribe link</li>
            </ul>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">EEA / UK / Switzerland (GDPR / UK GDPR):</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><span className="font-semibold">Restriction:</span> Request that we restrict processing of your data in certain circumstances</li>
              <li><span className="font-semibold">Objection:</span> Object to processing based on legitimate interests</li>
              <li><span className="font-semibold">Withdraw Consent:</span> Withdraw consent at any time where processing is based on consent</li>
              <li><span className="font-semibold">Lodge a Complaint:</span> File a complaint with your local supervisory authority (e.g., ICO in the UK, your national DPA in the EEA)</li>
            </ul>

            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">California Residents (CCPA / CPRA):</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><span className="font-semibold">Know:</span> Right to know what personal information we collect, use, disclose, and sell</li>
              <li><span className="font-semibold">Delete:</span> Right to delete personal information we have collected from you</li>
              <li><span className="font-semibold">Correct:</span> Right to correct inaccurate personal information</li>
              <li><span className="font-semibold">Opt-Out of Sale:</span> We do not sell personal information. You do not need to opt out.</li>
              <li><span className="font-semibold">Non-Discrimination:</span> We will not discriminate against you for exercising your CCPA rights</li>
              <li>To submit a CCPA request, contact us at <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a> with "CCPA Request" in the subject line</li>
            </ul>

            <p className="mt-2">To exercise any of these rights, email <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a> with your request. We will respond within <span className="font-semibold">30 days</span>. We may need to verify your identity before processing certain requests. We will not charge a fee for reasonable requests.</p>
          </section>

          {/* ── 13. Account Deletion ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">13. Account Deletion and Data Removal</h2>
            <p>You can request deletion of your account and personal data at any time by:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Emailing <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a> with "Delete My Account" in the subject line, or</li>
              <li>Using the account deletion option in your account settings (if available)</li>
            </ul>
            <p className="mt-3">Upon receiving a valid deletion request, we will:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Immediately cancel any active subscription (no pro-rated refunds)</li>
              <li>Revoke all connected platform OAuth tokens</li>
              <li>Delete all posts, drafts, content, workspace data, and profile information within <span className="font-semibold">30 days</span></li>
              <li>Remove your email from all marketing lists immediately</li>
              <li>Retain billing records for up to 7 years as required by law</li>
            </ul>
            <p className="mt-3">Note: Deleted data cannot be recovered. Connected social platform posts that were already published will remain on those platforms and must be deleted directly on each platform.</p>
          </section>

          {/* ── 14. Cookies ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">14. Cookies and Tracking</h2>
            <p>SocialMate uses the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="font-semibold">Essential / Authentication Cookies:</span> Required for you to log in and use the Service. Cannot be disabled. These include session tokens managed by Supabase Auth.</li>
              <li><span className="font-semibold">Preference Cookies:</span> Remember your settings like dark/light mode.</li>
              <li><span className="font-semibold">Analytics Cookies (Vercel):</span> Privacy-friendly, cookieless analytics from Vercel. No personal identifiers, no cross-site tracking.</li>
            </ul>
            <p className="mt-3">We do <span className="font-semibold">not</span> use: advertising cookies, Google Analytics, Facebook Pixel, retargeting cookies, or any third-party tracking cookies.</p>
          </section>

          {/* ── 15. Children's Privacy ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">15. Children's Privacy</h2>
            <p>SocialMate is not directed at, designed for, or intended to be used by children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
            <p className="mt-2">Users between 13 and 17 years of age must have verifiable parental or legal guardian consent prior to using the Service. By using the Service, users in this age range represent that they have obtained such consent.</p>
            <p className="mt-2">If you believe we have inadvertently collected personal information from a child under 13, please contact us immediately at <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a>. We will promptly delete such information.</p>
          </section>

          {/* ── 16. Do Not Track ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">16. Do Not Track</h2>
            <p>Some browsers transmit "Do Not Track" signals. Because there is no consistent industry standard for how to respond to these signals, SocialMate does not currently alter its data collection practices based on Do Not Track signals. Our use of analytics is limited to the privacy-friendly Vercel Analytics described in Section 14.</p>
          </section>

          {/* ── 17. Changes ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">17. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Update the "Last updated" date at the top of this page</li>
              <li>Send a notification email to all registered users at least 30 days before changes take effect</li>
              <li>Display a prominent in-app notice for material changes</li>
            </ul>
            <p className="mt-3">Your continued use of the Service after the effective date of an updated Privacy Policy constitutes your acceptance of the revised policy. If you do not agree with the changes, you must stop using the Service and may request account deletion.</p>
            <p className="mt-2">We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data.</p>
          </section>

          {/* ── 18. Contact ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">18. Contact Us</h2>
            <p>For any privacy-related questions, concerns, or requests, please contact us:</p>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Gilgamesh Enterprise LLC</p>
              <p>Privacy Team</p>
              <p>Email: <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a></p>
              <p>Website: <span className="font-semibold">socialmate.studio</span></p>
              <p className="mt-1 text-xs text-gray-400">Wyoming, United States</p>
            </div>
            <p className="mt-3">We commit to responding to all privacy inquiries within 30 days. For urgent data breach concerns or requests relating to children's data, please mark your email "URGENT".</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2026 Gilgamesh Enterprise LLC. All rights reserved.</p>
          <Link href="/terms" className="text-xs font-semibold text-black dark:text-gray-100 hover:underline">Terms of Service →</Link>
        </div>
      </div>
    </div>
  )
}
