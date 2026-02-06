import Link from 'next/link'

export interface MLSDisclaimerConfig {
  oreaText: string
  realtorText: string
  oreaLogoSrc?: string
  realtorLogoSrc?: string
}

export interface FooterConfig {
  siteName: string
  logoFirstPart?: string
  logoSecondPart?: string
  logoSecondPartClass?: string
  description?: string
  socialLinks?: Array<{
    platform: string
    url: string
    icon: React.ReactNode
  }>
  quickLinks?: Array<{
    name: string
    href: string
  }>
  services?: Array<{
    name: string
    href: string
  }>
  teamMembers?: Array<{
    name: string
    title?: string
    instagram?: string
    phone?: string
    image?: string
  }>
  teamGroupImage?: string
  contactInfo?: {
    phone?: string
    email?: string
    hours?: string[]
  }
  tagline?: string
  disclaimer?: string
  mlsDisclaimer?: MLSDisclaimerConfig
}

export interface FooterProps {
  config: FooterConfig
}

export function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1a1a2e] relative overflow-hidden">
      {/* Subtle accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-wider text-white">
                {config.logoFirstPart && config.logoSecondPart ? (
                  <>
                    {config.logoFirstPart}
                    <span className={config.logoSecondPartClass || 'text-gradient-primary'}>
                      {config.logoSecondPart}
                    </span>
                  </>
                ) : (
                  <span className="text-gradient-primary">{config.siteName}</span>
                )}
              </span>
            </Link>
            {config.description && (
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {config.description}
              </p>
            )}
            {config.socialLinks && config.socialLinks.length > 0 && (
              <div className="flex gap-3">
                {config.socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:text-white hover:bg-primary hover:border-primary transition-all duration-300"
                    aria-label={social.platform}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {config.quickLinks && config.quickLinks.length > 0 && (
            <div>
              <h4 className="text-primary font-semibold uppercase tracking-wider text-sm mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {config.quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {config.services && config.services.length > 0 && (
            <div>
              <h4 className="text-primary font-semibold uppercase tracking-wider text-sm mb-6">
                Services
              </h4>
              <ul className="space-y-3">
                {config.services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Team Members */}
          {config.teamMembers && config.teamMembers.length > 0 && (
            <div>
              <h4 className="text-primary font-semibold uppercase tracking-wider text-sm mb-6">
                Our Team
              </h4>
              {/* Team Group Image */}
              {config.teamGroupImage && (
                <div className="mb-6">
                  <img
                    src={config.teamGroupImage}
                    alt="Our Team"
                    className="w-full h-40 object-cover object-top rounded-xl border border-white/10"
                  />
                </div>
              )}
              <div className="space-y-4">
                {config.teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:border-primary/40 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {member.image && (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover object-top border-2 border-primary/30"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">
                          {member.name}
                        </p>
                        {member.title && (
                          <p className="text-xs text-primary/80 mt-0.5">
                            {member.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={member.image ? 'mt-3 pl-15' : ''}>
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 transition-colors block"
                        >
                          {member.instagram.includes('instagram.com')
                            ? `@${member.instagram.split('/').pop()?.replace('/', '')}`
                            : member.instagram}
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="text-xs text-gray-400 hover:text-primary transition-colors block mt-1"
                        >
                          {member.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info (when no team members) */}
          {config.contactInfo && !config.teamMembers?.length && (
            <div>
              <h4 className="text-primary font-semibold uppercase tracking-wider text-sm mb-6">
                Contact Us
              </h4>
              <div className="space-y-4">
                {config.contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <a
                      href={`tel:${config.contactInfo.phone}`}
                      className="text-gray-300 hover:text-primary transition-colors text-sm"
                    >
                      {config.contactInfo.phone}
                    </a>
                  </div>
                )}
                {config.contactInfo.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a
                      href={`mailto:${config.contactInfo.email}`}
                      className="text-gray-300 hover:text-primary transition-colors text-sm"
                    >
                      {config.contactInfo.email}
                    </a>
                  </div>
                )}
                {config.contactInfo.hours && config.contactInfo.hours.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {config.contactInfo.hours.map((hour, idx) => (
                        <p key={idx}>{hour}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MLS Disclaimer */}
        {config.mlsDisclaimer && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h4 className="text-primary font-semibold uppercase tracking-wider text-sm mb-6">
              MLS® Disclaimer
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* OREA Disclaimer */}
              <div className="flex gap-4">
                {config.mlsDisclaimer.oreaLogoSrc && (
                  <img
                    src={config.mlsDisclaimer.oreaLogoSrc}
                    alt="Ontario Regional"
                    className="w-24 h-auto object-contain flex-shrink-0"
                  />
                )}
                <p className="text-gray-400 text-xs leading-relaxed">
                  {config.mlsDisclaimer.oreaText}
                </p>
              </div>
              {/* REALTOR Disclaimer */}
              <div className="flex gap-4">
                {config.mlsDisclaimer.realtorLogoSrc && (
                  <img
                    src={config.mlsDisclaimer.realtorLogoSrc}
                    alt="REALTOR®"
                    className="w-16 h-auto object-contain flex-shrink-0"
                  />
                )}
                <p className="text-gray-400 text-xs leading-relaxed">
                  {config.mlsDisclaimer.realtorText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8" />
        {config.disclaimer && (
          <p className="text-gray-500 text-xs text-center mb-6 max-w-3xl mx-auto leading-relaxed">
            {config.disclaimer}
          </p>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} {config.siteName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="text-gray-500 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {config.tagline || 'Real Estate Professionals • Ontario, Canada'}
          </p>
        </div>
      </div>
    </footer>
  )
}
