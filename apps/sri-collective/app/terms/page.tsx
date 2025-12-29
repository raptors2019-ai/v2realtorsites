import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Sri Collective Group',
  description: 'Terms and conditions for using Sri Collective Group real estate services and website.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-secondary">Terms of Service</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Terms of Service
            </h1>
            <p className="text-text-secondary">
              Last Updated: December 28, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="space-y-8 text-text-secondary">

              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Introduction</h2>
                <p className="mb-4">
                  Welcome to Sri Collective Group. These Terms of Service ("Terms") govern your access to and use of our website, services, and real estate platform (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
                </p>
                <p>
                  If you do not agree to these Terms, please do not use our Services.
                </p>
              </div>

              {/* Definitions */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Definitions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"We," "our," or "us"</strong> refers to Sri Collective Group</li>
                  <li><strong>"You" or "user"</strong> refers to any individual or entity using our Services</li>
                  <li><strong>"Website"</strong> refers to sricollectivegroup.com and all associated subdomains</li>
                  <li><strong>"Services"</strong> includes our website, real estate brokerage services, and any related offerings</li>
                  <li><strong>"Content"</strong> includes property listings, images, text, videos, and all materials on our platform</li>
                </ul>
              </div>

              {/* Use of Services */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Use of Services</h2>

                <h3 className="text-xl font-semibold text-secondary mb-3">Eligibility</h3>
                <p className="mb-4">
                  You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Permitted Use</h3>
                <p className="mb-3">You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Use the Services in any way that violates applicable laws or regulations</li>
                  <li>Impersonate any person or entity or falsely represent your affiliation</li>
                  <li>Interfere with or disrupt the Services or servers connected to the Services</li>
                  <li>Use automated systems (bots, scrapers) to access the Services without permission</li>
                  <li>Transmit viruses, malware, or other harmful code</li>
                  <li>Copy, reproduce, or distribute our Content without authorization</li>
                  <li>Use the Services to harass, abuse, or harm others</li>
                  <li>Attempt to gain unauthorized access to our systems or user accounts</li>
                </ul>

                <h3 className="text-xl font-semibold text-secondary mb-3">Account Registration</h3>
                <p>
                  Certain features may require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>

              {/* Real Estate Services */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Real Estate Services</h2>

                <h3 className="text-xl font-semibold text-secondary mb-3">Brokerage Relationship</h3>
                <p className="mb-4">
                  Sri Collective Group operates as a licensed real estate brokerage in Ontario, Canada. Our agents are registered with the Real Estate Council of Ontario (RECO). Any real estate services provided are subject to applicable real estate laws and regulations.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">No Guarantee of Results</h3>
                <p className="mb-4">
                  While we strive to provide excellent service, we do not guarantee the sale or purchase of any property, specific pricing, or timeframes. Real estate transactions are subject to market conditions, buyer/seller decisions, and other factors beyond our control.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Property Information</h3>
                <p>
                  Property listings and information are provided for informational purposes only and may contain errors or be outdated. We make reasonable efforts to ensure accuracy but do not guarantee the completeness or accuracy of property information. You should independently verify all property details before making decisions.
                </p>
              </div>

              {/* Intellectual Property */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Intellectual Property Rights</h2>
                <p className="mb-3">
                  All Content on our website, including but not limited to text, graphics, logos, images, videos, and software, is owned by Sri Collective Group or our licensors and is protected by Canadian and international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="mb-3">
                  You may view, download, and print Content from our website for personal, non-commercial use only. You may not:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Modify, reproduce, or distribute Content without our written permission</li>
                  <li>Use Content for commercial purposes</li>
                  <li>Remove copyright, trademark, or other proprietary notices</li>
                  <li>Create derivative works from our Content</li>
                </ul>
                <p>
                  Property listing photos are owned by the respective photographers or listing agents and may not be used without permission.
                </p>
              </div>

              {/* User-Generated Content */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">User-Generated Content</h2>
                <p className="mb-3">
                  If you submit reviews, comments, or other content ("User Content") to our Services, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of operating and promoting our Services.
                </p>
                <p className="mb-3">
                  You represent and warrant that:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>You own or have the rights to submit the User Content</li>
                  <li>Your User Content does not violate any third-party rights</li>
                  <li>Your User Content does not contain defamatory, offensive, or illegal material</li>
                </ul>
                <p>
                  We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable.
                </p>
              </div>

              {/* Disclaimers */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Disclaimers and Limitations of Liability</h2>

                <h3 className="text-xl font-semibold text-secondary mb-3">No Warranties</h3>
                <p className="mb-4">
                  Our Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that our Services will be uninterrupted, error-free, or secure.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Limitation of Liability</h3>
                <p className="mb-3">
                  To the fullest extent permitted by law, Sri Collective Group and its agents, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Loss of data or information</li>
                  <li>Property damage or personal injury</li>
                  <li>Errors or omissions in property listings or information</li>
                  <li>Failed real estate transactions</li>
                </ul>
                <p className="mt-4">
                  Our total liability to you for any claims arising from your use of our Services shall not exceed the amount you have paid us for Services in the past 12 months (or $100 CAD if you have not paid us anything).
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Third-Party Services</h3>
                <p>
                  Our Services may contain links to third-party websites, mortgage lenders, home inspectors, and other service providers. We are not responsible for the content, policies, or practices of these third parties. Your interactions with third parties are solely between you and them.
                </p>
              </div>

              {/* Indemnification */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless Sri Collective Group and its agents, employees, and affiliates from any claims, damages, liabilities, costs, and expenses (including reasonable attorney fees) arising from:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Your use of our Services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Any User Content you submit</li>
                </ul>
              </div>

              {/* Privacy */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Privacy</h2>
                <p>
                  Your use of our Services is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information. By using our Services, you consent to our privacy practices as described in the Privacy Policy.
                </p>
              </div>

              {/* Communications */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Electronic Communications</h2>
                <p className="mb-3">
                  By using our Services, you consent to receive electronic communications from us, including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Service-related emails (transaction updates, account notifications)</li>
                  <li>Marketing emails (property listings, market updates, newsletters)</li>
                  <li>SMS/text messages (if you opt-in)</li>
                </ul>
                <p>
                  You may opt-out of marketing communications at any time by clicking "unsubscribe" in our emails or contacting us directly. Please note that you cannot opt-out of service-related communications.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3 mt-6">CASL Compliance</h3>
                <p>
                  We comply with Canada's Anti-Spam Legislation (CASL). We will only send you commercial electronic messages if:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>You have provided express consent (e.g., opted into our mailing list)</li>
                  <li>We have an existing business relationship with you</li>
                  <li>The message falls under an exception to CASL (e.g., inquiry responses)</li>
                </ul>
              </div>

              {/* Dispute Resolution */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Dispute Resolution</h2>

                <h3 className="text-xl font-semibold text-secondary mb-3">Governing Law</h3>
                <p className="mb-4">
                  These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Disputes with Our Services</h3>
                <p className="mb-4">
                  If you have a dispute with us, please contact us first at info@sricollectivegroup.com to attempt to resolve the matter informally.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Real Estate Disputes</h3>
                <p>
                  Disputes arising from real estate transactions may be subject to mediation or arbitration as outlined in the applicable listing or purchase agreement. As licensed real estate professionals, we are also subject to the jurisdiction of the Real Estate Council of Ontario (RECO).
                </p>
              </div>

              {/* Termination */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Termination</h2>
                <p className="mb-3">
                  We reserve the right to suspend or terminate your access to our Services at any time, with or without cause, and with or without notice, for any reason including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Violation of these Terms</li>
                  <li>Suspected fraudulent or illegal activity</li>
                  <li>Extended periods of inactivity</li>
                  <li>At your request</li>
                </ul>
                <p>
                  Upon termination, your right to use the Services will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property rights, disclaimers, and limitations of liability.
                </p>
              </div>

              {/* Changes to Terms */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. The updated version will be indicated by the "Last Updated" date at the top of this page. Material changes will be communicated via email or a prominent notice on our website. Your continued use of our Services after changes take effect constitutes acceptance of the revised Terms.
                </p>
              </div>

              {/* General Provisions */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">General Provisions</h2>

                <h3 className="text-xl font-semibold text-secondary mb-3">Entire Agreement</h3>
                <p className="mb-4">
                  These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute the entire agreement between you and Sri Collective Group regarding the use of our Services.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Severability</h3>
                <p className="mb-4">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Waiver</h3>
                <p className="mb-4">
                  Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
                </p>

                <h3 className="text-xl font-semibold text-secondary mb-3">Assignment</h3>
                <p>
                  You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Contact Us</h2>
                <p className="mb-3">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-cream p-6 rounded-lg">
                  <p className="font-semibold text-secondary mb-2">Sri Collective Group</p>
                  <p>Email: info@sricollectivegroup.com</p>
                  <p>Phone: +1 (416) 786-0431</p>
                  <p>Address: Greater Toronto Area, Ontario, Canada</p>
                </div>
              </div>

              {/* Acknowledgment */}
              <div className="bg-primary/5 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-semibold text-secondary mb-3">Acknowledgment</h3>
                <p>
                  By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
