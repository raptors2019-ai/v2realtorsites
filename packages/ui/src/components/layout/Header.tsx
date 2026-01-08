'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '../ThemeToggle'

export interface HeaderConfig {
  siteName: string
  logoFirstPart?: string
  logoSecondPart?: string
  logoSecondPartClass?: string
  navigation: Array<{
    href: string
    label: string
  }>
  ctaButton?: {
    text: string
    href: string
  }
}

export interface HeaderProps {
  config: HeaderConfig
  enableDarkMode?: boolean
}

export function Header({ config, enableDarkMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className={`bg-white/98 dark:bg-secondary/98 backdrop-blur-xl border-b sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-primary/20 dark:border-primary/20 shadow-lg shadow-black/5'
          : 'border-black/5 dark:border-white/5'
      }`}
    >
      {/* Premium accent line at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-3xl md:text-3xl font-bold tracking-wide transition-all duration-300 group-hover:scale-[1.02]">
              {config.logoFirstPart && (
                <span className="text-secondary dark:text-white transition-colors duration-300">
                  {config.logoFirstPart}
                </span>
              )}
              {config.logoSecondPart && (
                <span
                  className={
                    config.logoSecondPartClass ||
                    'text-gradient-primary transition-colors duration-300'
                  }
                >
                  {config.logoSecondPart}
                </span>
              )}
              {!config.logoFirstPart && !config.logoSecondPart && (
                <span className="text-gradient-primary">{config.siteName}</span>
              )}
            </span>
          </Link>

          {/* Desktop Navigation - Right Side */}
          <div className="header-desktop-nav">
            {enableDarkMode && <ThemeToggle />}
            {config.navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium group"
              >
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive(link.href)
                      ? 'text-primary dark:text-primary'
                      : 'text-[#57534e] dark:text-gray-300 group-hover:text-secondary dark:group-hover:text-white'
                  }`}
                >
                  {link.label}
                </span>
                {/* Underline animation - uses theme primary color */}
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ease-out ${
                    isActive(link.href) ? 'w-5' : 'w-0 group-hover:w-5'
                  }`}
                  style={{ background: 'var(--primary)' }}
                />
                {/* Background hover effect - Brighter golden yellow */}
                <span className="absolute inset-0 rounded-lg border-2 border-[#EAB308]/40 bg-gradient-to-br from-[#EAB308]/15 to-[#F59E0B]/10 dark:from-[#EAB308]/20 dark:to-[#F59E0B]/15 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out -z-10" />
              </Link>
            ))}
            {config.ctaButton && (
              <Link
                href={config.ctaButton.href}
                className="relative ml-3 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-secondary hover:bg-secondary-light overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5"
              >
                <span className="relative z-10">{config.ctaButton.text}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="header-mobile-btn relative w-10 h-10 items-center justify-center rounded-lg hover:bg-[#faf9f7] dark:hover:bg-secondary-light transition-colors duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-secondary dark:bg-white rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-secondary dark:bg-white rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0 scale-0' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-secondary dark:bg-white rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`header-mobile-menu overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-4 pb-2 border-t border-primary/20 dark:border-primary/20 mt-4">
            <div className="flex flex-col space-y-1">
              {config.navigation.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/5 dark:bg-primary/10'
                      : 'text-[#57534e] dark:text-gray-300 hover:text-secondary dark:hover:text-white hover:bg-[#faf9f7] dark:hover:bg-secondary-light'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {config.ctaButton && (
                <Link
                  href={config.ctaButton.href}
                  className="mx-4 mt-2 px-5 py-3 rounded-lg text-sm font-medium text-center text-white bg-secondary hover:bg-secondary-light hover:shadow-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    transitionDelay: mobileMenuOpen
                      ? `${config.navigation.length * 50}ms`
                      : '0ms',
                  }}
                >
                  {config.ctaButton.text}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
