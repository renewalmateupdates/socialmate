import Link from 'next/link'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'

export const metadata = {
  title: 'Terms of Service — SocialMate',
  description: 'The terms and conditions governing your use of SocialMate.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">← Back to SocialMate</Link>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Terms of Service</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">Last updated: May 6, 2026 · Gilgamesh Enterprise LLC</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-12">Please read these Terms carefully before using SocialMate. By accessing or using the Service, you agree to be bound by these Terms.</p>

        <div className="space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

          {/* ── 1. Acceptance ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account, accessing, or using <span className="font-semibold">SocialMate</span> and its related services (collectively, the "Service"), you ("User", "you") agree to be legally bound by these Terms of Service ("Terms"), our <Link href="/privacy" className="font-semibold underline text-gray-900 dark:text-gray-100">Privacy Policy</Link>, and any additional policies incorporated herein. These Terms constitute a binding legal agreement between you and Gilgamesh Enterprise LLC, a Wyoming limited liability company ("Company", "we", "us", "our"). The name "SocialMate" refers to this Service in all contexts, including developer applications registered with third-party platforms such as TikTok, Meta, LinkedIn, and Google.</p>
            <p className="mt-2">If you do not agree to these Terms in their entirety, you must immediately cease all use of the Service and delete your account. Your continued use of the Service following any updates to these Terms constitutes acceptance of the revised Terms.</p>
            <p className="mt-2">If you are using the Service on behalf of a business or other legal entity, you represent that you have the authority to bind that entity to these Terms, and "you" shall refer to both you individually and that entity.</p>
          </section>

          {/* ── 2. Description ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">2. Description of Service</h2>
            <p>SocialMate is a cloud-based social media scheduling, content management, and AI-powered content creation platform operated at <span className="font-semibold">socialmate.studio</span> and associated domains and applications. The Service enables users to compose, schedule, and publish content to third-party social media platforms; access AI-powered content generation and editing tools; manage client workspaces and team members; view scheduling calendars and post analytics; and purchase additional AI credits and white-label licenses.</p>
            <p className="mt-2">The Service includes a Clips Studio feature that integrates with Twitch (via OAuth) and YouTube (via public RSS feed). The Twitch integration requires you to connect your Twitch account and grants SocialMate permission to read your channel's clips on your behalf. The YouTube integration requires only a public channel URL — no YouTube account connection or API credentials are required or stored. The Service also integrates with Twitch's app-level API to allow any user to search any public Twitch channel's clips without requiring account ownership of that channel.</p>
            <p className="mt-2">The Service depends on third-party platform APIs (Bluesky, Discord, Telegram, Mastodon, X/Twitter, Twitch, YouTube, TikTok, and others). We do not control those platforms and cannot guarantee continued API availability. Service features may be added, modified, or removed at any time. We will make reasonable efforts to notify users of material changes.</p>
            <p className="mt-2">The SocialMate application registered on the TikTok developer platform is named "SocialMate" and is operated solely by Gilgamesh Enterprise LLC. When you connect your TikTok account, SocialMate requests only the permissions necessary to publish content on your behalf (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">video.publish</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">video.upload</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">user.info.basic</code>). Your use of the TikTok integration is also subject to TikTok's Terms of Service.</p>
          </section>

          {/* ── 3. Eligibility & Account ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">3. Eligibility and Account Registration</h2>
            <p className="mb-2">To use the Service, you must meet the following requirements:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least <span className="font-semibold">13 years of age</span>. Users between 13 and 17 must have verifiable parental or guardian consent. By using the Service, you represent and warrant that you meet this age requirement.</li>
              <li>You must provide accurate, current, and complete registration information and keep it updated.</li>
              <li>You may not register more than one free account per individual. Multiple accounts created to circumvent plan limits will be terminated.</li>
              <li>You are solely responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</li>
              <li>You must immediately notify us of any unauthorized access to your account at <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a>.</li>
              <li>Accounts are non-transferable. You may not sell, trade, or assign your account to another party.</li>
            </ul>
          </section>

          {/* ── 4. Acceptable Use ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">4. Acceptable Use Policy</h2>
            <p className="mb-2">You agree to use the Service only for lawful purposes. You expressly agree <span className="font-semibold">not</span> to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Post, transmit, or distribute spam, unsolicited bulk messages, or engage in mass automated posting that violates the terms of any connected platform;</li>
              <li>Publish, upload, or distribute content that is unlawful, defamatory, libelous, fraudulent, harassing, threatening, abusive, hateful, obscene, or that violates any applicable law or regulation;</li>
              <li>Infringe upon any patent, trademark, trade secret, copyright, right of publicity, or other intellectual property or proprietary right of any party;</li>
              <li>Violate the terms of service, community guidelines, or acceptable use policies of any connected third-party social media platform;</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of any portion of the Service;</li>
              <li>Attempt to probe, scan, penetrate, or test the vulnerability of the Service or any related system without express written permission;</li>
              <li>Interfere with or disrupt the integrity or performance of the Service or its related infrastructure;</li>
              <li>Access or use the Service to build a competing product or service, or to benchmark the Service for competitive purposes;</li>
              <li>Use the Service to distribute malware, ransomware, spyware, or any malicious code;</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation with any person or entity;</li>
              <li>Circumvent any rate limits, access controls, or usage restrictions;</li>
              <li>Use the Service in any manner that could expose us to legal liability or harm our reputation.</li>
            </ul>
            <p className="mt-3">We reserve the right, at our sole discretion, to suspend or permanently terminate accounts that violate this Acceptable Use Policy, with or without notice, and without liability to you. Content that violates these standards may be removed immediately.</p>
          </section>

          {/* ── 5. Content Moderation ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">5. Content and Content Moderation</h2>
            <p><span className="font-semibold">Your Content:</span> You retain full ownership of all content you create, upload, or publish through the Service ("Your Content"). By submitting Your Content, you grant Gilgamesh Enterprise LLC a limited, non-exclusive, royalty-free, worldwide license to store, process, cache, transmit, and display Your Content solely to the extent necessary to provide the Service to you. This license terminates when you delete Your Content or close your account.</p>
            <p className="mt-2"><span className="font-semibold">Content Standards:</span> You are solely and exclusively responsible for Your Content. You represent and warrant that: (a) you own or have all necessary rights to Your Content; (b) Your Content does not infringe any third-party intellectual property rights; (c) Your Content complies with all applicable laws; and (d) Your Content will not cause harm to any person or entity.</p>
            <p className="mt-2"><span className="font-semibold">No Pre-Screening:</span> We do not review, monitor, or pre-screen content before it is published. However, we reserve the right (but not the obligation) to review, edit, or remove any content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable. Removal of content does not create any liability on our part.</p>
            <p className="mt-2"><span className="font-semibold">Prohibited Content:</span> The following content is strictly prohibited and will result in immediate account termination: child sexual abuse material (CSAM) or any content that exploits or endangers minors; content that incites, glorifies, or facilitates violence or terrorism; content that facilitates illegal activity; content that constitutes illegal discrimination based on protected characteristics.</p>
            <p className="mt-2"><span className="font-semibold">Reporting:</span> To report content that violates these Terms, contact <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a>.</p>
          </section>

          {/* ── 6. AI Features ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">6. AI-Powered Features</h2>
            <p>SocialMate uses the Google Gemini API to power content generation, caption writing, hashtag suggestions, and other AI-assisted features (collectively, "AI Features"). By using AI Features, you acknowledge and agree to the following:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="font-semibold">No Guarantee of Accuracy or Originality:</span> AI-generated content is provided as suggestions only. We make no representations or warranties regarding the accuracy, completeness, originality, copyright status, or appropriateness of any AI-generated output. AI models can produce inaccurate, offensive, or legally problematic content.</li>
              <li><span className="font-semibold">Your Responsibility:</span> You are solely responsible for reviewing, editing, and approving all AI-generated content before publishing. Publishing AI-generated content without review is done entirely at your own risk.</li>
              <li><span className="font-semibold">No Copyright Assurance:</span> We do not guarantee that AI-generated content is free from third-party intellectual property claims. You assume all risk related to the use of AI-generated content.</li>
              <li><span className="font-semibold">Data Processing:</span> When you use AI Features, your prompts and content context are transmitted to Google's API for processing. Please review Google's privacy policy at ai.google.dev regarding how they handle this data.</li>
              <li><span className="font-semibold">AI Credit System:</span> AI Features consume credits from your monthly allotment or purchased credit packs. Monthly credits reset at the start of each billing cycle and do not roll over. Purchased credit packs do not expire. Credits are consumed upon generation, not upon publishing.</li>
              <li><span className="font-semibold">No Training:</span> We do not use your content or prompts to train our own AI models.</li>
            </ul>
          </section>

          {/* ── 7. Subscriptions & Billing ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">7. Subscriptions and Billing</h2>
            <p className="mb-2">SocialMate offers the following subscription tiers, billed through Stripe:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><span className="font-semibold">Free Plan:</span> No charge, subject to usage and feature limits as described on our pricing page.</li>
              <li><span className="font-semibold">Pro Plan:</span> $5/month or $55/year, billed in advance.</li>
              <li><span className="font-semibold">Agency Plan:</span> $20/month or $209/year, billed in advance.</li>
              <li><span className="font-semibold">White Label Basic:</span> Additional monthly fee, billed in advance.</li>
              <li><span className="font-semibold">White Label Pro:</span> Additional monthly fee, billed in advance.</li>
              <li><span className="font-semibold">AI Credit Packs:</span> One-time purchases (100, 300, 750, or 2,000 credits), non-refundable.</li>
            </ul>
            <p><span className="font-semibold">Automatic Renewal:</span> All paid subscriptions automatically renew at the end of each billing period at the then-current rate unless cancelled before the renewal date. By providing payment information, you authorize us to charge your payment method for all fees incurred.</p>
            <p className="mt-2"><span className="font-semibold">Cancellation:</span> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the end of the period for which you have paid. No pro-rated refunds are issued for unused portions of a billing period.</p>
            <p className="mt-2"><span className="font-semibold">Price Changes:</span> We reserve the right to modify subscription pricing at any time. Existing subscribers will receive at least 30 days advance notice of price increases via email. Continued use after a price change constitutes acceptance of the new pricing.</p>
            <p className="mt-2"><span className="font-semibold">Taxes:</span> Prices displayed may not include applicable taxes. You are responsible for all applicable taxes and duties. We use Stripe Tax to calculate and collect taxes where required by law.</p>
            <p className="mt-2"><span className="font-semibold">Failed Payments:</span> If a payment fails, we may suspend your account and downgrade your plan to Free until payment is resolved. We are not responsible for any data loss or publishing failures resulting from a suspended account.</p>
          </section>

          {/* ── 8. Refund Policy ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">8. Refund Policy</h2>
            <p><span className="font-semibold">Subscriptions:</span> Subscription payments are generally non-refundable. We may, at our sole discretion, issue a refund within <span className="font-semibold">7 days of the initial purchase</span> if the Service is not functioning as materially described and the issue cannot be resolved within a reasonable time. Refunds will not be issued for: dissatisfaction with AI-generated content quality; posts that fail to publish due to third-party platform API errors; downtime of connected third-party platforms; or change of mind after purchase.</p>
            <p className="mt-2"><span className="font-semibold">AI Credit Packs:</span> All AI credit pack purchases are <span className="font-semibold">final and non-refundable</span> once the order is confirmed, regardless of whether credits have been used.</p>
            <p className="mt-2"><span className="font-semibold">Annual Plans:</span> Annual subscription payments are non-refundable. You will retain access to the paid plan for the full annual term regardless of cancellation.</p>
            <p className="mt-2">To request a refund consideration, contact <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a> with your account email and Stripe transaction ID. We will respond within 5 business days.</p>
          </section>

          {/* ── 9. SM-Give ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">9. SM-Give Charitable Program</h2>
            <p>SocialMate operates SM-Give, a voluntary charitable contribution program. 2% of all subscription revenue, 10% of all in-app donations received through the platform's story/donation page, and 75% of unclaimed affiliate commissions (held more than 90 days) are directed to charitable causes selected by Gilgamesh Enterprise LLC. Users who make in-app donations do so voluntarily. SM-Give proceeds are not tax-deductible by the user through SocialMate. No portion of subscription fees are individually earmarked for charity; the 2% contribution is made by Gilgamesh Enterprise LLC from its own revenue share.</p>
          </section>

          {/* ── 10. Connected Platforms ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">10. Connected Third-Party Platforms</h2>
            <p>By connecting a social media account to SocialMate, you authorize us to access your account and perform actions on your behalf within the scope of the permissions you explicitly grant (e.g., creating posts, reading analytics). You represent that you have the right and authority to grant this access.</p>
            <p className="mt-2 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-300 font-medium">⚠️ Automated and scheduled posting may trigger spam detection on some platforms. SocialMate is not responsible for account suspensions or bans resulting from your posting activity.</p>
            <p className="mt-2">We are not responsible for: (a) actions taken on connected platforms that result from your instructions or scheduled posts; (b) content that violates a platform's terms of service, even if it does not violate ours; (c) the loss of access, suspension, or banning of your social media accounts by third-party platforms; (d) disruptions in platform availability due to third-party API changes, outages, or policy changes.</p>
            <p className="mt-2">Platform integrations may be discontinued at any time due to changes in third-party API policies or terms. We will make reasonable efforts to notify users of planned platform discontinuations with reasonable advance notice.</p>
            <p className="mt-2">You can disconnect any platform at any time from your account settings. Upon disconnection, we will cease accessing that platform on your behalf and will delete stored OAuth tokens for that platform.</p>
          </section>

          {/* ── 11. Affiliate Program ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">11. Affiliate &amp; Partner Program</h2>
            <p>SocialMate operates an affiliate program through which approved partners ("Affiliates") earn commission for referring paying customers. Affiliates must complete onboarding including W-9 or equivalent tax documentation. Commissions are subject to a 30-day hold period before becoming eligible for payout. Gilgamesh Enterprise LLC reserves the right to terminate affiliate relationships, withhold commissions resulting from fraudulent referrals, and modify commission rates with 30 days' notice. Unclaimed commissions older than 90 days may be redirected to SM-Give. Affiliates are independent contractors, not employees.</p>
            <p className="mt-3">Additional program details:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Base commission: 30% recurring on referred subscriber payments</li>
              <li>Scaled commission: 40% recurring at 100+ active referred subscribers</li>
              <li>Affiliates must maintain an active paid SocialMate subscription to be eligible</li>
              <li>Commissions are forfeited on cancelled, refunded, or charged-back transactions</li>
            </ul>
            <p className="mt-3">Prohibited affiliate conduct includes: self-referrals, cookie stuffing, misleading advertising, spam, or any deceptive marketing practices. We reserve the right to audit affiliate activity and to withhold or reverse commissions where fraud or abuse is suspected. Commission fraud will result in immediate termination and permanent forfeiture of all pending and future commissions.</p>
          </section>

          {/* ── 12. Curated Listings ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">12. Curated Listings</h2>
            <p>SocialMate offers a curated directory called <span className="font-semibold">Studio Stax</span> at <span className="font-semibold">socialmate.studio/studio-stax</span>. Listings are available to founder-approved tools and services. Approval is at the sole discretion of Gilgamesh Enterprise LLC. No refunds are issued for rejected applications (there is no charge until after approval). Listing fees are non-refundable once a listing goes live. Listings may be removed for any reason including violation of the "by the people, for the people" philosophy or any of these Terms. Rankings within the directory are determined by SM-Give donation amounts and are not influenced by additional payment.</p>
          </section>

          {/* ── 13. No Advertisements ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">13. No Advertisements</h2>
            <p>SocialMate does not and will never display third-party advertisements within the platform. The Company will not sell user data to advertisers. The Company will not sell SocialMate to any third party without discontinuing the service first. Studio Stax (/studio-stax) is a separate paid feature and do not constitute advertising as they appear only on a dedicated directory page, not within the scheduling or analytics features of the app.</p>
          </section>

          {/* ── 14. Newsletter ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">14. Newsletter and Communications</h2>
            <p>By creating an account, you may opt in to receive the SocialMate monthly newsletter, which covers product updates, new features, and creator tips. You can opt out at any time by clicking the unsubscribe link in any newsletter email. Transactional emails related to your account (billing receipts, password resets, post scheduling failures, etc.) cannot be unsubscribed from as they are required for service operation.</p>
          </section>

          {/* ── 15. DMCA ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">15. Digital Millennium Copyright Act (DMCA)</h2>
            <p>Gilgamesh Enterprise LLC respects intellectual property rights and expects users to do the same. In accordance with the DMCA (17 U.S.C. § 512), we will respond to valid notices of alleged copyright infringement.</p>
            <p className="mt-2"><span className="font-semibold">To submit a DMCA takedown notice, send a written notice to our designated agent containing:</span></p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your physical or electronic signature;</li>
              <li>Identification of the copyrighted work claimed to have been infringed;</li>
              <li>Identification of the infringing material with sufficient detail for us to locate it;</li>
              <li>Your contact information (name, address, phone, email);</li>
              <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law;</li>
              <li>A statement, made under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
            </ul>
            <p className="mt-3"><span className="font-semibold">DMCA Agent:</span><br />
            Gilgamesh Enterprise LLC<br />
            Attn: DMCA Agent<br />
            Email: <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a></p>
            <p className="mt-3"><span className="font-semibold">Counter-Notices:</span> If you believe your content was wrongly removed, you may submit a counter-notice containing the required information under 17 U.S.C. § 512(g)(3). We will reinstate the content within 10-14 business days unless the original complainant files a court action.</p>
            <p className="mt-2"><span className="font-semibold">Repeat Infringers:</span> We maintain a policy of terminating the accounts of users who are determined to be repeat copyright infringers.</p>
          </section>

          {/* ── 16. Intellectual Property ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">16. Intellectual Property</h2>
            <p>The Service, including all software, designs, text, graphics, logos, icons, and other materials (excluding Your Content), is the exclusive property of Gilgamesh Enterprise LLC or its licensors and is protected by copyright, trademark, and other intellectual property laws.</p>
            <p className="mt-2">We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal or business purposes in accordance with these Terms. This license does not include: selling, reselling, or commercially exploiting the Service; modifying, copying, or creating derivative works of the Service; using data mining or similar data gathering tools on the Service; framing or mirroring any portion of the Service without our consent.</p>
            <p className="mt-2">The "SocialMate" name, logo, and related marks are trademarks of Gilgamesh Enterprise LLC. You may not use our trademarks without prior written permission.</p>
          </section>

          {/* ── 17. Indemnification ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">17. Indemnification</h2>
            <p>To the fullest extent permitted by applicable law, you agree to defend, indemnify, and hold harmless Gilgamesh Enterprise LLC, its officers, directors, members, employees, contractors, agents, licensors, and service providers from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to reasonable attorney's fees) arising from or related to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your use of or access to the Service;</li>
              <li>Your violation of any provision of these Terms;</li>
              <li>Your violation of any third-party right, including any intellectual property, privacy, or publicity right;</li>
              <li>Any content you submit, post, transmit, or publish through the Service;</li>
              <li>Your violation of any applicable law or regulation;</li>
              <li>Any claim that Your Content caused damage to a third party.</li>
            </ul>
            <p className="mt-3">We reserve the right, at our own expense, to assume exclusive defense and control of any matter subject to indemnification by you. You agree to cooperate with our defense of such claims.</p>
          </section>

          {/* ── 18. Disclaimers ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">18. Disclaimers and Warranties</h2>
            <p className="uppercase font-semibold">THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.</p>
            <p className="mt-3">WITHOUT LIMITING THE FOREGOING, GILGAMESH ENTERPRISE LLC SPECIFICALLY DISCLAIMS ANY WARRANTY THAT:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 uppercase font-medium">
              <li>THE SERVICE WILL MEET YOUR REQUIREMENTS OR BE AVAILABLE UNINTERRUPTED, SECURE, OR ERROR-FREE;</li>
              <li>POSTS WILL BE PUBLISHED AT EXACT SCHEDULED TIMES OR WILL BE ACCEPTED BY THIRD-PARTY PLATFORMS;</li>
              <li>AI-GENERATED CONTENT WILL BE ACCURATE, ORIGINAL, OR FREE FROM INTELLECTUAL PROPERTY CLAIMS;</li>
              <li>ANY ERRORS OR DEFECTS IN THE SERVICE WILL BE CORRECTED;</li>
              <li>THE SERVICE OR ITS SERVERS ARE FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.</li>
            </ul>
            <p className="mt-3">Some jurisdictions do not allow the exclusion of certain warranties. In such jurisdictions, the above exclusions apply to the maximum extent permitted by law.</p>
          </section>

          {/* ── 19. Limitation of Liability ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">19. Limitation of Liability</h2>
            <p className="uppercase font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL GILGAMESH ENTERPRISE LLC, ITS MEMBERS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 uppercase font-medium">
              <li>LOSS OF PROFITS, REVENUE, OR BUSINESS;</li>
              <li>LOSS OF DATA, POSTS, OR CONTENT;</li>
              <li>LOSS OF GOODWILL OR REPUTATION;</li>
              <li>COST OF SUBSTITUTE SERVICES;</li>
              <li>DAMAGES ARISING FROM THIRD-PARTY PLATFORM API FAILURES, ACCOUNT BANS, OR POLICY CHANGES;</li>
              <li>ANY UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA.</li>
            </ul>
            <p className="mt-3 font-semibold uppercase">IN NO EVENT SHALL OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00).</p>
            <p className="mt-3">The limitations in this section apply regardless of the form of action, whether based in contract, tort, negligence, strict liability, or otherwise, even if we have been advised of the possibility of such damages. Some jurisdictions do not allow the limitation or exclusion of certain damages; in such jurisdictions, our liability is limited to the maximum extent permitted by law.</p>
          </section>

          {/* ── 20. Arbitration ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">20. Binding Arbitration and Class Action Waiver</h2>
            <p className="font-semibold text-gray-900 dark:text-gray-100">PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT AND TO HAVE A JURY TRIAL.</p>

            <p className="mt-3"><span className="font-semibold">Informal Resolution First:</span> Before initiating any arbitration or legal proceeding, you agree to give us at least <span className="font-semibold">60 days written notice</span> of your dispute by emailing <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a> with the subject line "Dispute Notice." We will attempt to resolve the dispute informally during this period.</p>

            <p className="mt-3"><span className="font-semibold">Agreement to Arbitrate:</span> If the dispute is not resolved informally, you and Gilgamesh Enterprise LLC agree that any dispute, claim, or controversy arising out of or relating to these Terms or your use of the Service shall be resolved exclusively by final and binding arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules, except as set forth below. The arbitration shall be conducted on an individual basis and shall not be consolidated with any other arbitration proceeding.</p>

            <p className="mt-3"><span className="font-semibold">CLASS ACTION WAIVER:</span> YOU AND GILGAMESH ENTERPRISE LLC EACH WAIVE THE RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS-WIDE ARBITRATION, PRIVATE ATTORNEY GENERAL ACTION, OR ANY OTHER REPRESENTATIVE PROCEEDING OF ANY KIND. ALL CLAIMS MUST BE BROUGHT IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. IF A COURT DETERMINES THAT THIS CLASS ACTION WAIVER IS UNENFORCEABLE FOR ANY CLAIM, THEN THAT CLAIM SHALL BE SEVERED FROM ARBITRATION AND HEARD IN COURT, AND ALL OTHER CLAIMS SHALL REMAIN IN ARBITRATION.</p>

            <p className="mt-3"><span className="font-semibold">JURY TRIAL WAIVER:</span> YOU AND GILGAMESH ENTERPRISE LLC EACH WAIVE ANY RIGHT TO A JURY TRIAL FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE.</p>

            <p className="mt-3"><span className="font-semibold">Exceptions:</span> Either party may bring an individual claim in small claims court if the claim qualifies. Either party may also seek emergency injunctive or equitable relief in any court of competent jurisdiction to prevent irreparable harm pending arbitration.</p>

            <p className="mt-3"><span className="font-semibold">Arbitration Location:</span> The arbitration will be conducted remotely (via videoconference or telephone) or in Wyoming, at your option for claims under $10,000.</p>

            <p className="mt-3"><span className="font-semibold">Costs:</span> AAA filing fees will be governed by AAA's Consumer Arbitration Rules. We will pay AAA administrative fees for claims under $10,000 that are not frivolous.</p>

            <p className="mt-3"><span className="font-semibold">Opt-Out Right:</span> You may opt out of this arbitration agreement by sending written notice to <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a> with the subject line "Arbitration Opt-Out" within <span className="font-semibold">30 days of first creating your account</span>. Opting out does not affect any other provisions of these Terms.</p>

            <p className="mt-3"><span className="font-semibold">Severability:</span> If any portion of this arbitration agreement is found unenforceable, that portion shall be severed and the remainder shall continue in full force and effect.</p>
          </section>

          {/* ── 21. Termination ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">21. Termination</h2>
            <p>These Terms are effective until terminated by either party. You may terminate your account at any time by contacting us or through your account settings. We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to: violation of these Terms; fraudulent, abusive, or illegal activity; extended account inactivity (defined as 12+ consecutive months of no login); or at our sole discretion.</p>
            <p className="mt-2">Upon termination: (a) your right to use the Service immediately ceases; (b) all outstanding subscription charges become immediately due; (c) earned but unpaid affiliate commissions within the hold period may be forfeited; (d) your data will be handled per our Privacy Policy.</p>
            <p className="mt-2">Provisions that by their nature should survive termination shall survive, including Sections 5 (Content), 16 (Intellectual Property), 17 (Indemnification), 18 (Disclaimers), 19 (Limitation of Liability), 20 (Arbitration), and 24 (General).</p>
          </section>

          {/* ── 22. White Label ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">22. White Label Licenses</h2>
            <p>White Label subscription tiers grant you the right to present SocialMate under your own brand to your clients. White label licenses are non-exclusive and non-transferable. You may not sublicense white label rights to third parties. You remain responsible for ensuring your clients comply with these Terms. We reserve the right to revoke white label access for any Terms violation.</p>
            <p className="mt-2">You may not use a white label license to create a product that directly competes with SocialMate or to resell access to the underlying SocialMate platform as a standalone product.</p>
          </section>

          {/* ── 23. Governing Law ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">23. Governing Law</h2>
            <p>These Terms and any dispute arising hereunder shall be governed by and construed in accordance with the laws of the <span className="font-semibold">State of Wyoming, United States</span>, without regard to its conflict of law provisions. To the extent court proceedings are permitted under these Terms, you consent to the exclusive jurisdiction and venue of the state and federal courts located in Wyoming.</p>
          </section>

          {/* ── 24. General ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">24. General Provisions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Entire Agreement:</span> These Terms, together with the Privacy Policy and any supplemental policies, constitute the entire agreement between you and Gilgamesh Enterprise LLC regarding the Service.</li>
              <li><span className="font-semibold">Severability:</span> If any provision of these Terms is held to be invalid or unenforceable, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</li>
              <li><span className="font-semibold">No Waiver:</span> Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.</li>
              <li><span className="font-semibold">Assignment:</span> You may not assign these Terms or any rights hereunder without our prior written consent. We may assign these Terms without restriction in connection with a merger, acquisition, or sale of substantially all of our assets.</li>
              <li><span className="font-semibold">Force Majeure:</span> We shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including natural disasters, power outages, internet disruptions, or third-party platform failures.</li>
              <li><span className="font-semibold">Changes to Terms:</span> We may update these Terms at any time. Material changes will be communicated via email or prominent in-app notice at least 30 days before taking effect. Non-material changes may take effect immediately upon posting.</li>
              <li><span className="font-semibold">Contact:</span> For questions about these Terms, contact <a href="mailto:socialmate.updates@gmail.com" className="font-semibold underline text-gray-900 dark:text-gray-100">socialmate.updates@gmail.com</a>. Gilgamesh Enterprise LLC · Wyoming, United States.</li>
            </ul>
          </section>

        </div>

      </div>
      <PublicFooter />
    </div>
  )
}
