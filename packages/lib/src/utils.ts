import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Price threshold to distinguish sales from leases
 * Properties under this amount are likely rentals (monthly rent)
 */
export const LEASE_PRICE_THRESHOLD = 10000

/**
 * Format price as full currency string (e.g., "$1,500,000")
 */
export function formatPrice(price: number, currency = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format price as compact string (e.g., "$1.5M", "$500K")
 * Useful for sliders and compact UI elements
 */
export function formatPriceCompact(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `$${Math.round(price / 1000)}K`
  return `$${price}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Sleep for a given number of milliseconds
 * Useful for retry logic and rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse a currency string into a number
 * Handles: $100,000 | 100k | 1.5M | plain numbers
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/[$,]/g, '').trim().toLowerCase()
  if (cleaned.endsWith('m')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000000
  }
  if (cleaned.endsWith('k')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000
  }
  return parseFloat(cleaned) || 0
}

/**
 * Format a number as CAD currency string (e.g., "$1,500,000")
 */
export function formatCurrency(value: number, options?: { decimals?: number }): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: options?.decimals ?? 0,
    maximumFractionDigits: options?.decimals ?? 0,
  }).format(value)
}
