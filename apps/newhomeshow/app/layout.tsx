import type { Metadata } from 'next'
import { Header, Footer, ChatbotWidget, ThemeProvider } from '@repo/ui'
import type { HeaderConfig, FooterConfig } from '@repo/ui'
import { GoogleTagManager } from '@next/third-parties/google'
import { CookieConsent } from '@repo/analytics'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'NewHomeShow - Pre-Construction Homes in GTA',
  description: 'Exclusive pre-construction projects from top builders in Toronto and GTA',
}

const headerConfig: HeaderConfig = {
  siteName: 'NewHomeShow',
  logoFirstPart: 'New',
  logoSecondPart: 'HomeShow',
  logoSecondPartClass: 'text-gradient-primary',
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/builder-projects' },
    { label: 'Contact', href: '/contact' },
  ],
  ctaButton: {
    text: 'Get Started',
    href: '/contact',
  },
}

const footerConfig: FooterConfig = {
  siteName: 'NewHomeShow',
  logoFirstPart: 'New',
  logoSecondPart: 'HomeShow',
  logoSecondPartClass: 'text-gradient-primary',
  description: 'Your trusted partner for pre-construction homes in the Greater Toronto Area.',
  teamMembers: [
    { name: 'Sri Kathiravelu', phone: '+1 (416) 786-0431' },
    { name: 'Niru Arulselvan', phone: '+1 (416) 786-0431' },
  ],
  quickLinks: [
    { name: 'Properties', href: '/properties' },
    { name: 'Builder Projects', href: '/builder-projects' },
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Header config={headerConfig} enableDarkMode={true} />
          <main className="pt-16">
            {children}
          </main>
          <Footer config={footerConfig} />
          <ChatbotWidget />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <CookieConsent />
      </body>
    </html>
  )
}
