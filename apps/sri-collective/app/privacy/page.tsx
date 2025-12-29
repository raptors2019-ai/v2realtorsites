import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Sri Collective Group',
  description: 'Learn how Sri Collective Group collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-secondary">Privacy Policy</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Privacy Policy
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
                  Sri Collective Group ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or use our real estate services.
                </p>
                <p>
                  This policy is designed to comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable Canadian privacy laws.
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Information We Collect</h2>

                <h3 className="text-xl font-semibold text-secondary mb-3">Personal Information You Provide</h3>
                <p className="mb-3">We collect information that you voluntarily provide to us, including:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Contact information (name, email address, phone number)</li>
                  <li>Property preferences (budget, location, property type, bedrooms, bathrooms)</li>
                  <li>Financial information (mortgage pre-approval status, income information for mortgage calculations)</li>
                  <li>Property details (if you're selling a home)</li>
                  <li>Communication preferences and history</li>
                  <li>Any other information you choose to provide in forms, chat messages, or inquiries</li>
                </ul>

                <h3 className="text-xl font-semibold text-secondary mb-3">Information Automatically Collected</h3>
                <p className="mb-3">When you visit our website, we automatically collect certain information, including:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages viewed, time spent on pages, navigation paths)</li>
                  <li>Location data (general geographic location based on IP address)</li>
                  <li>Cookies and similar tracking technologies (see our Cookie Policy below)</li>
                </ul>

                <h3 className="text-xl font-semibold text-secondary mb-3">Information from Third Parties</h3>
                <p className="mb-3">We may receive information from:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Multiple Listing Service (MLS) and real estate databases</li>
                  <li>Credit reporting agencies (with your consent)</li>
                  <li>Mortgage lenders and financial institutions (with your consent)</li>
                  <li>Public records and property databases</li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">How We Use Your Information</h2>
                <p className="mb-3">We use your personal information for the following purposes:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Provide Real Estate Services:</strong> To help you buy, sell, or lease properties, including property search, market analysis, and transaction coordination</li>
                  <li><strong>Communication:</strong> To respond to your inquiries, send property listings, and provide updates on your transactions</li>
                  <li><strong>Personalization:</strong> To recommend properties based on your preferences and search history</li>
                  <li><strong>Mortgage Calculations:</strong> To provide mortgage affordability estimates and connect you with lenders</li>
                  <li><strong>Marketing:</strong> To send you newsletters, market updates, and promotional offers (you can opt-out at any time)</li>
                  <li><strong>Analytics:</strong> To improve our website, services, and understand how visitors use our platform</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and real estate industry standards</li>
                </ul>
              </div>

              {/* How We Share Your Information */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">How We Share Your Information</h2>
                <p className="mb-3">We may share your personal information with:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Real Estate Boards and MLS:</strong> To list your property or access property listings</li>
                  <li><strong>Mortgage Lenders:</strong> With your consent, to facilitate mortgage pre-approval and financing</li>
                  <li><strong>Legal and Professional Advisors:</strong> Lawyers, accountants, and other professionals involved in your transaction</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who help us operate our website and provide services (e.g., CRM systems, email services, analytics platforms)</li>
                  <li><strong>Buyers and Sellers:</strong> To facilitate property transactions (e.g., showing requests, offers)</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights</li>
                </ul>
                <p className="mt-4">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </div>

              {/* Data Security */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Data Security</h2>
                <p className="mb-3">
                  We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Encryption of data in transit (SSL/TLS)</li>
                  <li>Secure data storage with access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p>
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>

              {/* Cookies and Tracking */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Cookies and Tracking Technologies</h2>
                <p className="mb-3">
                  We use cookies and similar tracking technologies to enhance your experience on our website:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website (Google Analytics)</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Advertising Cookies:</strong> May be used to show relevant ads (with your consent)</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our website.
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Your Privacy Rights</h2>
                <p className="mb-3">Under Canadian privacy laws, you have the following rights:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw your consent for certain uses of your information</li>
                  <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@sricollectivegroup.com or +1 (416) 786-0431.
                </p>
              </div>

              {/* Data Retention */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Real estate transaction records may be retained for up to 7 years to comply with legal and regulatory requirements.
                </p>
              </div>

              {/* Third-Party Links */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Third-Party Websites</h2>
                <p>
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Children's Privacy</h2>
                <p>
                  Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. The updated version will be indicated by the "Last Updated" date at the top of this page. We encourage you to review this policy periodically for any changes.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Contact Us</h2>
                <p className="mb-3">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-cream p-6 rounded-lg">
                  <p className="font-semibold text-secondary mb-2">Sri Collective Group</p>
                  <p>Email: privacy@sricollectivegroup.com</p>
                  <p>Phone: +1 (416) 786-0431</p>
                  <p>Address: Greater Toronto Area, Ontario, Canada</p>
                </div>
              </div>

              {/* Complaint Process */}
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Privacy Complaints</h2>
                <p className="mb-3">
                  If you have concerns about how we handle your personal information, please contact us first. If you are not satisfied with our response, you may file a complaint with the Office of the Privacy Commissioner of Canada:
                </p>
                <div className="bg-cream p-6 rounded-lg">
                  <p className="font-semibold text-secondary mb-2">Office of the Privacy Commissioner of Canada</p>
                  <p>Website: www.priv.gc.ca</p>
                  <p>Toll-free: 1-800-282-1376</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
