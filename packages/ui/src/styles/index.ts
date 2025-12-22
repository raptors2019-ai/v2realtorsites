import type { ThemeConfig } from '../types/theme'

export const themes: Record<string, ThemeConfig> = {
  newhomeshow: {
    name: 'newhomeshow',
    displayName: 'NewHomeShow',
    primaryColor: '#D4AF37', // Gold
    secondaryColor: '#000000', // Black
    accentColor: '#C9A962', // Muted Gold
    supportsDarkMode: true,
  },
  'sri-collective': {
    name: 'sri-collective',
    displayName: 'Sri Collective',
    primaryColor: '#2563eb', // Blue
    secondaryColor: '#1a1a2e', // Navy
    accentColor: '#dc2626', // Red
    supportsDarkMode: false,
  },
} as const
