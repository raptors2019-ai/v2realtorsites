import type { Metadata } from 'next'
import { Header, Footer, ChatbotWidget } from '@repo/ui'
import type { HeaderConfig, FooterConfig } from '@repo/ui'
import { GoogleTagManager } from '@next/third-parties/google'
import { CookieConsent } from '@repo/analytics'
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
    { label: 'Properties', href: '/properties' },
    { label: 'Sell Your House', href: '/sell' },
    { label: 'About', href: '/about' },
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
    { name: 'Sri Kathiravelu', phone: '+1 (416) 786-0431' },
    { name: 'Niru Arulselvan', phone: '+1 (416) 786-0431' },
  ],
  quickLinks: [
    { name: 'Properties', href: '/properties' },
    { name: 'Sell Your House', href: '/sell' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Initialize Google Consent Mode BEFORE GTM */}
        <Script id="consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Header config={headerConfig} />
        <main className="pt-16">
          {children}
        </main>
        <Footer config={footerConfig} />
        <ChatbotWidget />
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <CookieConsent />
      </body>
    </html>
  )
}
