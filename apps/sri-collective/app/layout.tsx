import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header, Footer, ChatbotWidget } from '@repo/ui'
import type { HeaderConfig, FooterConfig } from '@repo/ui'
import { GoogleTagManager } from '@next/third-parties/google'
import { CookieConsent, PageViewTracker } from '@repo/analytics'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sri Collective Group - Real Estate Experts in GTA',
  description: 'Your trusted real estate team serving Toronto, Mississauga, Brampton and surrounding areas',
}

const headerConfig: HeaderConfig = {
  siteName: 'Sri Collective Group',
  logoFirstPart: 'Sri',
  logoSecondPart: 'Collective',
  logoSecondPartClass: 'text-gradient-primary',
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/properties' },
    { label: 'Contact', href: '/contact' },
  ],
}

const footerConfig: FooterConfig = {
  siteName: 'Sri Collective Group',
  logoFirstPart: 'Sri',
  logoSecondPart: 'Collective',
  logoSecondPartClass: 'text-gradient-primary',
  description: 'Your trusted real estate team serving Toronto, Mississauga, Brampton and surrounding areas.',
  teamMembers: [
    { name: 'Sri Kathiravelu', phone: '416-305-1111' },
    { name: 'Niru Arulselvan', phone: '+1 (416) 786-0431' },
  ],
  quickLinks: [
    { name: 'Properties', href: '/properties' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  mlsDisclaimer: {
    oreaText: 'Data provided by the Ontario Regional Technology & Information Systems. The information is deemed reliable, but is not guaranteed. Not intended to solicit buyers or sellers, landlords or tenants currently under contract. The trademarks REALTOR®, REALTORS® and the REALTOR® logo are controlled by The Canadian Real Estate Association (CREA) and identify real estate professionals who are members of CREA. The trademarks MLS®, Multiple Listing Service® and the associated logos are owned by The Canadian Real Estate Association (CREA) and identify the quality of services provided by real estate professionals who are members of CREA.',
    realtorText: 'All information deemed reliable but not guaranteed. All properties are subject to prior sale, change or withdrawal. Neither listing broker(s) or information provider(s) shall be responsible for any typographical errors, misinformation, misprints and shall be held totally harmless. Listing(s) information is provided for consumer\'s personal, non-commercial use and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing. The data relating to real estate for sale on this website comes in part from the Internet Data Exchange (IDX) program.',
    oreaLogoSrc: '/images/orea-logo.png',
    realtorLogoSrc: '/images/realtor-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Initialize Google Consent Mode v2 BEFORE GTM */}
        <Script id="consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'functionality_storage': 'granted',
              'personalization_storage': 'granted',
              'security_storage': 'granted',
              'wait_for_update': 500
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Header config={headerConfig} />
        <main>
          {children}
        </main>
        <Footer config={footerConfig} />
        <ChatbotWidget />
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <CookieConsent />
      </body>
    </html>
  )
}
